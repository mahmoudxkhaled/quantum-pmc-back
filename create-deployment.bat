@echo off
echo Creating deployment package...

REM Create deployment directory
if exist deploy rmdir /s /q deploy
mkdir deploy

REM Copy essential files
copy server.js deploy\
copy package.json deploy\
copy ecosystem.config.js deploy\

REM Create logs directory
mkdir deploy\logs

REM Create zip file
cd deploy
powershell Compress-Archive -Path * -DestinationPath ..\deployment.zip -Force
cd ..

REM Clean up
rmdir /s /q deploy

echo.
echo Deployment package created: deployment.zip
echo.
echo Files included:
echo   - server.js
echo   - package.json
echo   - ecosystem.config.js
echo   - logs/ (empty folder)
echo.
pause
