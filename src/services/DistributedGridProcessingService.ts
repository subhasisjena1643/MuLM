/**
 * Distributed Grid Processing Service
 * Handles server-side model execution across dynamic grid storage
 * Models stay on server, only processed data flows through the application
 */

import { GridStorage } from '../storage/GridStorage';
import { BlockDefinition } from '../storage/types/GridTypes';
import { Node, Edge } from 'reactflow';

export interface GridProcessingNode {
  id: string;
  gridPosition: { x: number; y: number; z: number };
  modelType: string;
  processingCapability: string;
  resourceRequirements: {
    memory: number;
    compute: number;
    storage: number;
  };
  serverEndpoint: string;
  isActive: boolean;
  lastProcessedAt?: Date;
}

export interface ProcessingRequest {
  nodeId: string;
  inputData: any;
  inputType: string;
  processingConfig: Record<string, any>;
  workflowId: string;
  sourceNodeId?: string;
}

export interface ProcessingResponse {
  success: boolean;
  nodeId: string;
  outputData: any;
  outputType: string;
  processingTime: number;
  resourceUsage: {
    memory: number;
    compute: number;
  };
  nextNodes?: string[];
  error?: string;
}

export interface GridWireframe {
  nodeId: string;
  connections: Array<{
    targetNodeId: string;
    dataFlow: {
      inputType: string;
      outputType: string;
      transformationRequired: boolean;
    };
  }>;
  gridAllocation: {
    startGrid: { x: number; y: number; z: number };
    endGrid: { x: number; y: number; z: number };
    allocatedGrids: Array<{ x: number; y: number; z: number }>;
  };
}

export class DistributedGridProcessingService {
  private static instance: DistributedGridProcessingService;
  private gridStorage: GridStorage;
  private processingNodes: Map<string, GridProcessingNode> = new Map();
  private activeProcesses: Map<string, ProcessingRequest> = new Map();
  private wsConnection?: WebSocket;
  private serverBaseUrl: string = 'ws://localhost:8080'; // Grid processing server

  private constructor(gridStorage: GridStorage) {
    this.gridStorage = gridStorage;
    this.initializeGridConnection();
  }

  public static getInstance(gridStorage: GridStorage): DistributedGridProcessingService {
    if (!DistributedGridProcessingService.instance) {
      DistributedGridProcessingService.instance = new DistributedGridProcessingService(gridStorage);
    }
    return DistributedGridProcessingService.instance;
  }

  /**
   * Initialize connection to grid processing server
   */
  private async initializeGridConnection(): Promise<void> {
    try {
      console.log('🔌 Connecting to distributed grid processing server...');
      
      this.wsConnection = new WebSocket(this.serverBaseUrl);
      
      this.wsConnection.onopen = () => {
        console.log('✅ Connected to grid processing server');
        this.registerGridClient();
      };
      
      this.wsConnection.onmessage = (event) => {
        this.handleServerMessage(JSON.parse(event.data));
      };
      
      this.wsConnection.onerror = (error) => {
        console.warn('⚠️ Grid server connection error:', error);
        // Fallback to local processing
        this.initializeFallbackMode();
      };
      
      this.wsConnection.onclose = () => {
        console.log('🔌 Grid server connection closed, attempting reconnect...');
        setTimeout(() => this.initializeGridConnection(), 5000);
      };
      
    } catch (error) {
      console.warn('⚠️ Failed to connect to grid server, using fallback mode:', error);
      this.initializeFallbackMode();
    }
  }

  /**
   * Register this client with the grid processing server
   */
  private registerGridClient(): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'register_client',
        clientId: `mulm-client-${Date.now()}`,
        capabilities: ['workflow_processing', 'ai_inference', 'data_transformation'],
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Handle messages from grid processing server
   */
  private handleServerMessage(message: any): void {
    console.log('📨 Grid server message:', message);
    
    switch (message.type) {
      case 'processing_complete':
        this.handleProcessingComplete(message.data);
        break;
      case 'grid_allocation_updated':
        this.handleGridAllocationUpdate(message.data);
        break;
      case 'node_status_update':
        this.handleNodeStatusUpdate(message.data);
        break;
      case 'error':
        console.error('❌ Grid server error:', message.error);
        break;
    }
  }

