# Automated APK Rebuild & Update Script for Ryzen Matrix
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " Building Updated Ryzen Matrix Android APK... " -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Navigate to Frontend & build web distribution
Set-Location "D:\NEXUS-PROJECT\Frontend"
Write-Host "[1/3] Compiling React/Vite Frontend..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

# 2. Sync web assets to Capacitor Android
Write-Host "[2/3] Syncing assets with Capacitor Android..." -ForegroundColor Green
npx cap sync android

# 3. Assemble Android Debug APK
Write-Host "[3/3] Compiling Android APK with Gradle..." -ForegroundColor Green
Set-Location "D:\NEXUS-PROJECT\Frontend\android"
$env:JAVA_HOME = "$env:USERPROFILE\.jdks\jbr-21.0.11"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    # Copy fresh APK to project root
    Copy-Item -Path "D:\NEXUS-PROJECT\Frontend\android\app\build\outputs\apk\debug\app-debug.apk" -Destination "D:\NEXUS-PROJECT\RyzenMatrix.apk" -Force
    
    Write-Host ""
    Write-Host "SUCCESS! New APK is ready:" -ForegroundColor Green
    Write-Host "-> D:\NEXUS-PROJECT\RyzenMatrix.apk" -ForegroundColor Cyan
    Write-Host "You can now send this updated APK to your phone." -ForegroundColor Yellow
} else {
    Write-Host "Gradle build failed!" -ForegroundColor Red
    exit 1
}
