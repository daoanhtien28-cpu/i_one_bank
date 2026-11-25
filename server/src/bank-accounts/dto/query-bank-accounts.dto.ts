import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryBankAccountsDto {
  @ApiPropertyOptional({
    example: 'VCB',
    description:
      'Tìm kiếm theo mã ngân hàng (bankCode, không phân biệt hoa/thường) hoặc số tài khoản (accountNumber)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm (search) phải là chuỗi' })
  search?: string;

  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: 'Trang hiện tại',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang (page) phải là số nguyên' })
  @Min(1, { message: 'Số trang (page) tối thiểu là 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Số lượng tài khoản mỗi trang',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Giới hạn (limit) phải là số nguyên' })
  @Min(1, { message: 'Giới hạn (limit) tối thiểu là 1' })
  @Max(100, { message: 'Giới hạn (limit) tối đa là 100' })
  limit?: number = 20;
}
