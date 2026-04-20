param (
    [Parameter(Mandatory=$false, Position=0)]
    [String]$Action = "next"
)

# Configuration
$AgentFiles = @{
    "01" = "ai-agents/01-architect.md"
    "02" = "ai-agents/02-developer.md"
    "03" = "ai-agents/03-tester.md"
    "04" = "ai-agents/04-deployer.md"
    "05" = "ai-agents/05-pm.md"
}

$SessionFile = "docs/session-state.json"
$SkipFlag = "--dangerously-skip-permissions"

function Run-Agent([string]$Id) {
    if (-not $AgentFiles.ContainsKey($Id)) {
        Write-Host "Error: Agent $Id not found." -ForegroundColor Red
        return $false
    }

    $File = $AgentFiles[$Id]
    if (-not (Test-Path $File)) {
        Write-Host "Error: File $File not found." -ForegroundColor Red
        return $false
    }

    Write-Host "`n>>> RUNNING AGENT $Id ($File)..." -ForegroundColor Green
    $Prompt = Get-Content $File -Raw
    
    # Execute Claude CLI with auto-permission skip
    claude $SkipFlag -p "$Prompt"
    return $true
}

function Get-Next-Step {
    if (-not (Test-Path $SessionFile)) {
        return "01"
    }

    try {
        $State = Get-Content $SessionFile | ConvertFrom-Json
        $Phase = $State.phase
        
        switch ($Phase) {
            ""            { return "01" }
            "architect"   { return "02" }
            "developer"   { return "03" }
            "tester"      { return "04" }
            "production"  { return "05" }
            default       { return "01" }
        }
    }
    catch {
        Write-Host "Warn: Could not parse $SessionFile. Defaulting to 01." -ForegroundColor Yellow
        return "01"
    }
}

# MAIN LOGIC
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "   CLAUDE AGENT FACTORY RUNNER" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

if ($Action -eq "all") {
    Write-Host "Action: Running ALL steps..." -ForegroundColor Yellow
    foreach ($step in ("01", "02", "03", "04", "05")) {
        if (-not (Run-Agent $step)) { break }
    }
}
elseif ($Action -eq "next") {
    $Next = Get-Next-Step
    Write-Host "Action: Detecting next step... Found: $Next" -ForegroundColor Yellow
    Run-Agent $Next
}
else {
    # Assume Action is step ID like "01" or "1"
    $StepId = $Action
    if ($StepId.Length -eq 1) { $StepId = "0$StepId" } # normalize 1 to 01
    
    Write-Host "Action: Running specific step $StepId..." -ForegroundColor Yellow
    Run-Agent $StepId
}
