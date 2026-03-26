#ifndef SECURE_UTILS_H
#define SECURE_UTILS_H

#include <stdint.h>
#include <stdbool.h>

#define SECURE_RANDOM_PASSWORD_LEN 16
#define SECURE_AP_PASSWORD_LEN 12

void secure_generate_random_password(char *output, size_t len);

void secure_generate_device_password(char *output, size_t len);

uint32_t secure_generate_pin(uint8_t digits);

void secure_wipe_buffer(void *buffer, size_t len);

#endif
