@echo off

set root=C:\Users\bellg\anaconda3
call %root%\Scripts\activate.bat %root%

call conda activate flask
call flask --app scatter --debug run

pause