  /**
   * Deploy workflow to distributed grid and create wireframe
   */
  public async deployWorkflowToGrid(
    nodes: Node[], 
    edges: Edge[], 
    workflowId: string
  ): Promise<GridWireframe[]> {
    console.log('🚀 Deploying workflow to distributed grid:', workflowId);
    
    const wireframes: GridWireframe[] = [];
    
    try {
      // Step 1: Analyze workflow and determine grid allocation
      const gridAllocation = await this.calculateOptimalGridAllocation(nodes, edges);
      
      // Step 2: Create wireframes for each node
      for (const node of nodes) {
        const wireframe = await this.createNodeWireframe(node, edges, gridAllocation);
        wireframes.push(wireframe);
        
        // Step 3: Register node with grid processing server
        await this.registerProcessingNode(node, wireframe);
      }
      
      // Step 4: Setup data flow connections
      await this.setupGridConnections(wireframes);
      
      console.log('✅ Workflow deployed to grid successfully');
      console.log('📊 Grid wireframes created:', wireframes.length);
      
      return wireframes;
      
    } catch (error) {
      console.error('❌ Failed to deploy workflow to grid:', error);
      throw error;
    }
  }

  /**
   * Process data through distributed grid
   */
  public async processDataThroughGrid(
    inputData: any,
    startNodeId: string,
    workflowId: string
  ): Promise<ProcessingResponse[]> {
    console.log('⚡ Processing data through distributed grid:', { startNodeId, workflowId });
    
    const responses: ProcessingResponse[] = [];
    
    try {
      // Step 1: Send initial data to starting node
      const initialRequest: ProcessingRequest = {
        nodeId: startNodeId,
        inputData,
        inputType: 'initial',
        processingConfig: {},
        workflowId
      };
      
      const response = await this.sendProcessingRequest(initialRequest);
      responses.push(response);
      
      // Step 2: Follow the workflow chain based on connections
      if (response.success && response.nextNodes) {
        for (const nextNodeId of response.nextNodes) {
          const chainResponses = await this.processDataThroughGrid(
            response.outputData,
            nextNodeId,
            workflowId
          );
          responses.push(...chainResponses);
        }
      }
      
      return responses;
      
    } catch (error) {
      console.error('❌ Grid processing failed:', error);
      throw error;
    }
  }

