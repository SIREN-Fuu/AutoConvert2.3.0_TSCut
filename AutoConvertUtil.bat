@echo off

cd %~dp0
CScript //Nologo "%~dp0Script\AutoConvertUtil.wsf" %*
