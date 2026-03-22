#include <stdint.h>
#include <stdbool.h>
#include <esp_err.h>

esp_err_t wifi_connect_provisioned(void);

esp_err_t wifi_init_sta(void);
esp_err_t wifi_connect(const char *ssid, const char *password);
bool wifi_is_connected(void);
void wifi_disconnect(void);
