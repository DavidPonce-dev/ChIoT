export interface Device {
  _id: string;
  uuid: string;
  name: string;
  type: 'LED_STRIP' | 'thermostat' | 'smart_lock' | 'sensor';
  owner: string | null;
  state: Record<string, unknown>;
}

export interface User {
  id: string;
  email: string;
}
