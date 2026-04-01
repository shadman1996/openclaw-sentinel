@echo off
echo ==============================================
echo Building OpenClaw Sentinel Desktop Executable
echo ==============================================

echo Installing requirements including PyInstaller...
pip install -r requirements.txt
pip install pyinstaller pywebview

echo Building executable...
pyinstaller --noconfirm --onedir --windowed --icon "static/icons/icon.png" --add-data "templates;templates" --add-data "static;static" --name "OpenClaw_Sentinel" desktop.py

echo Build complete! Your desktop app is in the "dist\OpenClaw_Sentinel" folder.
