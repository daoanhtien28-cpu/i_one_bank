# 🏦 Tài Liệu Tích Hợp API Ngân Hàng (Bank Master Data) Cho Front-End

- **Base URL:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`
- **Module:** `Banks`

---

## 1. Thiết Kế Cơ Sở Dữ Liệu Ngân Hàng (`banks` Collection)

Bảng **Bank** được thiết kế chuẩn theo mô hình **Master Data** của hệ thống Fintech/Banking:
- **Chỉ chứa thông tin chuẩn của chính ngân hàng** (Mã code, Tên ngân hàng, Tên viết tắt, Mã định danh Bank Code / BIN, Icon/Logo, Màu sắc đại diện, Thứ tự hiển thị).
- **Không lẫn lộn với tài khoản cá nhân:** Bỏ hoàn toàn các trường cá nhân `accountNumber`, `accountName` khỏi bảng danh mục ngân hàng.
- **Loại bỏ Securities:** Chỉ tập trung vào danh mục các Ngân hàng (`Banks`).

### 1.1. Cấu Trúc Đối Tượng Bank (JSON Schema)

```json
{
  "id": "6aab1ccfb1f2be89ec5c6c18",
  "code": "KBANK",
  "name": "K Bank",
  "shortName": "K bank",
  "binCode": "089",
  "imageUrl": "assets/images/bank/bank_kbank.png",
  "color": "#00E676",
  "order": 1,
  "isActive": true,
  "createdAt": "2026-09-16T22:48:47.610Z",
  "updatedAt": "2026-09-18T04:19:25.000Z"
}
```

### 1.2. Bảng Giải Thích Chi Tiết Các Trường:

| Trường | Kiểu dữ liệu | Mô tả | Ví dụ |
| :--- | :--- | :--- | :--- |
| `id` | `string` | ID định danh MongoDB | `"6aab1ccfb1f2be89ec5c6c18"` |
| `code` | `string` | Mã định danh chuẩn (viết hoa, không đổi) | `"SH"`, `"HANA"`, `"KB"`, `"SHINHAN"` |
| `name` | `string` | Tên đầy đủ của ngân hàng (tiếng Hàn) | `"수협"`, `"하나은행"`, `"국민은행"` |
| `shortName` | `string` | Tên viết tắt hiển thị gọn gàng trên UI | `"수협"`, `"하나"`, `"국민"` |
| `binCode` | `string` | Mã ngân hàng (Bank Code / BIN chuẩn Hàn Quốc) | `"007"`, `"081"`, `"004"`, `"088"` |
| `imageUrl` | `string` | Đường dẫn asset logo ngân hàng chuẩn snake_case | `"assets/images/bank/bank_suhyup.png"` |
| `color` | `string` | Mã màu HEX thương hiệu đặc trưng của ngân hàng | `"#005596"` (SH), `"#008485"` (Hana) |
| `order` | `number` | Thứ tự ưu tiên sắp xếp trên màn hình (tăng dần) | `1, 2, 3...` |
| `isActive` | `boolean` | Trạng thái ngân hàng có hoạt động hay không | `true` |

---

## 2. Danh Sách Endpoints

### 2.1. Lấy danh sách tất cả các ngân hàng (`GET /api/banks`)

Dùng để render Bottom Sheet hoặc danh sách chọn ngân hàng (chuyển tiền, liên kết ví, tìm kiếm ngân hàng...). Dữ liệu được backend tự động sắp xếp theo `order ASC` (ngân hàng chính Sh 수협 đứng đầu).

* **Endpoint:** `/api/banks`
* **Method:** `GET`
* **Headers:** Không yêu cầu xác thực (Public API)

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "6aab1ccfb1f2be89ec5c6c18",
      "code": "SH",
      "name": "수협",
      "shortName": "수협",
      "binCode": "007",
      "imageUrl": "assets/images/bank/bank_suhyup.png",
      "color": "#005596",
      "order": 1,
      "isActive": true
    },
    {
      "id": "6aab1ccfb1f2be89ec5c6c0b",
      "code": "KBANK",
      "name": "K Bank",
      "shortName": "K bank",
      "binCode": "089",
      "imageUrl": "assets/images/bank/bank_kbank.png",
      "color": "#00E676",
      "order": 1,
      "isActive": true
    },
    {
      "id": "6aab1ccfb1f2be89ec5c6c0c",
      "code": "TOSS",
      "name": "Toss Bank",
      "shortName": "Toss Bank",
      "binCode": "092",
      "imageUrl": "assets/images/bank/bank_toss.png",
      "color": "#0064FF",
      "order": 2,
      "isActive": true
    }
  ],
  "timestamp": "2026-09-18T04:19:25.000Z"
}
```

---

### 2.2. Lấy chi tiết ngân hàng theo mã code (`GET /api/banks/code/:code`)

