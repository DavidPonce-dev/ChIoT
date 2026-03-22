import { Device } from '../Device';
import mongoose, { Document } from 'mongoose';

export interface ISensorDevice extends Document {
  temperature?: number;
  humidity?: number;
  battery?: number;
  lastReading?: Date;
}

const SensorDeviceSchema = new mongoose.Schema<ISensorDevice>({
  temperature: { type: Number },
  humidity: { type: Number },
  battery: { type: Number, min: 0, max: 100 },
  lastReading: { type: Date },
});

export const SensorDevice = Device.discriminator<ISensorDevice>('sensor', SensorDeviceSchema);
