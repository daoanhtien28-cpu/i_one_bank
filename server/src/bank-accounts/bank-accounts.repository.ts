import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BankAccount, BankAccountDocument } from './schemas/bank-account.schema';

@Injectable()
export class BankAccountsRepository {
  constructor(
    @InjectModel(BankAccount.name)
    private readonly bankAccountModel: Model<BankAccountDocument>,
  ) { }

  async findWithPagination(
    filter: Record<string, unknown>,
    skip: number,
    limit: number,
  ): Promise<BankAccountDocument[]> {
    return this.bankAccountModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter: Record<string, unknown>): Promise<number> {
    return this.bankAccountModel.countDocuments(filter).exec();
  }

  async findById(id: string): Promise<BankAccountDocument | null> {
    return this.bankAccountModel.findById(id).exec();
  }

  async findDuplicate(
    bankCode: string,
    accountNumber: string,
    excludeId?: string,
  ): Promise<BankAccountDocument | null> {
    const filter: Record<string, unknown> = {
      bankCode: bankCode.trim().toUpperCase(),
      accountNumber: accountNumber.trim(),
    };

    if (excludeId) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    return this.bankAccountModel.findOne(filter).exec();
  }

  async create(data: Partial<BankAccount>): Promise<BankAccountDocument> {
    const created = new this.bankAccountModel(data);
    return created.save();
  }

  async update(
    id: string,
    updateData: Partial<BankAccount>,
  ): Promise<BankAccountDocument | null> {
    return this.bankAccountModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.bankAccountModel.findByIdAndDelete(id).exec();
    return Boolean(res);
  }
}
