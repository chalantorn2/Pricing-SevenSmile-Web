<#
  db.ps1 - quick query helper for the production MariaDB.

  Credentials come from deploy.secret.ps1 (git-ignored), so nothing is stored here.
  The server accepts remote connections on 3306, so this talks to it directly.

  Read-only by default: each session runs `SET SESSION TRANSACTION READ ONLY`
  so accidental INSERT/UPDATE/DELETE fail. Pass -Write to allow writes.

  Usage:
    ./tools/db.ps1 "SELECT COUNT(*) FROM tours"
    ./tools/db.ps1 -File database/add_hotels_table.sql -Write
    ./tools/db.ps1 -Write "UPDATE tours SET adult_price=1200 WHERE id=1"
    ./tools/db.ps1 "SELECT * FROM tours LIMIT 5" -Vertical   # \G style output
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0)] [string]$Query,
  [string]$File,
  [switch]$Write,
  [switch]$Vertical
)

$ErrorActionPreference = 'Stop'
$root  = Split-Path $PSScriptRoot -Parent
. (Join-Path $root 'deploy.secret.ps1')

$mysql = 'C:\xampp\mysql\bin\mysql.exe'
if (-not (Test-Path $mysql)) { throw "mysql client not found at $mysql" }

if ($File) {
  $sqlPath = if ([System.IO.Path]::IsPathRooted($File)) { $File } else { Join-Path $root $File }
  if (-not (Test-Path $sqlPath)) { throw "SQL file not found: $sqlPath" }
  $sql = Get-Content -Raw -Encoding utf8 $sqlPath
} elseif ($Query) {
  $sql = $Query
} else {
  throw "Provide a query string or -File <path>."
}

# Read-only guard unless -Write.
if (-not $Write) { $sql = "SET SESSION TRANSACTION READ ONLY;`n$sql" }

$mysqlArgs = @('-h', $DbHost, '-P', "$DbPort", '-u', $DbUser, '--connect-timeout=15',
               '--default-character-set=utf8mb4', $DbName)
if ($Vertical) { $mysqlArgs += '--vertical' }

$env:MYSQL_PWD = $DbPass
try {
  $sql | & $mysql @mysqlArgs
} finally {
  $env:MYSQL_PWD = ''
}
