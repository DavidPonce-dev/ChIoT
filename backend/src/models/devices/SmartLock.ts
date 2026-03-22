import { Device } from '../Device';
import mongoose, { Document } from 'mongoose';

export interface ISmartLockDevice extends Document {
  locked: boolean;
  battery?: number;
  lastActivity?: Date;
}

const SmartLockDeviceSchema = new mongoose.Schema<ISmartLockDevice>({
  locked: { type: Boolean, default: true },
  battery: { type: Number, min: 0, max: 100 },
  lastActivity: { type: Date },
});

export const SmartLockDevice = Device.discriminator<ISmartLockDevice>(
  'smart_lock',
  SmartLockDeviceSchema
);
