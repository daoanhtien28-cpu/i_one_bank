import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BankAccountsRepository } from './bank-accounts.repository';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { QueryBankAccountsDto } from './dto/query-bank-accounts.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountDocument } from './schemas/bank-account.schema';

export const INITIAL_SAMPLE_BANK_ACCOUNTS = [
  {
    bankCode: 'SH',
    bankName: 'Suhyup Bank',
    bankLogo: 'assets/images/bank/suhyup_bank.png',
    accountNumber: '101012345678',
    accountHolder: 'DAO ANH TIEN',
  },
  {
    bankCode: 'IBK',
    bankName: 'Industrial Bank of Korea',
    bankLogo: 'assets/images/bank/industrial_bank_of_korea.png',
    accountNumber: '220098765432',
    accountHolder: 'NGUYEN VAN A',
  },
  {
    bankCode: 'KB',
    bankName: 'KB Kookmin Bank',
    bankLogo: 'assets/images/bank/kb_kookmin_bank.png',
    accountNumber: '45670100234567',
    accountHolder: 'TRAN THI B',
  },
  {
    bankCode: 'SHINHAN',
    bankName: 'Shinhan Bank',
    bankLogo: 'assets/images/bank/shinhan_bank.png',
    accountNumber: '110345678901',
    accountHolder: 'LE VAN C',
  },
  {
    bankCode: 'HANA',
    bankName: 'KEB Hana Bank',
    bankLogo: 'assets/images/bank/hana_bank.png',
    accountNumber: '33091000456789',
    accountHolder: 'PHAM MINH D',
  },
  {
    bankCode: 'KAKAO',
    bankName: 'Kakao Bank',
    bankLogo: 'assets/images/bank/kakao_bank.png',
    accountNumber: '3333012345678',
    accountHolder: 'HOANG THI E',
  },
];

export interface PaginatedBankAccounts {
  items: BankAccountDocument[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class BankAccountsService implements OnModuleInit {
  private readonly logger = new Logger(BankAccountsService.name);

  constructor(private readonly bankAccountsRepo: BankAccountsRepository) { }

  async onModuleInit(): Promise<void> {
    await this.seedInitialBankAccounts();
  }

  /**
   * Khởi tạo dữ liệu mẫu tài khoản ngân hàng nếu collection đang trống.
   */
  async seedInitialBankAccounts(): Promise<void> {
    try {
      const existingCount = await this.bankAccountsRepo.count({});
      if (existingCount > 0) {
        return;
      }

      for (const item of INITIAL_SAMPLE_BANK_ACCOUNTS) {
        await this.bankAccountsRepo.create(item);
      }

      this.logger.log(
        `Đã khởi tạo ${INITIAL_SAMPLE_BANK_ACCOUNTS.length} tài khoản ngân hàng mẫu`,
      );
    } catch (error: unknown) {
      this.logger.error('Lỗi khi khởi tạo dữ liệu mẫu bank_accounts:', error);
    }
  }

  /**
   * Lấy danh sách tài khoản ngân hàng (hỗ trợ tìm kiếm theo bankCode hoặc accountNumber và phân trang).
   */
  async findAll(query: QueryBankAccountsDto): Promise<PaginatedBankAccounts> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    const search = query.search?.trim();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ bankCode: regex }, { accountNumber: regex }];
    }

    const [items, total] = await Promise.all([
      this.bankAccountsRepo.findWithPagination(filter, skip, limit),
      this.bankAccountsRepo.count(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Lấy chi tiết một tài khoản ngân hàng theo ID.
   */
  async findById(id: string): Promise<BankAccountDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID tài khoản ngân hàng không hợp lệ');
    }

    const account = await this.bankAccountsRepo.findById(id);
    if (!account) {
      throw new NotFoundException('Tài khoản ngân hàng không tồn tại');
    }

    return account;
  }

  /**
   * Thêm mới tài khoản ngân hàng (kiểm tra trùng bankCode + accountNumber).
   */
  async create(
    dto: CreateBankAccountDto,
  ): Promise<{ message: string; bankAccount: BankAccountDocument }> {
    const bankCode = dto.bankCode.trim().toUpperCase();
    const accountNumber = dto.accountNumber.trim();

    const existing = await this.bankAccountsRepo.findDuplicate(
      bankCode,
      accountNumber,
    );
    if (existing) {
      throw new ConflictException(
        'Tài khoản ngân hàng với mã ngân hàng và số tài khoản này đã tồn tại',
      );
    }

    try {
      const bankAccount = await this.bankAccountsRepo.create({
        bankCode,
        bankName: dto.bankName.trim(),
        bankLogo: dto.bankLogo?.trim() ?? '',
        accountNumber,
        accountHolder: dto.accountHolder.trim(),
      });

      return {
        message: 'Thêm tài khoản ngân hàng thành công',
        bankAccount,
      };
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Tài khoản ngân hàng với mã ngân hàng và số tài khoản này đã tồn tại',
        );
      }
      throw error;
    }
  }

  /**
   * Chỉnh sửa thông tin tài khoản ngân hàng (kiểm tra ID và không cho phép trùng bankCode + accountNumber).
   */
  async update(
    id: string,
    dto: UpdateBankAccountDto,
  ): Promise<{ message: string; bankAccount: BankAccountDocument }> {
    const existing = await this.findById(id);

    const nextBankCode = (dto.bankCode ?? existing.bankCode)
      .trim()
      .toUpperCase();
    const nextAccountNumber = (dto.accountNumber ?? existing.accountNumber).trim();

    if (
      nextBankCode !== existing.bankCode ||
      nextAccountNumber !== existing.accountNumber
    ) {
      const duplicate = await this.bankAccountsRepo.findDuplicate(
        nextBankCode,
        nextAccountNumber,
        id,
      );
      if (duplicate) {
        throw new ConflictException(
          'Tài khoản ngân hàng với mã ngân hàng và số tài khoản này đã tồn tại',
        );
      }
    }

    const updatePayload: Partial<BankAccountDocument> = {};
    if (dto.bankCode !== undefined) updatePayload.bankCode = nextBankCode;
    if (dto.bankName !== undefined) updatePayload.bankName = dto.bankName.trim();
    if (dto.bankLogo !== undefined) updatePayload.bankLogo = dto.bankLogo.trim();
    if (dto.accountNumber !== undefined)
      updatePayload.accountNumber = nextAccountNumber;
    if (dto.accountHolder !== undefined)
      updatePayload.accountHolder = dto.accountHolder.trim();

    try {
      const updated = await this.bankAccountsRepo.update(id, updatePayload);
      if (!updated) {
        throw new NotFoundException('Tài khoản ngân hàng không tồn tại');
      }

      return {
        message: 'Cập nhật tài khoản ngân hàng thành công',
        bankAccount: updated,
      };
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Tài khoản ngân hàng với mã ngân hàng và số tài khoản này đã tồn tại',
        );
      }
      throw error;
    }
  }

  /**
   * Xóa tài khoản ngân hàng (kiểm tra ID trước khi xóa).
   */
  async delete(id: string): Promise<{ message: string }> {
    await this.findById(id);
    const deleted = await this.bankAccountsRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Tài khoản ngân hàng không tồn tại');
    }
    return { message: 'Xóa tài khoản ngân hàng thành công' };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
