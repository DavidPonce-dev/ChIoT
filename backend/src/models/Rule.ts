import mongoose, { Schema, Document } from 'mongoose';

export type RuleConditionType =
  | 'temperature_above'
  | 'temperature_below'
  | 'humidity_above'
  | 'humidity_below'
  | 'device_online'
  | 'device_offline'
  | 'time';
export type RuleActionType =
  | 'turn_on'
  | 'turn_off'
  | 'set_color'
  | 'set_temperature'
  | 'send_notification';

export interface IRuleCondition {
  type: RuleConditionType;
  deviceUuid?: string;
  value?: number;
  time?: string;
}

export interface IRuleAction {
  type: RuleActionType;
  deviceUuid?: string;
  payload?: Record<string, unknown>;
  message?: string;
}

export interface IRule extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  conditions: IRuleCondition[];
  conditionLogic: 'AND' | 'OR';
  actions: IRuleAction[];
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

const RuleConditionSchema = new Schema<IRuleCondition>(
  {
    type: {
      type: String,
      enum: [
        'temperature_above',
        'temperature_below',
        'humidity_above',
        'humidity_below',
        'device_online',
        'device_offline',
        'time',
      ],
      required: true,
    },
    deviceUuid: { type: String },
    value: { type: Number },
    time: { type: String },
  },
  { _id: false }
);

const RuleActionSchema = new Schema<IRuleAction>(
  {
    type: {
      type: String,
      enum: ['turn_on', 'turn_off', 'set_color', 'set_temperature', 'send_notification'],
      required: true,
    },
    deviceUuid: { type: String },
    payload: { type: Map, of: Schema.Types.Mixed },
    message: { type: String },
  },
  { _id: false }
);

const RuleSchema = new Schema<IRule>(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conditions: { type: [RuleConditionSchema], required: true },
    conditionLogic: { type: String, enum: ['AND', 'OR'], default: 'AND' },
    actions: { type: [RuleActionSchema], required: true },
    enabled: { type: Boolean, default: true, index: true },
    lastTriggered: { type: Date },
    triggerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RuleSchema.methods.checkConditions = function (
  deviceStates: Map<string, Record<string, unknown>>
): boolean {
  const results = this.conditions.map((condition: IRuleCondition) => {
    switch (condition.type) {
      case 'temperature_above': {
        if (!condition.deviceUuid) return false;
        const tempState = deviceStates.get(condition.deviceUuid);
        return (
          tempState &&
          typeof tempState.temperature === 'number' &&
          tempState.temperature > (condition.value ?? 0)
        );
      }
      case 'temperature_below': {
        if (!condition.deviceUuid) return false;
        const tempStateB = deviceStates.get(condition.deviceUuid);
        return (
          tempStateB &&
          typeof tempStateB.temperature === 'number' &&
          tempStateB.temperature < (condition.value ?? 0)
        );
      }
      case 'humidity_above': {
        if (!condition.deviceUuid) return false;
        const humState = deviceStates.get(condition.deviceUuid);
        return (
          humState &&
          typeof humState.humidity === 'number' &&
          humState.humidity > (condition.value ?? 0)
        );
      }
      case 'humidity_below': {
        if (!condition.deviceUuid) return false;
        const humStateB = deviceStates.get(condition.deviceUuid);
        return (
          humStateB &&
          typeof humStateB.humidity === 'number' &&
          humStateB.humidity < (condition.value ?? 0)
        );
      }
      case 'time': {
        if (!condition.time) return false;
        const now = new Date();
        const [hours, minutes] = condition.time.split(':').map(Number);
        return now.getHours() === hours && now.getMinutes() >= minutes;
      }
      default:
        return false;
    }
  });

  if (this.conditionLogic === 'AND') {
    return results.every(Boolean);
  }
  return results.some(Boolean);
};

RuleSchema.methods.recordTrigger = async function (): Promise<void> {
  this.lastTriggered = new Date();
  this.triggerCount += 1;
  await this.save();
};

export const Rule = mongoose.model<IRule>('Rule', RuleSchema);
