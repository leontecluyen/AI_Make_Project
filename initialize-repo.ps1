# Script to initialize the AI Make Project as a Git Base

Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "   INITIALIZING AI BASE REPOSITORY" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# 1. Initialize Git
if (!(Test-Path .git)) {
    Write-Host "[1/4] Initializing Git..." -ForegroundColor Yellow
    git init
}
else {
    Write-Host "[1/4] Git already initialized." -ForegroundColor Gray
}

# 2. Stage Files
Write-Host "[2/4] Staging files..." -ForegroundColor Yellow
git add .

# 3. Initial Commit
Write-Host "[3/4] Creating initial commit..." -ForegroundColor Yellow
git commit -m "feat: initial commit of base AI make project"

# 4. Optional GitHub/Remote Setup
Write-Host "`n----------------------------------------" -ForegroundColor Cyan
$choice = Read-Host "Do you want to push to a remote repository now? (y/n)"

if ($choice -eq "y") {
    Write-Host "Select method:" -ForegroundColor Yellow
    Write-Host "1. Create new GitHub repo (requires 'gh' CLI)"
    Write-Host "2. Add existing remote URL (manually)"
    $method = Read-Host "Choice (1/2)"

    if ($method -eq "1") {
        if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
            Write-Host "Error: GitHub CLI (gh) not found. Please install it from cli.github.com or use Method 2." -ForegroundColor Red
            return
        }
        $repoName = Read-Host "Enter Repository Name (default: AI_Make_Project)"
        if ($null -eq $repoName -or $repoName -eq "") { $repoName = "AI_Make_Project" }
        
        # Check if remote origin already exists
        if (git remote | Select-String "origin") {
            Write-Host "Origin remote already exists. Removing it to add the new one..." -ForegroundColor Yellow
            git remote remove origin
        }

        Write-Host "Creating GitHub repository..." -ForegroundColor Yellow
        gh repo create $repoName --public --source=. --remote=origin --push
    }
    elseif ($method -eq "2") {
        $url = Read-Host "Enter Remote Git URL (e.g., https://github.com/user/repo.git)"
        
        # Check if remote origin already exists
        if (git remote | Select-String "origin") {
            Write-Host "Origin remote already exists. Removing it to add the new one..." -ForegroundColor Yellow
            git remote remove origin
        }

        git remote add origin $url
        Write-Host "Pushing to origin..." -ForegroundColor Yellow
        git branch -M main
        git push -u origin main
    }
}

Write-Host "`n[DONE] Repository setup completed!" -ForegroundColor Green