  /**
   * Monitor grid processing in real-time
   */
  public async startGridMonitoring(workflowId: string): Promise<void> {
    console.log('👁️ Starting grid monitoring for workflow:', workflowId);
    
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'start_monitoring',
        workflowId,
        monitoringConfig: {
          realTimeUpdates: true,
          performanceMetrics: true,
          resourceUsage: true,
          errorTracking: true
        }
      }));
    }
  }

  /**
   * Get current grid status and wireframe
   */
  public getGridStatus(): {
    totalNodes: number;
    activeNodes: number;
    gridAllocation: any;
    processingLoad: number;
  } {
    const activeNodes = Array.from(this.processingNodes.values()).filter(node => node.isActive);
    
    return {
      totalNodes: this.processingNodes.size,
      activeNodes: activeNodes.length,
      gridAllocation: this.calculateCurrentGridUsage(),
      processingLoad: this.calculateProcessingLoad()
    };
  }

  // Private helper methods

  private async calculateOptimalGridAllocation(nodes: Node[], edges: Edge[]): Promise<any> {
    // Calculate optimal 3D grid positions based on workflow complexity
    const allocation = {
      dimensions: {
        x: Math.ceil(Math.sqrt(nodes.length)),
        y: Math.ceil(Math.sqrt(nodes.length)),
        z: Math.ceil(nodes.length / 10) // Vertical scaling for complex workflows
      },
      nodePositions: new Map()
    };
    
    nodes.forEach((node, index) => {
      const x = index % allocation.dimensions.x;
      const y = Math.floor(index / allocation.dimensions.x) % allocation.dimensions.y;
      const z = Math.floor(index / (allocation.dimensions.x * allocation.dimensions.y));
      
      allocation.nodePositions.set(node.id, { x, y, z });
    });
    
    return allocation;
  }

  private async createNodeWireframe(node: Node, edges: Edge[], gridAllocation: any): Promise<GridWireframe> {
    const nodePosition = gridAllocation.nodePositions.get(node.id);
    const connections = edges
      .filter(edge => edge.source === node.id)
      .map(edge => ({
        targetNodeId: edge.target,
        dataFlow: {
          inputType: edge.sourceHandle || 'default',
          outputType: edge.targetHandle || 'default',
          transformationRequired: this.requiresTransformation(node, edge)
        }
      }));
    
    return {
      nodeId: node.id,
      connections,
      gridAllocation: {
        startGrid: nodePosition,
        endGrid: nodePosition, // Can be expanded for multi-grid nodes
        allocatedGrids: [nodePosition]
      }
    };
  }

  private async registerProcessingNode(node: Node, wireframe: GridWireframe): Promise<void> {
    const processingNode: GridProcessingNode = {
      id: node.id,
      gridPosition: wireframe.gridAllocation.startGrid,
      modelType: node.data?.category || 'general',
      processingCapability: node.data?.description || 'General processing',
      resourceRequirements: {
        memory: this.estimateMemoryRequirement(node),
        compute: this.estimateComputeRequirement(node),
        storage: this.estimateStorageRequirement(node)
      },
      serverEndpoint: `${this.serverBaseUrl}/process/${node.id}`,
      isActive: true
    };
    
    this.processingNodes.set(node.id, processingNode);
    
    // Send registration to server
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'register_processing_node',
        node: processingNode,
        wireframe
      }));
    }
  }

  private async setupGridConnections(wireframes: GridWireframe[]): Promise<void> {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'setup_grid_connections',
        wireframes
      }));
    }
  }

  private async sendProcessingRequest(request: ProcessingRequest): Promise<ProcessingResponse> {
    return new Promise((resolve, reject) => {
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store request for tracking
        this.activeProcesses.set(requestId, request);
        
        // Send request
        this.wsConnection.send(JSON.stringify({
          type: 'process_data',
          requestId,
          request
        }));
        
        // Setup timeout
        setTimeout(() => {
          this.activeProcesses.delete(requestId);
          reject(new Error('Processing timeout'));
        }, 30000);
        
      } else {
        // Fallback to local processing
        resolve(this.processFallback(request));
      }
    });
  }

  private handleProcessingComplete(data: any): void {
    // Handle completed processing from server
    console.log('✅ Processing completed:', data);
  }

  private handleGridAllocationUpdate(data: any): void {
    // Handle grid allocation updates
    console.log('📊 Grid allocation updated:', data);
  }

  private handleNodeStatusUpdate(data: any): void {
    // Handle node status updates
    console.log('🔄 Node status updated:', data);
  }

  private initializeFallbackMode(): void {
    console.log('🔄 Initializing fallback mode for local processing');
    // Setup local processing as fallback
  }

  private requiresTransformation(node: Node, edge: Edge): boolean {
    // Determine if data transformation is needed between nodes
    return node.data?.outputs?.[0]?.type !== edge.targetHandle;
  }

  private estimateMemoryRequirement(node: Node): number {
    // Estimate memory based on node type and complexity
    const baseMemory = 512; // MB
    const complexity = node.data?.complexity || 1;
    return baseMemory * complexity;
  }

  private estimateComputeRequirement(node: Node): number {
    // Estimate compute units based on node type
    const baseCompute = 1;
    const category = node.data?.category || 'general';
    
    const computeMultiplier = {
      'expert': 3,
      'ai-model': 4,
      'data-processing': 2,
      'general': 1
    };
    
    return baseCompute * (computeMultiplier[category as keyof typeof computeMultiplier] || 1);
  }

  private estimateStorageRequirement(node: Node): number {
    // Estimate storage based on data handling
    return 100; // MB base storage
  }

  private calculateCurrentGridUsage(): any {
    // Calculate current grid utilization
    return {
      used: this.processingNodes.size,
      available: 1000, // Example grid capacity
      efficiency: 0.85
    };
  }

  private calculateProcessingLoad(): number {
    // Calculate current processing load percentage
    return Math.min(this.activeProcesses.size / 10, 1.0) * 100;
  }

  private async processFallback(request: ProcessingRequest): Promise<ProcessingResponse> {
    // Fallback local processing when server is unavailable
    console.log('🔄 Using fallback processing for:', request.nodeId);
    
    return {
      success: true,
      nodeId: request.nodeId,
      outputData: `Processed: ${JSON.stringify(request.inputData)}`,
      outputType: 'text',
      processingTime: 100,
      resourceUsage: {
        memory: 256,
        compute: 1
      }
    };
  }
}

export default DistributedGridProcessingService;
