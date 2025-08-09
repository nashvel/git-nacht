@echo off
echo 🚀 Installing Git Nacht CLI commands...

:: Create the commands directory in user profile
mkdir "%USERPROFILE%\bin" 2>nul

:: Create nacht command
echo @echo off > "%USERPROFILE%\bin\nacht.bat"
echo cd /d "c:\Users\user\OneDrive\Desktop\Projects\project-git" >> "%USERPROFILE%\bin\nacht.bat"
echo python git-nacht.py %%* >> "%USERPROFILE%\bin\nacht.bat"

:: Create shot command (shorter version)
echo @echo off > "%USERPROFILE%\bin\shot.bat"
echo cd /d "c:\Users\user\OneDrive\Desktop\Projects\project-git" >> "%USERPROFILE%\bin\shot.bat"
echo python git-nacht.py shot %%* >> "%USERPROFILE%\bin\shot.bat"

echo ✅ Commands created in %USERPROFILE%\bin\
echo.
echo 📋 To use globally, add %USERPROFILE%\bin to your PATH:
echo    1. Press Win + R, type "sysdm.cpl", press Enter
echo    2. Click "Environment Variables"
echo    3. Under "User variables", find "Path" and click "Edit"
echo    4. Click "New" and add: %USERPROFILE%\bin
echo    5. Click OK to save
echo.
echo 🎯 After adding to PATH, you can use:
echo    shot localhost:5173/dashboard
echo    nacht -url localhost:5173/features
echo.
echo 💡 Or use locally from this directory:
echo    .\shot localhost:5173/dashboard
echo    .\nacht -url localhost:5173/features
pause
