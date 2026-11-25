import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BankAccountsRepository } from './bank-accounts.repository';
import {
  BankAccountsService,
  INITIAL_SAMPLE_BANK_ACCOUNTS,
} from './bank-accounts.service';
import { BankAccountDocument } from './schemas/bank-account.schema';

describe('BankAccountsService', () => {
  let service: BankAccountsService;
  let repo: {
    findWithPagination: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findDuplicate: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const accountId = new Types.ObjectId().toHexString();

  const makeAccount = (overrides: Record<string, unknown> = {}) =>
    ({
      id: accountId,
      _id: new Types.ObjectId(accountId),
      bankCode: 'VCB',
      bankName: 'Vietcombank',
      bankLogo: 'assets/images/bank/vcb.png',
      accountNumber: '0123456789',
      accountHolder: 'NGUYEN VAN A',
      createdAt: new Date('2026-11-25T10:00:00.000Z'),
      updatedAt: new Date('2026-11-25T10:00:00.000Z'),
      ...overrides,
    }) as unknown as BankAccountDocument;

  beforeEach(async () => {
    repo = {
      findWithPagination: vi.fn(),
      count: vi.fn(),
      findById: vi.fn(),
      findDuplicate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountsService,
        { provide: BankAccountsRepository, useValue: repo },
      ],
    }).compile();

    service = module.get(BankAccountsService);
  });

  describe('seedInitialBankAccounts', () => {
    it('seeds sample accounts when collection is empty', async () => {
      repo.count.mockResolvedValue(0);
      repo.create.mockResolvedValue(makeAccount());

      await service.seedInitialBankAccounts();

      expect(repo.create).toHaveBeenCalledTimes(
        INITIAL_SAMPLE_BANK_ACCOUNTS.length,
      );
    });

    it('skips seeding when collection already has data', async () => {
      repo.count.mockResolvedValue(2);

      await service.seedInitialBankAccounts();

      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns paginated bank accounts without search filter', async () => {
      const items = [makeAccount()];
      repo.findWithPagination.mockResolvedValue(items);
      repo.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(repo.findWithPagination).toHaveBeenCalledWith({}, 0, 20);
      expect(result).toEqual({
        items,
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
    });

    it('builds case-insensitive search filter on bankCode and accountNumber', async () => {
      repo.findWithPagination.mockResolvedValue([]);
      repo.count.mockResolvedValue(0);

      await service.findAll({ search: 'vcb', page: 2, limit: 5 });

      const [filterArg, skipArg, limitArg] = repo.findWithPagination.mock.calls[0];
      expect(skipArg).toBe(5);
      expect(limitArg).toBe(5);
      expect(filterArg.$or).toHaveLength(2);
      expect(filterArg.$or[0].bankCode).toBeInstanceOf(RegExp);
      expect(filterArg.$or[0].bankCode.test('VCB')).toBe(true);
      expect(filterArg.$or[1].accountNumber.test('vcb')).toBe(true);
    });
  });

  describe('findById', () => {
    it('throws BadRequestException for invalid ObjectId', async () => {
      await expect(service.findById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when account does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById(accountId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns account when found', async () => {
      const account = makeAccount();
      repo.findById.mockResolvedValue(account);

      const result = await service.findById(accountId);
      expect(result).toBe(account);
    });
  });

  describe('create', () => {
    it('normalizes bankCode and creates a new bank account', async () => {
      const created = makeAccount();
      repo.findDuplicate.mockResolvedValue(null);
      repo.create.mockResolvedValue(created);

      const result = await service.create({
        bankCode: ' vcb ',
        bankName: ' Vietcombank ',
        bankLogo: ' assets/images/bank/vcb.png ',
        accountNumber: ' 0123456789 ',
        accountHolder: ' NGUYEN VAN A ',
      });

      expect(repo.findDuplicate).toHaveBeenCalledWith('VCB', '0123456789');
      expect(repo.create).toHaveBeenCalledWith({
        bankCode: 'VCB',
        bankName: 'Vietcombank',
        bankLogo: 'assets/images/bank/vcb.png',
        accountNumber: '0123456789',
        accountHolder: 'NGUYEN VAN A',
      });
      expect(result).toEqual({
        message: 'Thêm tài khoản ngân hàng thành công',
        bankAccount: created,
      });
    });

    it('throws ConflictException when bankCode + accountNumber already exists', async () => {
      repo.findDuplicate.mockResolvedValue(makeAccount());

      await expect(
        service.create({
          bankCode: 'vcb',
          bankName: 'Vietcombank',
          accountNumber: '0123456789',
          accountHolder: 'NGUYEN VAN A',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates bank account when valid and not duplicate', async () => {
      const existing = makeAccount();
      const updated = makeAccount({ accountHolder: 'TRAN VAN B' });
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(updated);

      const result = await service.update(accountId, {
        accountHolder: ' TRAN VAN B ',
      });

      expect(repo.findDuplicate).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith(accountId, {
        accountHolder: 'TRAN VAN B',
      });
      expect(result).toEqual({
        message: 'Cập nhật tài khoản ngân hàng thành công',
        bankAccount: updated,
      });
    });

    it('throws ConflictException when updating to an existing bankCode + accountNumber', async () => {
      const existing = makeAccount();
      repo.findById.mockResolvedValue(existing);
      repo.findDuplicate.mockResolvedValue(
        makeAccount({ id: new Types.ObjectId().toHexString() }),
      );

      await expect(
        service.update(accountId, { accountNumber: '9999999999' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('deletes bank account after verifying id', async () => {
      repo.findById.mockResolvedValue(makeAccount());
      repo.delete.mockResolvedValue(true);

      const result = await service.delete(accountId);

      expect(repo.delete).toHaveBeenCalledWith(accountId);
      expect(result).toEqual({ message: 'Xóa tài khoản ngân hàng thành công' });
    });
  });
});
