$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "C:\Users\parth\OneDrive\Desktop\wild bugs\wildbugs\screenshots"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$pages = @(
  @{ Name = "01_home_hero.png"; Url = "http://localhost:5173/" },
  @{ Name = "02_biodiversity_map_heatmap.png"; Url = "http://localhost:5173/map" },
  @{ Name = "03_species_catalog.png"; Url = "http://localhost:5173/species" },
  @{ Name = "04_lookalike_species_spotter.png"; Url = "http://localhost:5173/species/compare" },
  @{ Name = "05_species_detail_audio_guide.png"; Url = "http://localhost:5173/species/26" },
  @{ Name = "06_seasonal_challenges.png"; Url = "http://localhost:5173/challenges" },
  @{ Name = "07_community_leaderboard.png"; Url = "http://localhost:5173/leaderboard" }
)

foreach ($p in $pages) {
  $targetFile = Join-Path $outDir $p.Name
  Write-Output "Capturing: $($p.Name) from $($p.Url)..."
  Start-Process -FilePath $edgePath -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1440,900", "--virtual-time-budget=3000", "--screenshot=`"$targetFile`"", $p.Url -Wait
  if (Test-Path $targetFile) {
    $size = (Get-Item $targetFile).Length / 1KB
    Write-Output "  -> Saved: $($p.Name) ($([math]::Round($size, 1)) KB)"
  } else {
    Write-Output "  -> Failed: $($p.Name)"
  }
}

Write-Output "`n🎉 All preview screenshots generated in $outDir"
