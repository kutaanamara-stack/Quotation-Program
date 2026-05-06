$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$employeeRoot = Get-ChildItem -LiteralPath $repoRoot -Directory |
  Where-Object { Test-Path (Join-Path $_.FullName "webapp") } |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $employeeRoot) {
  throw "Employee package folder with webapp was not found."
}

$webappRoot = Join-Path $employeeRoot "webapp"
$jsPath = Join-Path $webappRoot "assets/index-BWbYWipI.js"
$cssPath = Join-Path $webappRoot "assets/index-QxFM9zvW.css"
$logoPath = Join-Path $webappRoot "template/studio-logo.jpg"
$rootOutput = Join-Path $repoRoot "mobile-offline.html"
$publicOutput = Join-Path $repoRoot "public/mobile-offline.html"
$employeeFilename = "$([char]0x624b)$([char]0x673a)$([char]0x79bb)$([char]0x7ebf)$([char]0x7248).html"
$employeeOutput = Join-Path $employeeRoot $employeeFilename

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$js = [System.IO.File]::ReadAllText($jsPath)
$css = [System.IO.File]::ReadAllText($cssPath)
$logoBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($logoPath))
$logoDataUrl = "data:image/jpeg;base64,${logoBase64}"

$js = $js.Replace('logoSrc:"./template/studio-logo.jpg"', "logoSrc:""$logoDataUrl""")
$js = $js.Replace("</script", "<\/script")

$html = @"
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>&#x9910;&#x5177;&#x4fee;&#x590d;&#x62a5;&#x4ef7;&#x5de5;&#x5177;&#x79bb;&#x7ebf;&#x7248;</title>
    <style>
$css
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
$js
    </script>
  </body>
</html>
"@

[System.IO.File]::WriteAllText($rootOutput, $html, $utf8NoBom)
[System.IO.File]::WriteAllText($publicOutput, $html, $utf8NoBom)
[System.IO.File]::WriteAllText($employeeOutput, $html, $utf8NoBom)

Write-Output "Generated $rootOutput"
Write-Output "Generated $publicOutput"
Write-Output "Generated $employeeOutput"
