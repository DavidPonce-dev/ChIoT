#include "secure_utils.h"
#include <esp_log.h>
#include <esp_random.h>
#include <string.h>
#include <esp_chip_info.h>

static const char *TAG = "secure_utils";

static const char alphanumeric[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

void secure_generate_random_password(char *output, size_t len) {
    if (!output || len == 0) return;
    
    uint32_t seed = esp_random();
    for (size_t i = 0; i < len - 1; i++) {
        seed = seed * 1103515245 + 12345;
        output[i] = alphanumeric[(seed >> 16) % (sizeof(alphanumeric) - 1)];
    }
    output[len - 1] = '\0';
}

void secure_generate_device_password(char *output, size_t len) {
    if (!output || len == 0) return;
    
    uint8_t chip_mac[6];
    esp_efuse_mac_get_default(chip_mac);
    
    uint32_t seed = esp_random();
    for (size_t i = 0; i < len - 1; i++) {
        uint32_t combo = (seed << 16) ^ ((chip_mac[i % 6]) << (i % 8)) ^ (chip_mac[5 - (i % 6)]);
        combo = combo * 1103515245 + 12345;
        output[i] = alphanumeric[(combo >> 16) % (sizeof(alphanumeric) - 1)];
        seed = combo;
    }
    output[len - 1] = '\0';
}

uint32_t secure_generate_pin(uint8_t digits) {
    uint32_t pin = 0;
    uint32_t seed = esp_random();
    
    for (uint8_t i = 0; i < digits; i++) {
        seed = seed * 1103515245 + 12345;
        uint8_t digit = (seed >> 16) % 10;
        pin = pin * 10 + digit;
    }
    
    return pin;
}

void secure_wipe_buffer(void *buffer, size_t len) {
    if (!buffer) return;
    volatile uint8_t *ptr = (volatile uint8_t *)buffer;
    while (len--) {
        *ptr++ = 0;
    }
}
