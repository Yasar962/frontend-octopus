param(
  [Parameter(Mandatory=$true)][string]$Project,
  [switch]$Push
)

$root = (git rev-parse --show-toplevel) 2>$null
if (-not $root) { Write-Error "Not in a git repository"; exit 1 }
Set-Location $root

# add to .gitignore if not present
$pattern = "/$Project/"
if (-not (Select-String -Path ".gitignore" -Pattern ([regex]::Escape($pattern)) -Quiet)) {
  Add-Content -Path ".gitignore" -Value "`n# ignored by remove-project script`n$pattern`n"
  git add .gitignore
}

git rm -r --cached --ignore-unmatch $Project | Out-Null

# commit if there is anything staged
$changes = git diff --cached --name-only
if ($changes) {
  git commit -m "Remove project '$Project' from repository (untracked and ignored)"
  if ($Push) { git push }
  Write-Output "Committed removal of '$Project'."
} else {
  Write-Output "No changes to commit (maybe nothing was tracked)."
}

Write-Output "Done. Local files still exist; delete manually if desired."
