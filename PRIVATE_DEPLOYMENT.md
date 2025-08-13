# Private Repository Deployment Guide

This guide shows you how to deploy your private Git repository to Render (backend) and Vercel (frontend) while maintaining repository privacy.

## 🔒 **Repository Privacy Benefits**

- ✅ **Code remains private** - Only you and collaborators can see it
- ✅ **Secure deployments** - Render and Vercel can still access for deployment
- ✅ **Team collaboration** - Add specific users as collaborators
- ✅ **Professional appearance** - Private repos look more professional

## 🚀 **Deployment Architecture**

```
Private GitHub Repo
├── Frontend (React) → Vercel
└── Backend (Node.js) → Render
```

## 📋 **Step-by-Step Setup**

### **Step 1: Make Repository Private**

```bash
# Using GitHub CLI
gh repo edit --visibility private

# Or manually:
# 1. Go to repository Settings
# 2. General → Danger Zone
# 3. Change repository visibility → Make private
```

### **Step 2: Deploy Backend to Render**

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Account** (if not already connected)
4. **Select your private repository**
5. **Configure the service:**

   ```yaml
   Name: handmade-store-backend
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   Plan: Free (or choose paid plan)
   ```

6. **Set Environment Variables:**
   ```
   NODE_ENV = production
   PORT = 10000
   JWT_SECRET = your-secret-key-here
   CORS_ORIGIN = https://your-frontend.vercel.app
   ```

7. **Click "Create Web Service"**

### **Step 3: Deploy Frontend to Vercel**

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your private repository**
4. **Configure the project:**

   ```json
   Framework Preset: Create React App
   Root Directory: ./
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

5. **Set Environment Variables:**
   ```
   REACT_APP_API_URL = https://your-backend-name.onrender.com
   ```

6. **Click "Deploy"**

### **Step 4: Update Configuration Files**

1. **Update `render.yaml`:**
   - Change `handmade-store-backend` to your actual service name
   - Update `CORS_ORIGIN` with your Vercel domain

2. **Update `vercel.json`:**
   - Change `your-backend-name.onrender.com` to your actual Render backend URL

## 👥 **Adding Collaborators (Optional)**

### **GitHub Collaborators**
```bash
# Add specific users
gh repo add-collaborator username --permission write

# Permission levels:
# - Read: Can view and clone
# - Write: Can push code and deploy
# - Admin: Full access
```

### **Team Access**
1. **Go to repository Settings → Collaborators and teams**
2. **Click "Add people"**
3. **Enter username or email**
4. **Choose permission level**
5. **Send invitation**

## 🔧 **Configuration Files**

### **render.yaml** (Backend)
```yaml
services:
  - type: web
    name: your-backend-name
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        value: https://your-frontend.vercel.app
```

### **vercel.json** (Frontend)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-name.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🔍 **Testing Your Deployment**

### **Backend Health Check**
```bash
curl https://your-backend-name.onrender.com/api/health
```

### **Frontend API Connection**
1. Visit your Vercel frontend URL
2. Check browser console for API connection
3. Test API calls from frontend

## 🚨 **Common Issues & Solutions**

### **CORS Errors**
- Ensure `CORS_ORIGIN` is set correctly in Render
- Check that frontend URL matches exactly

### **Build Failures**
- Verify Node.js version compatibility
- Check build commands in deployment settings

### **Environment Variables**
- Ensure all required variables are set
- Check variable names match your code

## 💰 **Cost Considerations**

### **Render (Backend)**
- **Free Plan**: 750 hours/month, sleeps after 15 min inactivity
- **Paid Plans**: Starting at $7/month for always-on service

### **Vercel (Frontend)**
- **Free Plan**: Unlimited deployments, 100GB bandwidth/month
- **Pro Plan**: $20/month for team features

## 🔐 **Security Best Practices**

1. **Keep repository private**
2. **Use environment variables for secrets**
3. **Regular dependency updates**
4. **Monitor deployment logs**
5. **Set up security alerts**

## 📱 **Monitoring & Maintenance**

### **Render Monitoring**
- Service logs in dashboard
- Health check status
- Performance metrics

### **Vercel Monitoring**
- Build status
- Performance analytics
- Error tracking

## 🆘 **Need Help?**

- **Render Support**: [docs.render.com](https://docs.render.com/)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Support**: [docs.github.com](https://docs.github.com/)

## 🎯 **Next Steps**

After successful deployment:
1. **Test all functionality**
2. **Set up custom domains** (optional)
3. **Configure monitoring**
4. **Set up CI/CD** (optional)
5. **Add team members** as needed 