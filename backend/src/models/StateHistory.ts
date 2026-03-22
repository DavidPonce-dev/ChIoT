import mongoose, { Schema, Document } from 'mongoose';

export interface IStateHistory extends Document {
  deviceId: mongoose.Types.ObjectId;
  deviceUuid: string;
  state: Record<string, unknown>;
  timestamp: Date;
}

const StateHistorySchema = new Schema<IStateHistory>(
  {
    deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    deviceUuid: { type: String, required: true, index: true },
    state: { type: Map, of: Schema.Types.Mixed, required: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
  },
  {
    timestamps: false,
    timeseries: {
      timeField: 'timestamp',
      metaField: 'deviceUuid',
      granularity: 'hours',
    },
  }
);

StateHistorySchema.index({ deviceUuid: 1, timestamp: -1 });

StateHistorySchema.statics.getDeviceHistory = async function (
  deviceUuid: string,
  limit: number = 100,
  startDate?: Date,
  endDate?: Date
): Promise<IStateHistory[]> {
  const query: Record<string, unknown> = { deviceUuid };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) (query.timestamp as Record<string, Date>).$gte = startDate;
    if (endDate) (query.timestamp as Record<string, Date>).$lte = endDate;
  }

  return this.find(query).sort({ timestamp: -1 }).limit(limit).exec();
};

StateHistorySchema.statics.recordState = async function (
  deviceId: mongoose.Types.ObjectId,
  deviceUuid: string,
  state: Record<string, unknown>
): Promise<IStateHistory> {
  return this.create({
    deviceId,
    deviceUuid,
    state,
    timestamp: new Date(),
  });
};

export const StateHistory = mongoose.model<IStateHistory>('StateHistory', StateHistorySchema);
