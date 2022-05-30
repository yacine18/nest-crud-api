import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  userId: string;

  @Prop({unique: true, required: true})
  email: string;

  @Prop({required: true})
  password: string;

  @Prop([String])
  todos: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
