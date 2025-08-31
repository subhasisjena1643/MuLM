// @ts-nocheck
/**
 * OpenAI Integration Test Suite
 * Tests for µLM AI-powered workflow generation
 */

// Test prompts to verify OpenAI integration
export const TEST_PROMPTS = [
  "Analyze customer sentiment from text reviews",
  "Build an image classification pipeline", 
  "Process documents for entity extraction",
  "Create a multimodal AI workflow for content analysis",
  "Develop a fraud detection system using ML",
  "Build a recommendation engine with collaborative filtering"
];

// Manual test instructions
export const MANUAL_TEST_STEPS = `
🧪 Manual Testing Steps for OpenAI Integration:

1. Open the workspace: http://localhost:3000/workspace
2. Check the left sidebar for:
   - ✅ AI Workflow Builder section with OpenAI badge
   - ✅ Expert Library debug info showing blocks loaded
   - ✅ AI-powered control buttons (Analyze, Custom Block)
3. Test workflow generation:
   - Enter prompt: "Analyze customer reviews for sentiment"
   - Click Generate or press Enter
   - Watch AI progress messages
   - Verify workflow appears on canvas
4. Test block library:
   - Scroll through available blocks
   - Try dragging a block to canvas
   - Verify block details show on click
5. Test AI features:
   - Click "Analyze" button (requires workflow on canvas)
   - Click "Custom Block" and describe a custom block
   - Check right sidebar for AI suggestions and chat history

Expected Results:
- ✅ Blocks load in left panel with debug info
- ✅ OpenAI generates workflows from prompts  
- ✅ Custom blocks can be generated
- ✅ Workflow analysis provides insights
- ✅ Real-time progress feedback
- ✅ Professional UI with AI indicators
`;

console.log(MANUAL_TEST_STEPS);

import { openaiWorkflowIntelligence } from '../src/services/OpenAIWorkflowIntelligence';
import { BlockDefinition } from '../src/storage/types/GridTypes';

// Mock block library for testing
const mockBlocks: BlockDefinition[] = [
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    description: 'Analyzes text sentiment using BERT',
    category: 'expert',
    version: '1.0.0',
    inputs: [{ id: 'text', name: 'Text', type: 'text', description: 'Input text', required: true }],
    outputs: [{ id: 'sentiment', name: 'Sentiment', type: 'text', description: 'Sentiment result', required: true }],
    tags: ['nlp', 'sentiment'],
    performance: { avgExecutionTime: 100, memoryUsage: 'medium' },
    errorHandling: { retryable: true, timeout: 30000 },
    config: {},
    metadata: {
      author: 'µLM Team',
      documentation: 'Sentiment analysis block',
      dependencies: ['transformers', 'torch'],
      isGenerated: false,
      tags: ['nlp'],
      category: 'expert'
    }
  }
];

