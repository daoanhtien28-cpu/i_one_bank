# 🏦 Tài Liệu Tích Hợp API Quản Lý Tài Khoản Ngân Hàng (`Bank Accounts`) Cho Front-End

- **Base URL:** `http://localhost:3001/api`
- **Swagger Documentation:** `http://localhost:3001/api/docs`
- **Module:** `BankAccounts` (`Bank Accounts`)
- **Xác thực:** Tất cả endpoints đều yêu cầu JWT Bearer Token (`Authorization: Bearer <accessToken>`).

---

## 1. Cấu Trúc Dữ Liệu (`BankAccount` Schema)

Dữ liệu chuẩn của một tài khoản ngân hàng:

```json
{
  "id": "6744c1a2e5f8b20012a34567",
  "userId": "6744c1a2e5f8b20012a34500",
  "bankCode": "VCB",
  "bankName": "Vietcombank",
  "bankLogo": "assets/images/bank/vcb.png",
  "accountNumber": "0123456789",
  "accountHolder": "NGUYEN VAN A",
  "createdAt": "2026-11-25T15:00:00.000Z",
  "updatedAt": "2026-11-25T15:00:00.000Z"
}
```

### Bảng Giải Thích Các Trường

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `id` | `string` | Tự sinh | ID định danh tài khoản ngân hàng (MongoDB ObjectId) |
| `userId` | `string` | Tự gán | ID người dùng sở hữu tài khoản |
| `bankCode` | `string` | Có | Mã ngân hàng (tối đa 30 ký tự, tự động chuẩn hóa viết hoa) |
| `bankName` | `string` | Có | Tên ngân hàng (tối đa 150 ký tự) |
| `bankLogo` | `string` | Không | Đường dẫn hoặc URL logo ngân hàng (tối đa 500 ký tự, mặc định `""`) |
| `accountNumber` | `string` | Có | Số tài khoản ngân hàng (tối đa 50 ký tự) |
| `accountHolder` | `string` | Có | Tên chủ tài khoản (tối đa 150 ký tự) |
| `createdAt` | `string` (ISO) | Tự sinh | Thời gian tạo |
| `updatedAt` | `string` (ISO) | Tự sinh | Thời gian cập nhật gần nhất |

---

## 2. Format Response Chuẩn Hệ Thống

Mọi response thành công đều được bọc bởi `ResponseInterceptor`:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "timestamp": "2026-11-25T15:00:00.000Z"
}
```

Mọi response lỗi được xử lý bởi `HttpExceptionFilter`:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Thông báo lỗi chi tiết",
  "timestamp": "2026-11-25T15:00:00.000Z",
  "path": "/api/bank-accounts"
}
```

---

## 3. Danh Sách Endpoints

### 3.1. Lấy danh sách tài khoản ngân hàng (`GET /api/bank-accounts`)

Hỗ trợ tìm kiếm theo `bankCode` (không phân biệt chữ hoa/thường) hoặc `accountNumber`, đồng thời hỗ trợ phân trang.

- **Method:** `GET`
- **URL:** `/api/bank-accounts`
- **Headers:** `Authorization: Bearer <accessToken>`

#### Query Parameters

| Tham số | Kiểu | Mặc định | Mô tả |
| :--- | :--- | :---: | :--- |
| `search` | `string` | — | Từ khóa tìm kiếm theo `bankCode` (không phân biệt hoa/thường) hoặc `accountNumber` |
| `page` | `number` | `1` | Trang hiện tại (số nguyên >= 1) |
| `limit` | `number` | `20` | Số lượng item mỗi trang (số nguyên từ 1 đến 100) |

#### Ví dụ Request

```http
GET /api/bank-accounts?search=VCB&page=1&limit=20
Authorization: Bearer <accessToken>
```

#### Response Thành Công (`200 OK`)

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "6744c1a2e5f8b20012a34567",
        "userId": "6744c1a2e5f8b20012a34500",
        "bankCode": "VCB",
        "bankName": "Vietcombank",
        "bankLogo": "assets/images/bank/vcb.png",
        "accountNumber": "0123456789",
        "accountHolder": "NGUYEN VAN A",
        "createdAt": "2026-11-25T15:00:00.000Z",
        "updatedAt": "2026-11-25T15:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "timestamp": "2026-11-25T15:00:00.000Z"
}
```

---

### 3.2. Chi tiết tài khoản ngân hàng (`GET /api/bank-accounts/:id`)

- **Method:** `GET`
- **URL:** `/api/bank-accounts/:id`
- **Headers:** `Authorization: Bearer <accessToken>`

#### Response Thành Công (`200 OK`)

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "6744c1a2e5f8b20012a34567",
    "userId": "6744c1a2e5f8b20012a34500",
    "bankCode": "VCB",
    "bankName": "Vietcombank",
    "bankLogo": "assets/images/bank/vcb.png",
    "accountNumber": "0123456789",
    "accountHolder": "NGUYEN VAN A",
    "createdAt": "2026-11-25T15:00:00.000Z",
    "updatedAt": "2026-11-25T15:00:00.000Z"
  },
  "timestamp": "2026-11-25T15:00:00.000Z"
}
```

