@echo off
echo Installing dependencies with better compatibility...
pip install --upgrade pip setuptools wheel
pip install pydantic>=2.9.2 pydantic-settings>=2.2.0 --only-binary :all:
pip install -r requirements.txt
echo.
echo Installation complete!

