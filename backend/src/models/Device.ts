import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  uuid: string;
  name: string;
  type: string;
  mqttUser: string;
  mqttPass: string;
  owner: mongoose.Types.ObjectId;
  state: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    uuid: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    mqttUser: { type: String, required: true },
    mqttPass: { type: String, required: true, select: false },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    state: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Device = mongoose.model<IDevice>('Device', deviceSchema);
