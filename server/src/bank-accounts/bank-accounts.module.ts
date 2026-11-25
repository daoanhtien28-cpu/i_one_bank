import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsRepository } from './bank-accounts.repository';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccount, BankAccountSchema } from './schemas/bank-account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BankAccount.name, schema: BankAccountSchema },
    ]),
  ],
  controllers: [BankAccountsController],
  providers: [BankAccountsService, BankAccountsRepository],
  exports: [BankAccountsService],
})
export class BankAccountsModule { }
