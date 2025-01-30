# Set local environment
$TEMP_ENV = Join-Path (Get-Location) "..\..\.."
$TEMP_ENV = [System.IO.Path]::GetFullPath($TEMP_ENV)

# Define new system and Python, Node.js paths
$SystemRoot = $Env:SystemRoot
$TEMP_PATH = "$SystemRoot\system32"
$TEMP_PATH = "$SystemRoot;$TEMP_PATH"
$TEMP_PATH = "$TEMP_ENV\node-v22.13.1-win-x64;$TEMP_PATH"
$TEMP_PATH = "$TEMP_ENV\Python3.12.8;$TEMP_PATH"
$TEMP_PATH = "$TEMP_ENV\Python3.12.8\Scripts;$TEMP_PATH"

# Set the new PATH
$Env:PATH = $TEMP_PATH

# Output the updated PATH for verification
Write-Host "Updated path:"
Write-Host $Env:PATH
