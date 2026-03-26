#include "LEDStrip.h"
#include "Config.h"

LEDStrip::LEDStrip() : lastUpdate(0), rainbowHue(0) {
    state.power = false;
    state.brightness = 100;
    state.r = 255;
    state.g = 255;
    state.b = 255;
    state.mode = LED_MODE_STATIC;
    state.speed = 128;
}

void LEDStrip::init() {
    Serial.println("[LED] Initializing LED Strip...");
    
    pinMode(LED_PIN_R, OUTPUT);
    pinMode(LED_PIN_G, OUTPUT);
    pinMode(LED_PIN_B, OUTPUT);
    
    digitalWrite(LED_PIN_R, LOW);
    digitalWrite(LED_PIN_G, LOW);
    digitalWrite(LED_PIN_B, LOW);
    
    Serial.println("[LED] LED Strip initialized");
}

void LEDStrip::update() {
    unsigned long now = millis();
    if (now - lastUpdate > 50) {
        lastUpdate = now;
        handle();
    }
}

void LEDStrip::handle() {
    if (!state.power) return;
    
    switch (state.mode) {
        case LED_MODE_RAINBOW:
            rainbowEffect();
            break;
        case LED_MODE_FIRE:
            fireEffect();
            break;
        case LED_MODE_WAVE:
            waveEffect();
            break;
        case LED_MODE_CANDLE:
            candleEffect();
            break;
        default:
            break;
    }
    
    updateOutput();
}

void LEDStrip::updateOutput() {
    uint8_t dutyR = calculateDuty(state.r, state.brightness);
    uint8_t dutyG = calculateDuty(state.g, state.brightness);
    uint8_t dutyB = calculateDuty(state.b, state.brightness);
    
    analogWrite(LED_PIN_R, dutyR);
    analogWrite(LED_PIN_G, dutyG);
    analogWrite(LED_PIN_B, dutyB);
}

uint8_t LEDStrip::calculateDuty(uint8_t color, uint8_t brightness) {
    return (uint8_t)((uint16_t)color * brightness / 100 * 255 / 100);
}

void LEDStrip::rainbowEffect() {
    rainbowHue += state.speed / 32;
    if (rainbowHue >= 360) rainbowHue = 0;
    
    float hue = rainbowHue / 360.0;
    float c = 1.0;
    float x = c * (1 - abs(2 * hue - 1));
    float m = 0;
    
    float r, g, b;
    if (hue < 1.0/6.0) { r = c; g = x; b = 0; }
    else if (hue < 2.0/6.0) { r = x; g = c; b = 0; }
    else if (hue < 3.0/6.0) { r = 0; g = c; b = x; }
    else if (hue < 4.0/6.0) { r = 0; g = x; b = c; }
    else if (hue < 5.0/6.0) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    state.r = (uint8_t)((r + m) * 255);
    state.g = (uint8_t)((g + m) * 255);
    state.b = (uint8_t)((b + m) * 255);
}

void LEDStrip::fireEffect() {
    uint8_t flame = random(200, 255);
    uint8_t flicker = random(0, 50);
    
    state.r = flame;
    state.g = (uint8_t)(flame * 0.3);
    state.b = 0;
    
    if (random(0, 10) < 3) {
        state.r = (state.r > flicker) ? state.r - flicker : 0;
    }
}

void LEDStrip::waveEffect() {
    uint32_t time = millis() / 10;
    float wave = sin(time * state.speed / 128.0) * 0.5 + 0.5;
    
    state.r = (uint8_t)(wave * 255);
    state.g = (uint8_t)((1 - wave) * 255);
    state.b = (uint8_t)(abs(sin(time * state.speed / 256.0)) * 255);
}

void LEDStrip::candleEffect() {
    uint8_t base = 150 + random(-30, 30);
    uint8_t flicker = random(0, 20);
    
    state.r = base + flicker;
    state.g = (uint8_t)(base * 0.4 + random(0, 10));
    state.b = 0;
}

void LEDStrip::setColor(uint8_t r, uint8_t g, uint8_t b) {
    state.r = r;
    state.g = g;
    state.b = b;
    updateOutput();
}