* **Endpoint:** `/api/banks/code/:code`
* **Method:** `GET`
* **Ví dụ:** `/api/banks/code/HANA` hoặc `/api/banks/code/SHINHAN`

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "6aab1ccfb1f2be89ec5c6c0b",
    "code": "HANA",
    "name": "Hana Bank",
    "shortName": "Hana",
    "binCode": "081",
    "imageUrl": "assets/images/hana_bank.png",
    "color": "#008485",
    "order": 1,
    "isActive": true,
    "createdAt": "2026-09-16T22:48:47.610Z",
    "updatedAt": "2026-09-16T22:48:47.610Z"
  },
  "timestamp": "2026-09-17T05:49:23.878Z"
}
```

---

### 2.3. Lấy chi tiết ngân hàng theo ID (`GET /api/banks/:id`)

* **Endpoint:** `/api/banks/:id`
* **Method:** `GET`
* **Ví dụ:** `/api/banks/6aab1ccfb1f2be89ec5c6c0b`

---

## 3. Danh Sách Ngân Hàng Đã Được Tự Động Seed Vào Hệ Thống

| Order | Mã Code | Tên Ngân Hàng | Tên Viết Tắt | BIN Code | Mã Màu | Logo Asset |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | `NH` | NongHyup | NongHyup | 011 | `#00A062` | `assets/images/bank/bank_nh.png` |
| **2** | `KB` | KB Kookmin Bank | KB | 004 | `#796751` | `assets/images/bank/bank_kb.png` |
| **3** | `IBK` | Industrial Bank of Korea | IBK | 003 | `#1A4B9C` | `assets/images/bank/bank_ibk.png` |
| **4** | `KDB` | Korea Development Bank | KDB Bank | 002 | `#0C4DA2` | `assets/images/bank/bank_kdb.png` |
| **5** | `SHINHAN` | Shinhan Bank | Shinhan | 088 | `#0046FF` | `assets/images/bank/bank_shinhan.png` |
| **6** | `WOORI` | Woori Bank | Woori | 020 | `#0067AC` | `assets/images/bank/bank_woori.png` |
| **7** | `HANA` | Hana Bank | Hana Bank | 081 | `#008485` | `assets/images/bank/bank_hana.png` |
| **8** | `CITI` | Citibank Korea | Citi Bank | 027 | `#002D72` | `assets/images/bank/bank_citi.png` |
| **9** | `SC` | Standard Chartered Bank Korea | SC Bank | 023 | `#00A3E0` | `assets/images/bank/bank_sc.png` |
| **10** | `KAKAO` | Kakao Bank | Kakao Bank | 090 | `#FEE500` | `assets/images/bank/bank_kakao.png` |
| **11** | `KBANK` | K Bank | K bank | 089 | `#00E676` | `assets/images/bank/bank_kbank.png` |
| **12** | `TOSS` | Toss Bank | Toss Bank | 092 | `#0064FF` | `assets/images/bank/bank_toss.png` |
| **13** | `KYONGNAM` | BNK Kyongnam Bank | BNK Kyongnam Bank | 039 | `#C51D24` | `assets/images/bank/bank_gyeongnam.png` |
| **14** | `KWANGJU` | Gwangju Bank | Gwangju Bank | 034 | `#003882` | `assets/images/bank/bank_gwangju.png` |
| **15** | `DGB` | iM Bank | iM Bank (formerly D... | 031 | `#0077C8` | `assets/images/bank/bank_dgb.png` |
| **16** | `BUSAN` | BNK Busan Bank | BNK Busan Bank | 032 | `#E30613` | `assets/images/bank/bank_busan.png` |
| **17** | `JEONBUK` | Jeonbuk Bank | JB Bank | 037 | `#004B9B` | `assets/images/bank/bank_jeonbuk.png` |
| **18** | `SH` | Suhyup Bank | Suhyup | 007 | `#005596` | `assets/images/bank/bank_suhyup.png` |
| **19** | `JEJU` | Jeju Bank | Jeju Bank | 035 | `#004B9B` | `assets/images/bank/bank_jeju.png` |
| **20** | `KMSFC` | National Forestry Cooperative Federation | NFCF | 064 | `#2E7D32` | `assets/images/bank/bank_sanlim.png` |
| **21** | `CU` | National Credit Union Federation | National Credit Uni... | 048 | `#004380` | `assets/images/bank/bank_cu.png` |
| **22** | `KFCC` | MG Community Credit Cooperatives | MG Community Cre... | 045 | `#005DAA` | `assets/images/bank/bank_kfcc.png` |

---

## 4. Code Mẫu Flutter (Dart) Tích Hợp

### 4.1. Model Class `BankItemModel`

```dart
class BankItemModel {
  final String id;
  final String code;
  final String name;
  final String shortName;
  final String binCode;
  final String imageUrl;
  final String color;
  final int order;
  final bool isActive;

  BankItemModel({
    required this.id,
    required this.code,
    required this.name,
    required this.shortName,
    required this.binCode,
    required this.imageUrl,
    required this.color,
    required this.order,
    this.isActive = true,
  });

  factory BankItemModel.fromJson(Map<String, dynamic> json) {
    return BankItemModel(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      shortName: json['shortName'] ?? '',
      binCode: json['binCode'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      color: json['color'] ?? '#008485',
      order: json['order'] ?? 0,
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'shortName': shortName,
      'binCode': binCode,
      'imageUrl': imageUrl,
      'color': color,
      'order': order,
      'isActive': isActive,
    };
  }
}
```

### 4.2. Bank API Service (`bank_api_service.dart`)

```dart
import 'package:dio/dio.dart';

class BankApiService {
  final Dio _dio;

  BankApiService(this._dio);

  /// Lấy toàn bộ danh sách ngân hàng sắp xếp theo thứ tự ưu tiên
  Future<List<BankItemModel>> getAllBanks() async {
    try {
      final response = await _dio.get('/banks');
      if (response.data['success'] == true) {
        final List list = response.data['data'] ?? [];
        return list.map((item) => BankItemModel.fromJson(item)).toList();
      }
      throw Exception(response.data['message'] ?? 'Không thể tải danh sách ngân hàng');
    } catch (e) {
      rethrow;
    }
  }

  /// Lấy thông tin ngân hàng theo mã code (vd: 'HANA', 'KB'...)
  Future<BankItemModel> getBankByCode(String code) async {
    try {
      final response = await _dio.get('/banks/code/$code');
      if (response.data['success'] == true) {
        return BankItemModel.fromJson(response.data['data']);
      }
      throw Exception(response.data['message'] ?? 'Không tìm thấy ngân hàng');
    } catch (e) {
      rethrow;
    }
  }
}
```
