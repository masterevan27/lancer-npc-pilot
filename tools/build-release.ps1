param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$Tag
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$version = (Get-Content -LiteralPath (Join-Path $ProjectRoot 'VERSION') -Raw).Trim()
$package = Get-Content -LiteralPath (Join-Path $ProjectRoot 'package.json') -Raw | ConvertFrom-Json
$moduleRoot = Join-Path $ProjectRoot 'foundry-module'
$manifest = Get-Content -LiteralPath (Join-Path $moduleRoot 'module.json') -Raw | ConvertFrom-Json
if ($version -notmatch '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$') {
    throw 'VERSION must be a stable SemVer release (X.Y.Z).'
}
if ($package.version -cne $version -or $manifest.version -cne $version) {
    throw 'Version sources disagree: VERSION, package.json and module.json must match.'
}
if (-not $Tag) { $Tag = "v$version" }
if ($Tag -cne "v$version") { throw 'Tag must match VERSION exactly: vX.Y.Z.' }
$baseUrl = 'https://github.com/masterevan27/lancer-npc-pilot'
if ($manifest.manifest -cne "$baseUrl/releases/latest/download/module.json" -or
    $manifest.download -cne "$baseUrl/releases/download/$Tag/lancer-npc-pilot.zip") {
    throw 'Manifest release URLs must match this repository and VERSION.'
}
foreach ($asset in @($manifest.esmodules) + @($manifest.styles)) {
    if ($asset -notmatch '^(scripts/.+\.mjs|styles/.+\.css)$' -or $asset -match '(^|/)\.\.(/|$)' -or
        -not (Test-Path -LiteralPath (Join-Path $moduleRoot $asset) -PathType Leaf)) {
        throw "Missing or unsupported manifest asset: $asset"
    }
}
# Allowlist the browser runtime. Never archive the repository or relay directory.
$files = @()
foreach ($folder in @('scripts', 'styles')) {
    $files += Get-ChildItem -LiteralPath (Join-Path $moduleRoot $folder) -Recurse -File |
        Where-Object { ($folder -eq 'scripts' -and $_.Extension -eq '.mjs') -or
                       ($folder -eq 'styles' -and $_.Extension -eq '.css') }
}
foreach ($file in $files) {
    if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Refusing linked file: $($file.Name)" }
}
$license = Join-Path $ProjectRoot 'LICENSE'
if (-not (Test-Path -LiteralPath $license -PathType Leaf)) { throw 'LICENSE is required.' }
$out = Join-Path $ProjectRoot 'dist'
New-Item -ItemType Directory -Path $out -Force | Out-Null
$manifestOut = Join-Path $out 'module.json'
$zipOut = Join-Path $out 'lancer-npc-pilot.zip'
if ((Test-Path -LiteralPath $manifestOut) -or (Test-Path -LiteralPath $zipOut)) {
    throw 'Release artifacts already exist in dist; remove them explicitly before rebuilding.'
}
$json = ($manifest | ConvertTo-Json -Depth 30) + "`n"
[IO.File]::WriteAllText($manifestOut, $json, (New-Object Text.UTF8Encoding $false))
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::Open($zipOut, [IO.Compression.ZipArchiveMode]::Create)
try {
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $manifestOut, 'module.json') | Out-Null
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $license, 'LICENSE') | Out-Null
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($moduleRoot.Length + 1).Replace('\', '/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relative) | Out-Null
    }
} finally { $zip.Dispose() }
Write-Output "Built $Tag`: $manifestOut and $zipOut"