void LEDStrip::setColor(const char* hexColor) {
    if (strlen(hexColor) < 7) return;
    
    unsigned int r, g, b;
    if (sscanf(hexColor + 1, "%02x%02x%02x", &r, &g, &b) == 3) {
        setColor((uint8_t)r, (uint8_t)g, (uint8_t)b);
    }
}

void LEDStrip::setBrightness(uint8_t brightness) {
    state.brightness = constrain(brightness, 0, 100);
    updateOutput();
}

void LEDStrip::setMode(LEDMode mode) {
    state.mode = mode;
}

void LEDStrip::setMode(const char* modeStr) {
    if (strcmp(modeStr, "static") == 0) state.mode = LED_MODE_STATIC;
    else if (strcmp(modeStr, "rainbow") == 0) state.mode = LED_MODE_RAINBOW;
    else if (strcmp(modeStr, "fire") == 0) state.mode = LED_MODE_FIRE;
    else if (strcmp(modeStr, "wave") == 0) state.mode = LED_MODE_WAVE;
    else if (strcmp(modeStr, "candle") == 0) state.mode = LED_MODE_CANDLE;
}

void LEDStrip::setSpeed(uint8_t speed) {
    state.speed = constrain(speed, 1, 255);
}

void LEDStrip::turnOn() {
    state.power = true;
    updateOutput();
}

void LEDStrip::turnOff() {
    state.power = false;
    analogWrite(LED_PIN_R, 0);
    analogWrite(LED_PIN_G, 0);
    analogWrite(LED_PIN_B, 0);
}

void LEDStrip::toggle() {
    if (state.power) turnOff();
    else turnOn();
}

LEDState LEDStrip::getState() {
    return state;
}

String LEDStrip::getStateJSON() {
    char color[8];
    snprintf(color, sizeof(color), "#%02X%02X%02X", state.r, state.g, state.b);
    
    const char* modeStr;
    switch (state.mode) {
        case LED_MODE_STATIC: modeStr = "static"; break;
        case LED_MODE_RAINBOW: modeStr = "rainbow"; break;
        case LED_MODE_FIRE: modeStr = "fire"; break;
        case LED_MODE_WAVE: modeStr = "wave"; break;
        case LED_MODE_CANDLE: modeStr = "candle"; break;
        default: modeStr = "static";
    }
    
    String json = "{";
    json += "\"power\":" + String(state.power ? "true" : "false") + ",";
    json += "\"brightness\":" + String(state.brightness) + ",";
    json += "\"color\":\"" + String(color) + "\",";
    json += "\"mode\":\"" + String(modeStr) + "\",";
    json += "\"speed\":" + String(state.speed);
    json += "}";
    
    return json;
}

void LEDStrip::handleCommand(const char* action, const char* payload) {
    Serial.printf("[LED] Command: %s\n", action);
    
    if (strcmp(action, "set_color") == 0) {
        char colorStr[8] = {0};
        sscanf(payload, "{\"color\":\"%7[^\"]", colorStr);
        if (strlen(colorStr) > 0) {
            setColor(colorStr);
        }
    }
    else if (strcmp(action, "set_brightness") == 0) {
        int brightness;
        if (sscanf(payload, "{\"brightness\":%d", &brightness) == 1) {
            setBrightness(brightness);
        }
    }
    else if (strcmp(action, "set_mode") == 0) {
        char modeStr[16] = {0};
        sscanf(payload, "{\"mode\":\"%15[^\"]", modeStr);
        if (strlen(modeStr) > 0) {
            setMode(modeStr);
        }
    }
    else if (strcmp(action, "set_speed") == 0) {
        int speed;
        if (sscanf(payload, "{\"speed\":%d", &speed) == 1) {
            setSpeed(speed);
        }
    }
    else if (strcmp(action, "turn_on") == 0) {
        turnOn();
    }
    else if (strcmp(action, "turn_off") == 0) {
        turnOff();
    }
    else if (strcmp(action, "toggle") == 0) {
        toggle();
    }
}
