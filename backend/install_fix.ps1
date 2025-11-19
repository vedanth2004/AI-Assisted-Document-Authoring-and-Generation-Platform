# PowerShell script to install dependencies with proper order
Write-Host "Step 1: Upgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip setuptools wheel

Write-Host "`nStep 2: Installing pydantic with pre-built wheels..." -ForegroundColor Cyan
python -m pip install "pydantic>=2.9.2,<3.0.0" --only-binary :all:

Write-Host "`nStep 3: Installing pydantic-settings..." -ForegroundColor Cyan
python -m pip install "pydantic-settings>=2.2.0,<3.0.0"

Write-Host "`nStep 4: Installing FastAPI and other dependencies..." -ForegroundColor Cyan
python -m pip install fastapi>=0.115.0 uvicorn[standard]>=0.32.0

Write-Host "`nStep 5: Installing remaining dependencies..." -ForegroundColor Cyan
python -m pip install -r requirements.txt

Write-Host "`nInstallation complete!" -ForegroundColor Green

