import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeviceDocuments = HydratedDocument<Device>;

@Schema()
export class Device {
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  lastActiveDate: string;
  @Prop({ required: true })
  deviceId: string;
  @Prop({ required: true })
  userId: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