describe('OpenAI Workflow Intelligence', () => {
  
  test('Service initialization', () => {
    expect(openaiWorkflowIntelligence).toBeDefined();
    const status = openaiWorkflowIntelligence.getServiceStatus();
    expect(status).toHaveProperty('configured');
    expect(status).toHaveProperty('model');
    expect(status.model).toBe('gpt-4-turbo-preview');
  });

  test('Workflow structure generation', async () => {
    const prompt = "Analyze customer feedback for sentiment and extract key insights";
    
    try {
      const workflowStructure = await openaiWorkflowIntelligence.generateWorkflowStructure(prompt, mockBlocks);
      
      // Validate structure
      expect(workflowStructure).toHaveProperty('workflow');
      expect(workflowStructure).toHaveProperty('blocks');
      expect(workflowStructure).toHaveProperty('connections');
      
      // Validate workflow metadata
      expect(workflowStructure.workflow.name).toBeTruthy();
      expect(workflowStructure.workflow.description).toBeTruthy();
      expect(['simple', 'medium', 'complex']).toContain(workflowStructure.workflow.complexity);
      
      // Validate blocks
      expect(Array.isArray(workflowStructure.blocks)).toBe(true);
      expect(workflowStructure.blocks.length).toBeGreaterThan(0);
      
      workflowStructure.blocks.forEach(block => {
        expect(block).toHaveProperty('id');
        expect(block).toHaveProperty('name');
        expect(block).toHaveProperty('type');
        expect(block).toHaveProperty('position');
        expect(['input', 'expert', 'utility', 'output']).toContain(block.type);
      });
      
      // Validate connections
      expect(Array.isArray(workflowStructure.connections)).toBe(true);
      
      console.log('✅ Workflow generation test passed');
      console.log('Generated workflow:', workflowStructure.workflow.name);
      console.log('Blocks:', workflowStructure.blocks.length);
      console.log('Connections:', workflowStructure.connections.length);
      
    } catch (error) {
      if (error.message.includes('OpenAI API key')) {
        console.warn('⚠️ OpenAI API key not configured - skipping AI tests');
        return;
      }
      throw error;
    }
  }, 30000); // 30 second timeout for API calls

  test('Custom block generation', async () => {
    const blockRequest = {
      prompt: "Create a text preprocessing block that cleans and normalizes text data",
      context: {
        existingBlocks: mockBlocks,
        workflowPurpose: "Text analysis pipeline",
        expectedInputs: ['raw_text'],
        expectedOutputs: ['clean_text'],
        performanceRequirements: ['fast', 'memory_efficient']
      }
    };
    
    try {
      const generatedBlock = await openaiWorkflowIntelligence.generateCustomBlock(blockRequest);
      
      // Validate block structure
      expect(generatedBlock).toHaveProperty('block');
      expect(generatedBlock).toHaveProperty('implementation');
      expect(generatedBlock).toHaveProperty('documentation');
      
      // Validate block definition
      const block = generatedBlock.block;
      expect(block.id).toBeTruthy();
      expect(block.name).toBeTruthy();
      expect(block.description).toBeTruthy();
      expect(Array.isArray(block.inputs)).toBe(true);
      expect(Array.isArray(block.outputs)).toBe(true);
      
      // Validate implementation
      expect(generatedBlock.implementation.pythonCode).toBeTruthy();
      expect(Array.isArray(generatedBlock.implementation.imports)).toBe(true);
      expect(Array.isArray(generatedBlock.implementation.dependencies)).toBe(true);
      
      console.log('✅ Custom block generation test passed');
      console.log('Generated block:', block.name);
      
    } catch (error) {
      if (error.message.includes('OpenAI API key')) {
        console.warn('⚠️ OpenAI API key not configured - skipping AI tests');
        return;
      }
      throw error;
    }
  }, 30000);

  test('Workflow analysis', async () => {
    // Mock nodes and edges for analysis
    const mockNodes = [
      {
        id: 'input-1',
        data: { label: 'Data Input', block: mockBlocks[0] },
        position: { x: 0, y: 0 }
      },
      {
        id: 'expert-1', 
        data: { label: 'Sentiment Analysis', block: mockBlocks[0] },
        position: { x: 200, y: 0 }
      }
    ];
    
    const mockEdges = [
      {
        id: 'edge-1',
        source: 'input-1',
        target: 'expert-1'
      }
    ];
    
    try {
      const analysis = await openaiWorkflowIntelligence.analyzeWorkflow(mockNodes, mockEdges);
      
      // Validate analysis structure
      expect(analysis).toHaveProperty('analysis');
      expect(analysis).toHaveProperty('optimizations');
      expect(analysis).toHaveProperty('potentialIssues');
      expect(analysis).toHaveProperty('performanceImprovements');
      expect(analysis).toHaveProperty('codeQuality');
      
      // Validate data types
      expect(typeof analysis.analysis).toBe('string');
      expect(Array.isArray(analysis.optimizations)).toBe(true);
      expect(Array.isArray(analysis.potentialIssues)).toBe(true);
      expect(Array.isArray(analysis.performanceImprovements)).toBe(true);
      expect(typeof analysis.codeQuality).toBe('number');
      expect(analysis.codeQuality).toBeGreaterThanOrEqual(0);
      expect(analysis.codeQuality).toBeLessThanOrEqual(100);
      
      console.log('✅ Workflow analysis test passed');
      console.log('Quality score:', analysis.codeQuality);
      
    } catch (error) {
      if (error.message.includes('OpenAI API key')) {
        console.warn('⚠️ OpenAI API key not configured - skipping AI tests');
        return;
      }
      throw error;
    }
  }, 30000);

  test('Service status and context management', () => {
    const initialStatus = openaiWorkflowIntelligence.getServiceStatus();
    
    // Test context reset
    openaiWorkflowIntelligence.resetContext();
    const afterResetStatus = openaiWorkflowIntelligence.getServiceStatus();
    
    expect(afterResetStatus.conversationLength).toBe(0);
    
    console.log('✅ Service management test passed');
  });

  test('Error handling for invalid API key', async () => {
    // This test verifies graceful error handling
    const originalApiKey = process.env.VITE_OPENAI_API_KEY;
    
    try {
      // Temporarily remove API key
      delete process.env.VITE_OPENAI_API_KEY;
      
      const prompt = "Test prompt";
      
      await expect(
        openaiWorkflowIntelligence.generateWorkflowStructure(prompt, [])
      ).rejects.toThrow('OpenAI API key not configured');
      
      console.log('✅ Error handling test passed');
      
    } finally {
      // Restore API key
      if (originalApiKey) {
        process.env.VITE_OPENAI_API_KEY = originalApiKey;
      }
    }
  });

});

// Integration test for the complete workflow
describe('End-to-End AI Workflow', () => {
  
  test('Complete workflow generation and analysis', async () => {
    if (!process.env.VITE_OPENAI_API_KEY) {
      console.warn('⚠️ Skipping E2E test - API key not configured');
      return;
    }
    
    try {
      // Step 1: Generate workflow
      const prompt = "Build a simple sentiment analysis pipeline";
      const workflow = await openaiWorkflowIntelligence.generateWorkflowStructure(prompt, mockBlocks);
      
      // Step 2: Convert to mock nodes/edges
      const nodes = workflow.blocks.map(block => ({
        id: block.id,
        data: { label: block.name, block: mockBlocks[0] },
        position: block.position
      }));
      
      const edges = workflow.connections.map((conn, i) => ({
        id: `edge-${i}`,
        source: conn.from,
        target: conn.to
      }));
      
      // Step 3: Analyze generated workflow
      const analysis = await openaiWorkflowIntelligence.analyzeWorkflow(nodes, edges);
      
      // Validate end-to-end flow
      expect(workflow.blocks.length).toBeGreaterThan(0);
      expect(analysis.codeQuality).toBeGreaterThan(0);
      
      console.log('✅ End-to-end AI workflow test passed');
      console.log(`Generated ${workflow.blocks.length} blocks with quality score ${analysis.codeQuality}`);
      
    } catch (error) {
      console.error('❌ E2E test failed:', error);
      throw error;
    }
  }, 60000); // Extended timeout for complete flow
  
});

// Export for manual testing
export { openaiWorkflowIntelligence, mockBlocks };
