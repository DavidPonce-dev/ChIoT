@echo off
set PLATFORMIO_CORE_DIR=C:\pio\platformio
set CHIoT_BACKEND_URL=http://192.168.1.100:8080
set CHIoT_MQTT_URL=mqtt://192.168.1.100:1883
"C:\Users\Eduardo Chami\.platformio\penv\Scripts\platformio.exe" run > build_output.log 2>&1
pause