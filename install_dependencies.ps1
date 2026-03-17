Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Install-NodeWorkspaceDependencies {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WorkspacePath
  )

  if (-not (Test-Path $WorkspacePath)) {
    throw "Workspace path not found: $WorkspacePath"
  }

  Write-Host "Installing dependencies in $WorkspacePath ..."
  Push-Location $WorkspacePath
  try {
    if (-not (Test-Path "package.json")) {
      throw "Missing package.json in $WorkspacePath. This workstream expects committed package manifests."
    }
    npm install
  } finally {
    Pop-Location
  }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

Install-NodeWorkspaceDependencies -WorkspacePath $backendPath
Install-NodeWorkspaceDependencies -WorkspacePath $frontendPath

Write-Host "Installing Playwright browser dependencies..."
Push-Location $frontendPath
try {
  npx playwright install --with-deps chromium
} finally {
  Pop-Location
}

Write-Host "Dependency installation completed."
