# PredicVerse — Windows Docker Compose Deployment Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🚀 PredicVerse — Docker Deployment (PowerShell)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ $dockerVersion detected." -ForegroundColor Green
} catch {
    Write-Error "❌ Docker is not installed or not in PATH. Please install Docker Desktop for Windows."
    exit 1
}

# 2. Check .env
if (-not (Test-Path ".env")) {
    Write-Host "📄 Copying .env.docker.example to .env..." -ForegroundColor Yellow
    Copy-Item ".env.docker.example" ".env"
    Write-Host "✅ Created .env configuration file." -ForegroundColor Green
}

# 3. Build & Run
Write-Host "📦 Building and starting containers..." -ForegroundColor Cyan
docker compose up -d --build

# 4. Check status
Write-Host "⏳ Checking container status..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
docker compose ps

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🎉 PredicVerse is running!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost" -ForegroundColor White
Write-Host "  API Health: http://localhost:3001/health" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
