<#
  deploy.ps1 - build the React app and deploy it to production over FTP.

  What it touches on the server (docroot = $DeployWebRoot):
    * index.html and any other top-level file vite emits into dist/  -> overwritten
    * assets/                                                        -> mirrored
        (stale hashed files inside assets/ are deleted; nothing else is ever deleted)

  What it NEVER touches: api/, api/uploads/, and every other top-level file/dir on
  the server. The delete guard in deploy.common.ps1 makes deleting anything outside
  /assets/ impossible.

  Usage:
    ./deploy.ps1 -DryRun     # show every action, write nothing (do this first)
    ./deploy.ps1             # build + deploy for real
    ./deploy.ps1 -SkipBuild  # deploy the existing dist/ without rebuilding
#>
[CmdletBinding()]
param(
  [switch]$DryRun,
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $root 'deploy.common.ps1')

$distDir      = Join-Path $root 'dist'
$localAssets  = Join-Path $distDir 'assets'
$remoteRoot   = $script:Docroot
$remoteAssets = "$remoteRoot/assets"

if (-not $SkipBuild) {
  Write-Host "==> npm run build" -ForegroundColor Cyan
  Push-Location $root
  try { & npm run build; if ($LASTEXITCODE -ne 0) { throw "npm run build failed ($LASTEXITCODE)" } }
  finally { Pop-Location }
}
if (-not (Test-Path $distDir)) { throw "dist/ not found - run a build first." }

Write-Host ("==> Deploy target: ftp://{0}{1}  {2}" -f $script:FtpHost, $remoteRoot, $(if($DryRun){'[DRY RUN]'}else{''})) -ForegroundColor Cyan

# 1) Remove stale files inside assets/ (old hashed bundles no longer in the build).
$localAssetNames = @()
if (Test-Path $localAssets) {
  $localAssetNames = @(Get-ChildItem -LiteralPath $localAssets -File -Force | Select-Object -Expand Name)
}
$remoteAssetNames = Get-FtpChildNames $remoteAssets
$stale = $remoteAssetNames | Where-Object { $_ -and ($localAssetNames -notcontains $_) }
Write-Host ("==> assets/: {0} local, {1} remote, {2} stale to remove" -f $localAssetNames.Count, $remoteAssetNames.Count, @($stale).Count) -ForegroundColor Cyan
foreach ($name in $stale) { Remove-FtpFile "$remoteAssets/$name" -DryRun:$DryRun }

# 2) Upload the whole dist/ tree (index.html, assets/, any public/ static) - overwrite.
Write-Host "==> Uploading dist/ ..." -ForegroundColor Cyan
Send-FtpTree $distDir $remoteRoot -DryRun:$DryRun

Write-Host ("==> Done{0}." -f $(if($DryRun){' (dry run - nothing written)'}else{''})) -ForegroundColor Green
