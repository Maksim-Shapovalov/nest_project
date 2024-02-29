import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TokenDocuments = HydratedDocument<Token>;

@Schema()
export class Token {
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
export const TokenSchema = SchemaFactory.createForClass(Token);
