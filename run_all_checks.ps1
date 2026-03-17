param(
  [string]$E2EBaseUrl = "http://127.0.0.1:3000",
  [switch]$SkipE2E
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-NpmScript {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  Write-Host ""
  Write-Host ">> npm run $Name"
  npm run $Name
  if ($LASTEXITCODE -ne 0) {
    throw "npm run $Name failed with exit code $LASTEXITCODE"
  }
}

function Assert-WorkspacePath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [string]$Label
  )

  if (-not (Test-Path $Path)) {
    throw "$Label path not found: $Path"
  }
}

function Assert-WorkspaceDependencies {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WorkspacePath,
    [Parameter(Mandatory = $true)]
    [string]$WorkspaceName
  )

  $nodeModulesPath = Join-Path $WorkspacePath "node_modules"
  if (-not (Test-Path $nodeModulesPath)) {
    throw "$WorkspaceName dependencies are not installed. Run .\install_dependencies.ps1 from overwatch_html_root."
  }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

Assert-WorkspacePath -Path $backendPath -Label "Backend"
Assert-WorkspacePath -Path $frontendPath -Label "Frontend"
Assert-WorkspaceDependencies -WorkspacePath $backendPath -WorkspaceName "Backend"
Assert-WorkspaceDependencies -WorkspacePath $frontendPath -WorkspaceName "Frontend"

Write-Host "Running OverWatch checks..."
Write-Host "Root: $root"
Write-Host "E2E base URL: $E2EBaseUrl"
if ($SkipE2E) {
  Write-Host "E2E tests: skipped"
}

Push-Location $backendPath
try {
  Invoke-NpmScript -Name "lint"
  Invoke-NpmScript -Name "test"
  Invoke-NpmScript -Name "build"
} finally {
  Pop-Location
}

Push-Location $frontendPath
try {
  Invoke-NpmScript -Name "lint"
  Invoke-NpmScript -Name "test"

  if (-not $SkipE2E) {
    $env:E2E_BASE_URL = $E2EBaseUrl
    Invoke-NpmScript -Name "test:e2e"
  }
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "All requested checks completed successfully."
