$ErrorActionPreference = "Stop"

$nodeVersion = (node --version).TrimStart("v")
if ([version]$nodeVersion -lt [version]"22.13.0") {
  throw "Pumblo requires Node.js 22.13.0 or newer. Found $nodeVersion."
}

Write-Host "Installing the locked dependency set..."
npm ci

Write-Host "Running release verification..."
npm run verify

Write-Host ""
Write-Host "Pumblo is ready. Start it with: npm run dev"
Write-Host "Then open the local URL printed by Vinext."
