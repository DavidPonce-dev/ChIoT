import { Device } from '../Device';
import mongoose, { Document } from 'mongoose';

export interface IThermostatDevice extends Document {
  temperature: number;
  mode: 'cool' | 'heat' | 'off';
}

const ThermostatDeviceSchema = new mongoose.Schema<IThermostatDevice>({
  temperature: { type: Number, default: 22 },
  mode: { type: String, enum: ['cool', 'heat', 'off'], default: 'off' },
});

export const ThermostatDevice = Device.discriminator<IThermostatDevice>(
  'thermostat',
  ThermostatDeviceSchema
);
