// @ts-nocheck
import { 
  ResourceAllocation, 
  ResourceRequirements, 
  ResourceUtilization,
  ScalingStatus,
  ResourceNeeds 
} from '../types/ExecutionTypes';

export class ResourceManager {
  private allocations = new Map<string, ResourceAllocation>();
  private monitoring = new Map<string, ReturnType<typeof setInterval>>();
  private systemResources: ResourceNeeds = {
    memory: 8192, // MB
    cpu: 8, // cores
    storage: 100000, // MB
    network: 1000, // MB/s
    customRequirements: {}
  };

  constructor() {
    console.log('📊 Resource Manager initialized');
  }

  async allocateResources(requirements: ResourceRequirements): Promise<ResourceAllocation> {
    console.log('🔧 Allocating resources:', requirements);
    
    // Calculate optimal allocation
    const allocated: ResourceNeeds = {
      memory: Math.min(requirements.totalMemory, this.systemResources.memory * 0.8),
      cpu: Math.min(requirements.cpuCores, this.systemResources.cpu * 0.8),
      storage: Math.min(requirements.storage, this.systemResources.storage * 0.5),
      network: Math.min(requirements.networkBandwidth, this.systemResources.network * 0.8),
      customRequirements: {}
    };

    const available: ResourceNeeds = {
      memory: this.systemResources.memory - allocated.memory,
      cpu: this.systemResources.cpu - allocated.cpu,
      storage: this.systemResources.storage - allocated.storage,
      network: this.systemResources.network - allocated.network,
      customRequirements: {}
    };

    const allocation: ResourceAllocation = {
      allocated,
      available,
      utilization: {
        memory: 0,
        cpu: 0,
        storage: 0,
        network: 0,
        timestamp: new Date()
      },
      scaling: {
        isScaling: false,
        direction: 'none',
        trigger: '',
        nextEvaluation: new Date(Date.now() + 30000)
      }
    };

    return allocation;
  }

  async releaseResources(allocation: ResourceAllocation): Promise<void> {
    console.log('🔓 Releasing resources');
    // Implementation would free up allocated resources
  }

  startMonitoring(executionId: string, allocation: ResourceAllocation): void {
    console.log(`👁️ Starting resource monitoring for: ${executionId}`);
    
    const interval = setInterval(() => {
      this.updateResourceUtilization(allocation);
      this.checkScalingNeeds(allocation);
    }, 5000); // Check every 5 seconds

    this.monitoring.set(executionId, interval);
  }

  async stopMonitoring(executionId: string): Promise<void> {
    const interval = this.monitoring.get(executionId);
    if (interval) {
      clearInterval(interval);
      this.monitoring.delete(executionId);
      console.log(`🛑 Stopped resource monitoring for: ${executionId}`);
    }
  }

  private updateResourceUtilization(allocation: ResourceAllocation): void {
    // Simulate resource utilization monitoring
    allocation.utilization = {
      memory: Math.random() * 80 + 10, // 10-90%
      cpu: Math.random() * 70 + 20,    // 20-90%
      storage: Math.random() * 30 + 5,  // 5-35%
      network: Math.random() * 50 + 10, // 10-60%
      timestamp: new Date()
    };
  }

  private checkScalingNeeds(allocation: ResourceAllocation): void {
    const util = allocation.utilization;
    
    // Check if scaling up is needed
    if (util.memory > 80 || util.cpu > 80) {
      if (!allocation.scaling.isScaling) {
        allocation.scaling = {
          isScaling: true,
          direction: 'up',
          trigger: `High resource utilization: CPU ${util.cpu.toFixed(1)}%, Memory ${util.memory.toFixed(1)}%`,
          nextEvaluation: new Date(Date.now() + 60000)
        };
        console.log('📈 Resource scaling up triggered:', allocation.scaling.trigger);
      }
    }
    // Check if scaling down is possible
    else if (util.memory < 30 && util.cpu < 30) {
      if (!allocation.scaling.isScaling) {
        allocation.scaling = {
          isScaling: true,
          direction: 'down',
          trigger: `Low resource utilization: CPU ${util.cpu.toFixed(1)}%, Memory ${util.memory.toFixed(1)}%`,
          nextEvaluation: new Date(Date.now() + 120000)
        };
        console.log('📉 Resource scaling down triggered:', allocation.scaling.trigger);
      }
    } else {
      allocation.scaling.isScaling = false;
      allocation.scaling.direction = 'none';
    }
  }
}
