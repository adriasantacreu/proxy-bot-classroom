$ErrorActionPreference = "Stop"

Write-Host "📦 Preparant desplegament net..." -ForegroundColor Cyan

# 1. Moure tests fora temporalment
if (Test-Path "tests") {
    Write-Host "📂 Movent tests temporalment fora..."
    Move-Item "tests" "../tests_temp_safe" -Force
}

try {
    # 2. Clasp Push net
    Write-Host "🚀 Executant clasp push..." -ForegroundColor Green
    clasp push --force
}
catch {
    Write-Host "❌ Error durant el push: $_" -ForegroundColor Red
}
finally {
    # 3. Restaurar tests
    if (Test-Path "../tests_temp_safe") {
        Write-Host "📂 Restaurant carpeta tests..."
        Move-Item "../tests_temp_safe" "tests" -Force
    }
    Write-Host "✅ Procés finalitzat." -ForegroundColor Cyan
}
