# Private Repository Deployment Setup Script
# Run this script from the project root directory

Write-Host "🔒 Setting up Private Repository Deployment..." -ForegroundColor Green
Write-Host ""

# Check if git repository exists
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository. Please run 'git init' first." -ForegroundColor Red
    exit 1
}

# Check current repository status
try {
    $remoteUrl = git remote get-url origin
    Write-Host "✅ Git repository found: $remoteUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ No remote origin found. Please add your GitHub repository first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Next Steps for Private Deployment:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣ Make Repository Private:" -ForegroundColor Cyan
Write-Host "   - Go to GitHub repository Settings" -ForegroundColor White
Write-Host "   - General → Danger Zone → Change repository visibility" -ForegroundColor White
Write-Host "   - Select 'Make private'" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣ Deploy Backend to Render:" -ForegroundColor Cyan
Write-Host "   - Visit: https://dashboard.render.com/" -ForegroundColor White
Write-Host "   - New + → Web Service" -ForegroundColor White
Write-Host "   - Connect your private repository" -ForegroundColor White
Write-Host "   - Use render.yaml configuration" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣ Deploy Frontend to Vercel:" -ForegroundColor Cyan
Write-Host "   - Visit: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   - New Project" -ForegroundColor White
Write-Host "   - Import your private repository" -ForegroundColor White
Write-Host "   - Use vercel.json configuration" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣ Update Configuration Files:" -ForegroundColor Cyan
Write-Host "   - Update render.yaml with your service names" -ForegroundColor White
Write-Host "   - Update vercel.json with your backend URL" -ForegroundColor White
Write-Host ""

Write-Host "5️⃣ Set Environment Variables:" -ForegroundColor Cyan
Write-Host "   - Render: NODE_ENV, PORT, JWT_SECRET, CORS_ORIGIN" -ForegroundColor White
Write-Host "   - Vercel: REACT_APP_API_URL" -ForegroundColor White
Write-Host ""

Write-Host "📚 For detailed instructions, see: PRIVATE_DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔐 Benefits of Private Repository:" -ForegroundColor Green
Write-Host "   ✅ Code remains private and secure" -ForegroundColor White
Write-Host "   ✅ Professional appearance" -ForegroundColor White
Write-Host "   ✅ Control over who can see your code" -ForegroundColor White
Write-Host "   ✅ Still deployable to Render and Vercel" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Ready to deploy privately!" -ForegroundColor Green 