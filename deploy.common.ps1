<#
  deploy.common.ps1 - shared FTP primitives + safety guards for deploy.ps1 and push.ps1.
  Not called directly. Dot-sourced by the other scripts.

  Credentials come from deploy.secret.ps1 (git-ignored).

  SAFETY MODEL
  ------------
  * Deletes are only ever allowed inside an "/assets/" segment. Any attempt to
    delete a path containing "api" or "uploads" (or anything outside assets)
    throws immediately - the PHP backend and the uploaded files can never be
    removed by a bug in this script.
  * push.ps1 only ever uploads/overwrites; it never deletes.
  * $DryRun makes every mutating call print what it WOULD do and perform no FTP write.
#>

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here 'deploy.secret.ps1')

if (-not $DeployPassword) { throw "deploy.secret.ps1: `$DeployPassword is empty." }

$script:FtpHost = $DeployHost
$script:FtpUser = $DeployUser
$script:FtpPass = $DeployPassword
$script:Docroot = $DeployWebRoot.TrimEnd('/')

function New-FtpRequest([string]$remotePath, [string]$method) {
  $uri = "ftp://$script:FtpHost" + $remotePath
  $req = [System.Net.FtpWebRequest]::Create($uri)
  $req.Credentials = New-Object System.Net.NetworkCredential($script:FtpUser, $script:FtpPass)
  $req.Method = $method
  $req.UsePassive = $true; $req.UseBinary = $true; $req.KeepAlive = $false; $req.Timeout = 60000
  return $req
}

# --- GUARD: only allow a delete when the path is clearly inside an assets/ folder
#     and never references the backend or uploaded files. ---
function Assert-Deletable([string]$remotePath) {
  $p = $remotePath.ToLower()
  if ($p -match '/api(/|$)' -or $p -match 'uploads') {
    throw "SAFETY GUARD: refusing to delete a path referencing api/uploads: $remotePath"
  }
  if ($p -notmatch '/assets/') {
    throw "SAFETY GUARD: deletes are only allowed inside an /assets/ folder. Blocked: $remotePath"
  }
}

function Get-FtpChildNames([string]$remoteDir) {
  # Returns simple names (files + dirs) in a remote dir; empty if dir missing.
  try {
    $req = New-FtpRequest $remoteDir ([System.Net.WebRequestMethods+Ftp]::ListDirectory)
    $resp = $req.GetResponse(); $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $out = $sr.ReadToEnd(); $sr.Close(); $resp.Close()
    return @($out -split "`r?`n" | Where-Object { $_ } | ForEach-Object { ($_ -split '/')[-1] })
  } catch { return @() }
}

function Test-FtpDir([string]$remoteDir) {
  # Directories don't answer MDTM; probe by listing instead.
  try {
    $req = New-FtpRequest $remoteDir ([System.Net.WebRequestMethods+Ftp]::ListDirectory)
    $resp = $req.GetResponse(); $resp.Close(); return $true
  } catch { return $false }
}

function New-FtpDir([string]$remoteDir, [switch]$DryRun) {
  if (Test-FtpDir $remoteDir) { return }
  if ($DryRun) { Write-Host "  MKDIR  $remoteDir" -ForegroundColor DarkGray; return }
  try {
    $req = New-FtpRequest $remoteDir ([System.Net.WebRequestMethods+Ftp]::MakeDirectory)
    $resp = $req.GetResponse(); $resp.Close()
  } catch {
    if (-not (Test-FtpDir $remoteDir)) { throw }  # ignore "already exists" races
  }
}

function Send-FtpFile([string]$localFile, [string]$remotePath, [switch]$DryRun) {
  if ($DryRun) { Write-Host "  PUT    $remotePath" -ForegroundColor DarkCyan; return }
  $req = New-FtpRequest $remotePath ([System.Net.WebRequestMethods+Ftp]::UploadFile)
  $bytes = [System.IO.File]::ReadAllBytes($localFile)
  $req.ContentLength = $bytes.Length
  $rs = $req.GetRequestStream(); $rs.Write($bytes, 0, $bytes.Length); $rs.Close()
  $resp = $req.GetResponse(); $resp.Close()
}

function Remove-FtpFile([string]$remotePath, [switch]$DryRun) {
  Assert-Deletable $remotePath                      # hard guard
  if ($DryRun) { Write-Host "  DELETE $remotePath" -ForegroundColor Yellow; return }
  $req = New-FtpRequest $remotePath ([System.Net.WebRequestMethods+Ftp]::DeleteFile)
  $resp = $req.GetResponse(); $resp.Close()
}

# Recursively upload a local directory into a remote directory (create dirs as needed).
function Send-FtpTree([string]$localDir, [string]$remoteDir, [switch]$DryRun) {
  New-FtpDir $remoteDir -DryRun:$DryRun
  foreach ($item in Get-ChildItem -LiteralPath $localDir -Force) {
    $remote = "$remoteDir/$($item.Name)"
    if ($item.PSIsContainer) {
      Send-FtpTree $item.FullName $remote -DryRun:$DryRun
    } else {
      Send-FtpFile $item.FullName $remote -DryRun:$DryRun
    }
  }
}
