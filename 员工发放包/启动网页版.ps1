$ErrorActionPreference = "Stop"

$port = 8787
$siteRoot = Join-Path $PSScriptRoot "webapp"

if (-not (Test-Path $siteRoot)) {
  Write-Host "Missing webapp folder: $siteRoot" -ForegroundColor Red
  exit 1
}

try {
  $localIp = (
    Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Select-Object -First 1 -ExpandProperty IPAddress
  )
} catch {
  $localIp = $null
}

$desktopUrl = "http://localhost:$port/"

Write-Host ""
Write-Host "Quotation tool server starting..." -ForegroundColor Green
Write-Host "Desktop URL: $desktopUrl" -ForegroundColor Cyan

if ($localIp) {
  Write-Host "Phone URL (same Wi-Fi): http://${localIp}:$port/" -ForegroundColor Yellow
} else {
  Write-Host "LAN IP not detected automatically." -ForegroundColor Yellow
}

Write-Host "Close this window to stop the server." -ForegroundColor DarkGray
Start-Process $desktopUrl

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
  $pythonCommand = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $pythonCommand) {
  Write-Host "Python is not installed. Please install Python 3 first." -ForegroundColor Red
  exit 1
}

& $pythonCommand.Source -m http.server $port --bind 0.0.0.0 --directory $siteRoot
