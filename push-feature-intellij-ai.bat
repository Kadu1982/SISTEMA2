@echo off
echo ========================================
echo   Push para feature/intellij-ai
echo ========================================
echo.
echo Enviando 7 commits para origin/feature/intellij-ai...
echo.

cd /d "%~dp0"

git push -u origin feature/intellij-ai

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Push realizado com sucesso!
    echo.
    echo Commits enviados:
    echo - b0f0694 Merge comprehensive improvements
    echo - 538bbd8 Implement Nursing Care Module
    echo - 6ea6051 Security improvements
    echo - b4c05ad Organize files
    echo - 7e5ba32 Fix code quality
    echo - 628723d Fix security issues
    echo - b26b717 Add codebase analysis
    echo.
) else (
    echo.
    echo ❌ Erro ao fazer push
    echo.
    echo Tente executar manualmente:
    echo git push -u origin feature/intellij-ai
    echo.
)

pause
