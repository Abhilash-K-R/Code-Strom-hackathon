@echo off
echo ========================================================
echo   FamilyMeds (DoseBandhu) - Installing Dependencies
echo   Team: Elite Evolvers (MHC09) - CODE STORM 2026
echo ========================================================

cd FamilyMeds
if not exist package.json (
    echo [ERROR] FamilyMeds directory not found!
    pause
    exit /b 1
)

echo.
echo [1/2] Installing Node.js & React Native / Expo Dependencies...
call npm install

echo.
echo ========================================================
echo   Dependencies Installed Successfully!
echo   To run the application:
echo     - Browser demo:  cd FamilyMeds && npm run web
echo     - Mobile phone:  cd FamilyMeds && npm start
echo ========================================================
pause
