@echo off
chcp 65001 >nul
echo ========================================
echo AUTO BUILD SCRIPT
echo ========================================

echo.
echo STEP 1: Building H5 app...
cd /d E:\others\app\jizhang
call npm run build:h5
if errorlevel 1 goto FAIL

echo.
echo STEP 2: Checking build output...
echo Listing files in dist folder:
dir E:\others\app\jizhang\dist /s
echo.

echo.
echo STEP 3: Cleaning www folder...
if exist E:\others\app\AccountingApp\www (
    rmdir /s /q E:\others\app\AccountingApp\www
)
mkdir E:\others\app\AccountingApp\www

echo.
echo STEP 4: Copying files...
if exist E:\others\app\jizhang\dist\build\h5 (
    echo Copying from dist\build\h5...
    xcopy /E /I /Y E:\others\app\jizhang\dist\build\h5\* E:\others\app\AccountingApp\www\
) else if exist E:\others\app\jizhang\dist\h5 (
    echo Copying from dist\h5...
    xcopy /E /I /Y E:\others\app\jizhang\dist\h5\* E:\others\app\AccountingApp\www\
) else if exist E:\others\app\jizhang\dist\build (
    echo Copying from dist\build...
    xcopy /E /I /Y E:\others\app\jizhang\dist\build\* E:\others\app\AccountingApp\www\
) else if exist E:\others\app\jizhang\dist\* (
    echo Copying from dist root...
    xcopy /E /I /Y E:\others\app\jizhang\dist\* E:\others\app\AccountingApp\www\
) else (
    echo ERROR: Cannot find build output!
    echo Please check folder: E:\others\app\jizhang\dist
    dir E:\others\app\jizhang
    goto FAIL
)

echo.
echo STEP 5: Building Android APK...
cd /d E:\others\app\AccountingApp
call cordova build android

echo.
echo STEP 6: Checking result...
if exist platforms\android\app\build\outputs\apk\debug\app-debug.apk (
    echo.
    echo ========================================
    echo SUCCESS!
    echo APK: E:\others\app\AccountingApp\platforms\android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================
) else (
    echo ERROR: APK not found
)
goto END

:FAIL
echo.
echo ========================================
echo BUILD FAILED!
echo ========================================

:END
pause