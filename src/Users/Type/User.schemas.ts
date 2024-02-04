import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocuments = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  passwordHash: string;
  @Prop({ required: true })
  passwordSalt: string;
  @Prop({
    required: true,
    type: {
      confirmationCode: String,
      expirationDate: String,
      isConfirmed: Boolean,
    },
  })
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: string;
    isConfirmed: boolean;
  };
  @Prop({ required: true })
  recoveryCode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// const userSchema = new mongoose.Schema<UserMongoDbType>({
//   // _id: String,
//   login: { type: String, required: true },
//   email: { type: String, required: true },
//   createdAt: { type: String, required: true },
//   passwordHash: { type: String, required: true },
//   passwordSalt: { type: String, required: true },
//   emailConfirmation: {
//     type: {
//       confirmationCode: { type: String, required: true },
//       expirationDate: { type: String, required: true },
//       isConfirmed: { type: Boolean, required: true },
//     },
//     required: true,
//   },
//   recoveryCode: { type: String, required: false },
// });
// export const UserModelClass = mongoose.model('users', userSchema);
