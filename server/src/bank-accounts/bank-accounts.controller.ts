import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { QueryBankAccountsDto } from './dto/query-bank-accounts.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@ApiTags('Bank Accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) { }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tài khoản ngân hàng (hỗ trợ tìm kiếm & phân trang)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tài khoản ngân hàng kèm thông tin phân trang',
    schema: {
      example: {
        items: [
          {
            id: '6744c1a2e5f8b20012a34567',
            bankCode: 'VCB',
            bankName: 'Vietcombank',
            bankLogo: 'assets/images/bank/vcb.png',
            accountNumber: '0123456789',
            accountHolder: 'NGUYEN VAN A',
            createdAt: '2026-11-25T15:00:00.000Z',
            updatedAt: '2026-11-25T15:00:00.000Z',
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      },
    },
  })
  async findAll(@Query() query: QueryBankAccountsDto) {
    return this.bankAccountsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết tài khoản ngân hàng theo ID' })
  @ApiParam({ name: 'id', description: 'ID tài khoản ngân hàng' })
  @ApiResponse({ status: 200, description: 'Chi tiết tài khoản ngân hàng' })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Tài khoản ngân hàng không tồn tại' })
  async findById(@Param('id') id: string) {
    return this.bankAccountsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm tài khoản ngân hàng mới' })
  @ApiResponse({
    status: 201,
    description: 'Thêm tài khoản ngân hàng thành công',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({
    status: 409,
    description: 'Tài khoản ngân hàng (bankCode + accountNumber) đã tồn tại',
  })
  async create(@Body() dto: CreateBankAccountDto) {
    return this.bankAccountsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Chỉnh sửa thông tin tài khoản ngân hàng' })
  @ApiParam({ name: 'id', description: 'ID tài khoản ngân hàng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật tài khoản ngân hàng thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'ID hoặc dữ liệu đầu vào không hợp lệ',
  })
  @ApiResponse({ status: 404, description: 'Tài khoản ngân hàng không tồn tại' })
  @ApiResponse({
    status: 409,
    description: 'Tài khoản ngân hàng (bankCode + accountNumber) đã tồn tại',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài khoản ngân hàng' })
  @ApiParam({ name: 'id', description: 'ID tài khoản ngân hàng' })
  @ApiResponse({ status: 200, description: 'Xóa tài khoản ngân hàng thành công' })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Tài khoản ngân hàng không tồn tại' })
  async delete(@Param('id') id: string) {
    return this.bankAccountsService.delete(id);
  }
}
