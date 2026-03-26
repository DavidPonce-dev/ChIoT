#ifndef LED_STRIP_H
#define LED_STRIP_H

#include <Arduino.h>

enum LEDMode {
    LED_MODE_STATIC,
    LED_MODE_RAINBOW,
    LED_MODE_FIRE,
    LED_MODE_WAVE,
    LED_MODE_CANDLE
};

struct LEDState {
    bool power;
    uint8_t brightness;
    uint8_t r, g, b;
    LEDMode mode;
    uint8_t speed;
};

class LEDStrip {
public:
    LEDStrip();
    void init();
    void update();
    void handle();
    
    void setColor(uint8_t r, uint8_t g, uint8_t b);
    void setColor(const char* hexColor);
    void setBrightness(uint8_t brightness);
    void setMode(LEDMode mode);
    void setMode(const char* modeStr);
    void setSpeed(uint8_t speed);
    void turnOn();
    void turnOff();
    void toggle();
    
    LEDState getState();
    String getStateJSON();
    void handleCommand(const char* action, const char* payload);

private:
    LEDState state;
    unsigned long lastUpdate;
    uint16_t rainbowHue;
    
    void updateOutput();
    uint8_t calculateDuty(uint8_t color, uint8_t brightness);
    void rainbowEffect();
    void fireEffect();
    void waveEffect();
    void candleEffect();
};

#endif
