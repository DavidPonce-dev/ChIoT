import { Device } from '../Device';
import mongoose, { Document } from 'mongoose';

export interface ILedStripDevice extends Document {
  brightness: number;
  color: string;
  mode: 'static' | 'rainbow' | 'fire' | 'wave' | 'candle';
  speed?: number;
  params?: Record<string, unknown>;
}

const LedStripDeviceSchema = new mongoose.Schema<ILedStripDevice>({
  brightness: { type: Number, default: 100 },
  color: { type: String, default: '#FFFFFF' },
  mode: {
    type: String,
    enum: ['static', 'rainbow', 'fire', 'wave', 'candle'],
    default: 'static',
  },
  speed: { type: Number, default: 100 },
  params: { type: Object },
});

export const LedStripDevice = Device.discriminator<ILedStripDevice>(
  'LED_STRIP',
  LedStripDeviceSchema
);
