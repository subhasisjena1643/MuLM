# µLM Troubleshooting Guide - Quick Reference

## 🚨 Emergency Demo Recovery

### If Demo Completely Fails
1. **Show backup slides** with screenshots
2. **Explain the concept** while showing static mockups
3. **Use pre-recorded video** of working application
4. **Focus on innovation** rather than technical execution

### Common Demo Issues & 30-Second Fixes

#### Issue: Homepage Won't Load
```bash
# Quick fixes (try in order):
npm run dev --port 3001  # Try different port
npm install             # Reinstall dependencies
npm run build && npm run preview  # Use production build
```

#### Issue: OpenAI API Not Working
```typescript
// Enable demo mode in src/services/OpenAIEfficiencyService.ts
const DEMO_MODE = true; // Set to true for fallback responses

// Or add to .env:
VITE_DEMO_MODE=true
```

#### Issue: Blocks Won't Drag/Drop
```bash
# Check browser console for errors
# Common fix: Reload page and try again
# Fallback: Use pre-built workflow templates
```

#### Issue: Simulation Hangs
```typescript
// Reduce simulation timeout in WorkflowSimulationEngine.ts
const SIMULATION_TIMEOUT = 5000; // 5 seconds instead of 30

// Or skip simulation and show mock results
```

#### Issue: Export Not Working
```typescript
// Use fallback export in UniversalExportService.ts
if (exportFailed) {
  return generateStaticExampleCode(workflowType);
}
```

---

## 🔧 Build & Development Issues

### Build Failures

#### TypeScript Errors
```bash
# Quick fix for demo
npx tsc --noEmit --skipLibCheck

# If errors persist, temporarily disable strict mode:
# In tsconfig.json: "strict": false
```

#### Dependency Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# If still failing
npm install --legacy-peer-deps
```

#### Vite Build Issues
```bash
# Clear cache
rm -rf dist .vite node_modules/.vite
npm run build

# Fallback: Use development mode for demo
npm run dev
```

### Development Server Issues

#### Port Already in Use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- --port 3001
```

#### Hot Reload Not Working
```bash
# Restart dev server
# Check .gitignore isn't blocking files
# Disable browser cache
```

#### Environment Variables Not Loading
```bash
# Check .env file exists and format:
VITE_OPENAI_API_KEY=your_key_here

# Restart server after .env changes
```

---

## 🎯 Performance Issues

### Slow Loading
```bash
# Quick performance fixes
npm run build  # Use production build
# Disable React DevTools in browser
# Close other browser tabs
# Use Chrome for demo (best performance)
```

### Memory Issues
```bash
# Browser running out of memory
# Restart browser
# Close other applications
# Use incognito mode for clean slate
```

### Simulation Takes Too Long
```typescript
// In WorkflowSimulationEngine.ts - reduce complexity
const simulationOptions = {
  enableAIReview: false,        // Disable for speed
  deepCodeAnalysis: false,      // Disable for speed
  communityPatternMatching: false // Disable for speed
};
```

---

## 🌐 Network & API Issues

### OpenAI API Errors

#### Rate Limiting
```bash
# Wait 60 seconds and try again
# Use cached responses
# Enable demo mode with fallbacks
```

#### Invalid API Key
```bash
# Check .env file
# Regenerate key at platform.openai.com
# Use fallback responses for demo
```

#### Network Timeout
```typescript
// Increase timeout in OpenAIEfficiencyService.ts
const API_TIMEOUT = 30000; // 30 seconds

// Or use offline mode
const USE_FALLBACK_RESPONSES = true;
```

### CORS Issues
```bash
# Usually not an issue with Vite dev server
# If needed, add to vite.config.ts:
server: {
  cors: true,
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

---

## 🎨 UI/UX Issues

### Styling Problems

#### Tailwind Not Working
```bash
# Check tailwind.config.js
# Restart dev server
# Clear browser cache
```

#### Dark Mode Issues
```typescript
// Force light mode for demo stability
const [isDark, setIsDark] = useState(false);
// Comment out theme toggle functionality
```

#### Layout Breaking
```bash
# Use specific browser for demo (Chrome recommended)
# Test at exact resolution you'll present at
# Have backup screenshots ready
```

### React Flow Canvas Issues

#### Blocks Not Appearing
```bash
# Check React Flow CSS is imported
import 'reactflow/dist/style.css';

# Refresh page
# Check browser console for errors
```

#### Connections Not Working
```typescript
// Simplify for demo - use pre-connected workflows
const demoWorkflow = {
  nodes: [...],
  edges: [...]
};
```

---

## 📱 Browser-Specific Issues

### Chrome (Recommended for Demo)
- Best performance and compatibility
- DevTools available for debugging
- Good error reporting

### Firefox
- May have React Flow rendering issues
- Use Chrome if possible

### Safari
- Not recommended for demo
- CSS compatibility issues

### Edge
- Generally works well
- Good fallback option

---

## 🎯 Demo Day Checklist

### 30 Minutes Before Demo
- [ ] **Restart computer** for clean state
- [ ] **Close all unnecessary applications**
- [ ] **Test complete demo flow** from start to finish
- [ ] **Have backup plan ready** (slides, video, screenshots)

### 5 Minutes Before Demo
- [ ] **Open application** in clean browser tab
- [ ] **Prepare example prompts**:
  - "Build a sentiment analysis pipeline"
  - "Create a document Q&A system with RAG"
  - "Build an image classification workflow"
- [ ] **Test one quick workflow** to ensure everything works

### During Demo
- [ ] **Speak confidently** even if minor issues occur
- [ ] **Have fallback explanations** for each feature
- [ ] **Focus on innovation** rather than perfect execution
- [ ] **Keep backup browser tab** ready with working state

### If Things Go Wrong
1. **Stay calm** - judges understand demo environments
2. **Explain the concept** while attempting fixes
3. **Use prepared screenshots/video** if needed
4. **Pivot to showing code** and architecture
5. **Emphasize the AI innovation** and problem being solved

---

## 🔍 Debugging Commands

### System Health Check
```bash
# Quick system verification
node scripts/verify-system.js

# Check for critical issues only
npm run lint --quiet
npm run type-check
```

### Performance Check
```bash
# Quick performance test
npm run build
ls -la dist/  # Check bundle size
```

### Demo Verification
```bash
# Test core functionality
npm run dev
# Navigate to localhost:3000
# Try: prompt → generate → simulate → export
```

### Log Analysis
```bash
# Check browser console
# Look for red errors
# Note warnings but don't panic

# Check network tab
# Ensure API calls succeed
# Check for 404s or 500s
```

---

## 📞 Last Resort Options

### If Nothing Works
1. **Use static demo** with screenshots
2. **Show code architecture** and explain concepts
3. **Focus on AI innovation** and market opportunity
4. **Demo competitor analysis** and unique value proposition
5. **Present technical roadmap** and next steps

### Key Points to Emphasize
- **AI-powered workflow generation** - unique innovation
- **Visual programming interface** - like LabVIEW for AI
- **Universal export system** - multi-platform deployment
- **Real-time simulation** - immediate feedback
- **Market opportunity** - democratizing AI development

### Backup Talking Points
- **Problem**: Current AI development tools are complex
- **Solution**: Visual, prompt-driven workflow builder
- **Innovation**: AI generates custom blocks automatically
- **Market**: Growing demand for no-code AI solutions
- **Traction**: Positive user feedback, enterprise interest

---

*Remember: Judges care more about innovation and market potential than perfect technical execution*
*Your confidence and explanation matter more than flawless demo*
*Have fun and show your passion for the project!*
