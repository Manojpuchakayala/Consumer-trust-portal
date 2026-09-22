$source = "C:\Users\manoj\Consumer Trust"
$dest1 = "C:\Users\manoj\OneDrive\Desktop\Consumer-Trust-Portal"
$dest2 = "C:\Users\manoj\OneDrive\Desktop\Consumer_Trust_Code"
$zipRoot = "C:\Users\manoj\Consumer Trust\Consumer_Trust_Portal.zip"
$zipDesktop = "C:\Users\manoj\OneDrive\Desktop\Consumer_Trust_Portal.zip"

Write-Host "Syncing mirror directories..."
if (Test-Path $dest1) {
    robocopy $source $dest1 /MIR /XD node_modules .git dist .vite .system_generated /XF *.log *.zip | Out-Null
    Write-Host "Synced $dest1"
}
if (Test-Path $dest2) {
    robocopy $source $dest2 /MIR /XD node_modules .git dist .vite .system_generated /XF *.log *.zip | Out-Null
    Write-Host "Synced $dest2"
}

Write-Host "Creating clean zip archive via git archive..."
Set-Location "C:\Users\manoj\Consumer Trust"
git archive --format=zip --output=$zipRoot HEAD

if (Test-Path "C:\Users\manoj\OneDrive\Desktop") {
    Copy-Item $zipRoot -Destination $zipDesktop -Force
    Write-Host "Copied zip to Desktop: $zipDesktop"
}

Write-Host "All mirrors and zip bundles synced successfully!"
