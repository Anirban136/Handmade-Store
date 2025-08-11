# 🚀 Deployment Guide - Handmade Store

## 📋 **Prerequisites:**
- GitHub account
- Vercel account (free)
- Render account (free)

## 🔧 **Step 1: Deploy Backend to Render**

### 1.1 Go to [render.com](https://render.com) and sign up
### 1.2 Click "New +" → "Web Service"
### 1.3 Connect your GitHub repository
### 1.4 Configure the service:
   - **Name**: `handycurv-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### 1.5 Click "Create Web Service"
### 1.6 Wait for deployment and copy the URL (e.g., `https://handycurv-backend.onrender.com`)

## 🌐 **Step 2: Deploy Frontend to Vercel**

### 2.1 Go to [vercel.com](https://vercel.com) and sign up
### 2.2 Click "New Project"
### 2.3 Import your GitHub repository
### 2.4 Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.5 Click "Deploy"
### 2.6 Wait for deployment and copy the URL (e.g., `https://handycurv.vercel.app`)

## 🔗 **Step 3: Connect Frontend to Backend**

### 3.1 In your Vercel project, go to Settings → Environment Variables
### 3.2 Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your Render backend URL (e.g., `https://handycurv-backend.onrender.com`)

### 3.3 Redeploy your frontend

## ✅ **Your website will be live at:**
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-project.onrender.com`

## 🎯 **What's Included:**
- ✅ 3 sample products
- ✅ User authentication (login/register)
- ✅ Shopping cart functionality
- ✅ Responsive design
- ✅ No database required (in-memory storage)

## 🔄 **To Update:**
- Push changes to GitHub
- Both services will auto-deploy 