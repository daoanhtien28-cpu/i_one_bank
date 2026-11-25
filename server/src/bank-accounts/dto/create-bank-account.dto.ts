import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({
    example: 'VCB',
    description: 'Mã ngân hàng (tự động chuẩn hóa viết hoa)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsNotEmpty({ message: 'Mã ngân hàng (bankCode) không được để trống' })
  @IsString({ message: 'Mã ngân hàng (bankCode) phải là chuỗi' })
  @MaxLength(30, { message: 'Mã ngân hàng (bankCode) tối đa 30 ký tự' })
  bankCode: string;

  @ApiProperty({
    example: 'Vietcombank',
    description: 'Tên ngân hàng',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Tên ngân hàng (bankName) không được để trống' })
  @IsString({ message: 'Tên ngân hàng (bankName) phải là chuỗi' })
  @MaxLength(150, { message: 'Tên ngân hàng (bankName) tối đa 150 ký tự' })
  bankName: string;

  @ApiPropertyOptional({
    example: 'assets/images/bank/vcb.png',
    description: 'Đường dẫn hoặc URL logo ngân hàng',
    default: '',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString({ message: 'Logo ngân hàng (bankLogo) phải là chuỗi' })
  @MaxLength(500, { message: 'Logo ngân hàng (bankLogo) tối đa 500 ký tự' })
  bankLogo?: string;

  @ApiProperty({
    example: '0123456789',
    description: 'Số tài khoản ngân hàng',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Số tài khoản (accountNumber) không được để trống' })
  @IsString({ message: 'Số tài khoản (accountNumber) phải là chuỗi' })
  @MaxLength(50, { message: 'Số tài khoản (accountNumber) tối đa 50 ký tự' })
  accountNumber: string;

  @ApiProperty({
    example: 'NGUYEN VAN A',
    description: 'Tên chủ tài khoản',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({
    message: 'Tên chủ tài khoản (accountHolder) không được để trống',
  })
  @IsString({ message: 'Tên chủ tài khoản (accountHolder) phải là chuỗi' })
  @MaxLength(150, {
    message: 'Tên chủ tài khoản (accountHolder) tối đa 150 ký tự',
  })
  accountHolder: string;
}
