#!/usr/bin/env pwsh
$ErrorActionPreference = "Continue"
$outpath = "C:\Users\kpmad\Desktop\a100dayschallenge\build_result.txt"
npm run build 2>&1 | Tee-Object -FilePath $outpath
Write-Host ""
Write-Host "Build output saved to: $outpath"
