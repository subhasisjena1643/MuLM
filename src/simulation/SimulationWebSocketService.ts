// WebSocket Service for Real-Time Simulation Updates
// Professional WebSocket implementation with auto-reconnection and message queuing

export interface SimulationMessage {
  type: 'state_update' | 'metrics_update' | 'node_update' | 'error' | 'log' | 'alert';
  timestamp: number;
  data: any;
  nodeId?: string;
  sessionId: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageQueueSize: number;
}

export class SimulationWebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private messageQueue: SimulationMessage[] = [];
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private sessionId: string;
  private listeners: Map<string, Set<(data: any, nodeId?: string) => void>> = new Map();
  private isConnecting = false;
  private isConnected = false;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8080/simulation',
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      messageQueueSize: config.messageQueueSize || 100,
      ...config
    };
    
    this.sessionId = this.generateSessionId();
    this.initializeEventTypes();
  }

  private generateSessionId(): string {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeEventTypes(): void {
    // Initialize listener sets for each message type
    const eventTypes = ['state_update', 'metrics_update', 'node_update', 'error', 'log', 'alert', 'connected', 'disconnected'];
    eventTypes.forEach(type => {
      this.listeners.set(type, new Set());
    });
  }

  public connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        this.ws = new WebSocket(this.config.url);

        const connectTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Send session initialization
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
              type: 'state_update',
              timestamp: Date.now(),
              data: { action: 'session_init', sessionId: this.sessionId },
              sessionId: this.sessionId
            }));
          }

          // Start heartbeat
          this.startHeartbeat();

          // Process queued messages
          this.processMessageQueue();

          // Emit connected event
          this.emit('connected', { sessionId: this.sessionId });

          console.log(`[SimulationWS] Connected with session: ${this.sessionId}`);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SimulationMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[SimulationWS] Failed to parse message:', error);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout);
          this.isConnecting = false;
          this.isConnected = false;
          this.stopHeartbeat();
          
          console.log(`[SimulationWS] Connection closed: ${event.code} - ${event.reason}`);
          this.emit('disconnected', { code: event.code, reason: event.reason });

          // Attempt reconnection if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout);
          this.isConnecting = false;
          console.error('[SimulationWS] WebSocket error:', error);
          
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            reject(error);
          }
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.ws.close(1000, 'Client disconnect');
    }

    this.isConnected = false;
    this.reconnectAttempts = this.config.maxReconnectAttempts; // Prevent auto-reconnect
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`[SimulationWS] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[SimulationWS] Reconnect failed:', error);
      });
    }, delay) as unknown as number;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'state_update',
          timestamp: Date.now(),
          data: { action: 'heartbeat' },
          sessionId: this.sessionId
        }));
      }
    }, this.config.heartbeatInterval) as unknown as number;
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleMessage(message: SimulationMessage): void {
    // Handle special system messages
    if (message.type === 'state_update' && message.data?.action === 'pong') {
      // Heartbeat response - connection is alive
      return;
    }

    // Emit to specific listeners
    this.emit(message.type, message.data, message.nodeId);

    // Log message for debugging
    if (message.type === 'error') {
      console.error('[SimulationWS] Server error:', message.data);
    } else if (message.type === 'log') {
      console.log('[SimulationWS] Server log:', message.data);
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.ws.send(JSON.stringify(message));
    }
  }

  public sendMessage(message: Omit<SimulationMessage, 'sessionId'>): boolean {
    const fullMessage: SimulationMessage = {
      ...message,
      sessionId: this.sessionId
    };

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(fullMessage));
        return true;
      } catch (error) {
        console.error('[SimulationWS] Failed to send message:', error);
        this.queueMessage(fullMessage);
        return false;
      }
    } else {
      this.queueMessage(fullMessage);
      return false;
    }
  }

  private queueMessage(message: SimulationMessage): void {
    // Remove oldest messages if queue is full
    while (this.messageQueue.length >= this.config.messageQueueSize) {
      this.messageQueue.shift();
    }
    
    this.messageQueue.push(message);
  }

  public on(event: string, listener: (data: any, nodeId?: string) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public off(event: string, listener: (data: any, nodeId?: string) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  private emit(event: string, data: any, nodeId?: string): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data, nodeId);
        } catch (error) {
          console.error(`[SimulationWS] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Simulation-specific methods
  public sendSimulationStart(workflowData: any): void {
    this.sendMessage({
      type: 'state_update',
      timestamp: Date.now(),
      data: {
        action: 'start_simulation',
        workflow: workflowData
      }
    });
  }

  public sendSimulationStop(): void {
    this.sendMessage({
      type: 'state_update',
      timestamp: Date.now(),
      data: {
        action: 'stop_simulation'
      }
    });
  }

  public sendSimulationPause(): void {
    this.sendMessage({
      type: 'state_update',
      timestamp: Date.now(),
      data: {
        action: 'pause_simulation'
      }
    });
  }

  public sendSimulationStep(): void {
    this.sendMessage({
      type: 'state_update',
      timestamp: Date.now(),
      data: {
        action: 'step_simulation'
      }
    });
  }

  public sendSpeedChange(speed: number): void {
    this.sendMessage({
      type: 'state_update',
      timestamp: Date.now(),
      data: {
        action: 'change_speed',
        speed
      }
    });
  }

  public sendNodeBreakpoint(nodeId: string, enabled: boolean): void {
    this.sendMessage({
      type: 'node_update',
      timestamp: Date.now(),
      data: {
        action: 'set_breakpoint',
        enabled
      },
      nodeId
    });
  }

  public sendBatchTest(testConfig: any): void {
    this.sendMessage({
      type: 'state_update',
      timestamp: Date.now(),
      data: {
        action: 'start_batch_test',
        config: testConfig
      }
    });
  }

  public sendLoadTest(loadConfig: any): void {
    this.sendMessage({
      type: 'state_update',
      timestamp: Date.now(),
      data: {
        action: 'start_load_test',
        config: loadConfig
      }
    });
  }

  // Utility methods
  public getConnectionState(): 'connected' | 'connecting' | 'disconnected' {
    if (this.isConnected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }

  public getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  // Static factory method for easy initialization
  public static createDefault(): SimulationWebSocketService {
    return new SimulationWebSocketService({
      url: 'ws://localhost:8080/simulation',
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      messageQueueSize: 100
    });
  }
}

// Export singleton instance for easy use across components
export const simulationWebSocket = SimulationWebSocketService.createDefault();
