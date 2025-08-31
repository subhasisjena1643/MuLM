# Deployment Guide

This guide covers various deployment options for µLM AI Playground.

## Quick Deploy Options

### Vercel (Recommended for Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/mulm-ai-playground)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
VITE_OPENAI_API_KEY=your_openai_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/mulm-ai-playground)

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/mulm-ai-playground)

## Local Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Serve with any static server
npx serve dist
```

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_OPENAI_API_KEY=${OPENAI_API_KEY}
      - VITE_ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
    restart: unless-stopped
```

### Build and Run

```bash
# Build Docker image
docker build -t mulm-ai-playground .

# Run container
docker run -p 3000:80 \
  -e VITE_OPENAI_API_KEY=your_key \
  -e VITE_ANTHROPIC_API_KEY=your_key \
  mulm-ai-playground

# Or use docker-compose
docker-compose up -d
```

## Kubernetes Deployment

### Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mulm-ai-playground
  labels:
    app: mulm-ai-playground
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mulm-ai-playground
  template:
    metadata:
      labels:
        app: mulm-ai-playground
    spec:
      containers:
      - name: mulm-ai-playground
        image: your-registry/mulm-ai-playground:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: openai-key
        - name: VITE_ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: anthropic-key
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: mulm-ai-playground-service
spec:
  selector:
    app: mulm-ai-playground
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mulm-ai-playground-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: mulm-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mulm-ai-playground-service
            port:
              number: 80
```

### Deploy to Kubernetes

```bash
# Create secrets for API keys
kubectl create secret generic api-secrets \
  --from-literal=openai-key=your_openai_key \
  --from-literal=anthropic-key=your_anthropic_key

# Apply deployment
kubectl apply -f k8s-deployment.yaml

# Check status
kubectl get pods -l app=mulm-ai-playground
kubectl get services
```

## AWS Deployment

### AWS S3 + CloudFront

```bash
# Build for production
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### AWS Amplify

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Environment Variables

### Required Variables

```bash
# OpenAI API Key
VITE_OPENAI_API_KEY=sk-...

# Anthropic API Key  
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Environment
VITE_APP_ENV=production

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### Optional Variables

```bash
# Custom API endpoints
VITE_API_BASE_URL=https://api.your-domain.com

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_TUTORIALS=true

# Branding
VITE_APP_NAME="Your Custom Name"
VITE_APP_DESCRIPTION="Your custom description"
```

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize images
npm install --save-dev @squoosh/lib
# Add image optimization to build process
```

### CDN Configuration

```nginx
# nginx.conf for CDN
server {
    listen 80;
    server_name your-domain.com;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 9;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Monitoring and Logging

### Health Checks

```javascript
// Add to vite.config.ts
export default defineConfig({
  // ... other config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'framer-motion'],
          flow: ['reactflow']
        }
      }
    }
  }
});
```

### Error Tracking

```bash
# Add Sentry for error tracking
npm install @sentry/react @sentry/tracing

# Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.VITE_APP_ENV,
});
```

## Troubleshooting

### Common Issues

1. **Build fails with memory error**
   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

2. **Environment variables not loaded**
   ```bash
   # Ensure variables start with VITE_
   # Check .env.local exists and is not in .gitignore
   ```

3. **Routing issues in production**
   ```nginx
   # Add fallback to index.html for SPAs
   try_files $uri $uri/ /index.html;
   ```

### Support

For deployment issues:
- Check [GitHub Issues](https://github.com/your-username/mulm-ai-playground/issues)
- Join our [Discord](https://discord.gg/mulm-ai-playground)
- Email: support@mulm-playground.com