---

### 3.3. Thêm tài khoản ngân hàng (`POST /api/bank-accounts`)

Không cho phép trùng cặp `bankCode` + `accountNumber` trong danh sách tài khoản của cùng người dùng.

- **Method:** `POST`
- **URL:** `/api/bank-accounts`
- **Headers:** `Authorization: Bearer <accessToken>`

#### Request Body

```json
{
  "bankCode": "VCB",
  "bankName": "Vietcombank",
  "bankLogo": "assets/images/bank/vcb.png",
  "accountNumber": "0123456789",
  "accountHolder": "NGUYEN VAN A"
}
```

#### Response Thành Công (`201 Created`)

```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "message": "Thêm tài khoản ngân hàng thành công",
    "bankAccount": {
      "id": "6744c1a2e5f8b20012a34567",
      "userId": "6744c1a2e5f8b20012a34500",
      "bankCode": "VCB",
      "bankName": "Vietcombank",
      "bankLogo": "assets/images/bank/vcb.png",
      "accountNumber": "0123456789",
      "accountHolder": "NGUYEN VAN A",
      "createdAt": "2026-11-25T15:00:00.000Z",
      "updatedAt": "2026-11-25T15:00:00.000Z"
    }
  },
  "timestamp": "2026-11-25T15:00:00.000Z"
}
```

---

### 3.4. Chỉnh sửa tài khoản ngân hàng (`PATCH /api/bank-accounts/:id`)

Kiểm tra tính hợp lệ của `id`, quyền sở hữu và không cho phép cập nhật trùng cặp `bankCode` + `accountNumber` với tài khoản khác.

- **Method:** `PATCH`
- **URL:** `/api/bank-accounts/:id`
- **Headers:** `Authorization: Bearer <accessToken>`

#### Request Body (truyền các trường cần sửa)

```json
{
  "bankName": "Ngân hàng Ngoại thương Việt Nam",
  "accountHolder": "TRAN VAN B"
}
```

#### Response Thành Công (`200 OK`)

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Cập nhật tài khoản ngân hàng thành công",
    "bankAccount": {
      "id": "6744c1a2e5f8b20012a34567",
      "userId": "6744c1a2e5f8b20012a34500",
      "bankCode": "VCB",
      "bankName": "Ngân hàng Ngoại thương Việt Nam",
      "bankLogo": "assets/images/bank/vcb.png",
      "accountNumber": "0123456789",
      "accountHolder": "TRAN VAN B",
      "createdAt": "2026-11-25T15:00:00.000Z",
      "updatedAt": "2026-11-25T15:05:00.000Z"
    }
  },
  "timestamp": "2026-11-25T15:05:00.000Z"
}
```

---

### 3.5. Xóa tài khoản ngân hàng (`DELETE /api/bank-accounts/:id`)

Kiểm tra `id` hợp lệ, tồn tại và quyền sở hữu trước khi xóa.

- **Method:** `DELETE`
- **URL:** `/api/bank-accounts/:id`
- **Headers:** `Authorization: Bearer <accessToken>`

#### Response Thành Công (`200 OK`)

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Xóa tài khoản ngân hàng thành công"
  },
  "timestamp": "2026-11-25T15:10:00.000Z"
}
```

---

## 4. Mã Lỗi Thường Gặp

| HTTP Status | Nguyên nhân | Message mẫu |
| :---: | :--- | :--- |
| `400` | Dữ liệu đầu vào không hợp lệ hoặc `:id` sai định dạng ObjectId | `"ID tài khoản ngân hàng không hợp lệ"` |
| `401` | Thiếu hoặc sai JWT Bearer Token | `"Unauthorized"` |
| `403` | Truy cập / sửa / xóa tài khoản của người dùng khác | `"Bạn không có quyền truy cập tài khoản ngân hàng này"` |
| `404` | Không tìm thấy tài khoản ngân hàng theo `:id` | `"Tài khoản ngân hàng không tồn tại"` |
| `409` | Trùng cặp `bankCode` + `accountNumber` | `"Tài khoản ngân hàng với mã ngân hàng và số tài khoản này đã tồn tại"` |
