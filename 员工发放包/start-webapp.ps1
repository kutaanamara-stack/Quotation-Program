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
Write-Host "Quotation web app is starting..." -ForegroundColor Green
Write-Host "Desktop URL: $desktopUrl" -ForegroundColor Cyan

if ($localIp) {
  Write-Host "Phone URL on same Wi-Fi: http://${localIp}:$port/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Public mobile URL:"
Write-Host "https://kutaanamara-stack.github.io/Quotation-Program/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keep this window open while using the local web app." -ForegroundColor DarkGray
Write-Host "Close this window to stop the local web app." -ForegroundColor DarkGray

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
  $pythonCommand = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $pythonCommand) {
  Write-Host ""
  Write-Host "Python is not installed. Please use the public URL above, or install Python 3 for local use." -ForegroundColor Red
  exit 1
}

Start-Process $desktopUrl
& $pythonCommand.Source -m http.server $port --bind 0.0.0.0 --directory $siteRoot
