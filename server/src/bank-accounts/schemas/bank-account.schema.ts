import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankAccountDocument = BankAccount & Document;

@Schema({
  collection: 'bank_accounts',
  timestamps: true,
})
export class BankAccount {
  id: string;

  @Prop({ required: true, uppercase: true, trim: true, index: true })
  bankCode: string;

  @Prop({ required: true, trim: true })
  bankName: string;

  @Prop({ default: '', trim: true })
  bankLogo: string;

  @Prop({ required: true, trim: true, index: true })
  accountNumber: string;

  @Prop({ required: true, trim: true })
  accountHolder: string;

  createdAt: Date;
  updatedAt: Date;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);

BankAccountSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

BankAccountSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete (ret as { _id?: unknown })._id;
    delete (ret as { __v?: unknown }).__v;
    return ret;
  },
});

BankAccountSchema.index({ bankCode: 1, accountNumber: 1 }, { unique: true });
BankAccountSchema.index({ createdAt: -1 });
