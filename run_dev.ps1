# Run swDeckCraft dev server on a configurable port (default 8200).
# Usage: .\run_dev.ps1  (with venv activated, from repo root)

$port = 8200
$envPath = Join-Path $PSScriptRoot "final\.env"

if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*DEV_SERVER_PORT\s*=\s*(\d+)\s*$') {
            $port = $Matches[1]
        }
    }
}

Write-Host "Starting swDeckCraft at http://127.0.0.1:$port"
python manage.py runserver "127.0.0.1:$port"
