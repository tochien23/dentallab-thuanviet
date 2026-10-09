# Dental Warranty Portal — SmileLab Dental
> Website phòng khám nha khoa & Laboratory răng sứ cao cấp với hệ thống quản lý và tra cứu bảo hành điện tử minh bạch bằng mã QR.

---

## 📌 Tính năng cốt lõi

1. **Landing Page chuyên nghiệp:** Giới thiệu phòng khám, xưởng lab, các dòng răng sứ cao cấp (Zirconia, E.max, Veneer, Implant), quy trình chuẩn hóa và biểu mẫu đăng ký tư vấn.
2. **Tra cứu bảo hành minh bạch:** Cho phép khách hàng tra cứu nguồn gốc phôi sứ, bác sĩ phụ trách, ngày kích hoạt và thời hạn bảo hành bằng mã bảo hành hoặc quét mã QR. Tuyệt đối không làm lộ thông tin cá nhân nhạy cảm của khách hàng.
3. **Cơ sở dữ liệu PostgreSQL & Supabase:** Tích hợp Row Level Security (RLS), stored procedure khử nhận dạng dữ liệu (masked data) và trigger tự động cập nhật thời gian.
4. **Hệ thống Quản trị (Admin Backoffice):** Dashboard đo lường chỉ số, quản lý hồ sơ bệnh nhân, ca điều trị, chi tiết răng FDI, cấp phát & gia hạn thẻ bảo hành, ghi nhật ký thao tác `warranty_logs`, và xử lý các yêu cầu tư vấn từ khách hàng.

---

## 🔐 Tài khoản Quản trị & Các Tuyến Đường

| Tuyến đường (Route) | Mô tả tính năng | Yêu cầu quyền |
| :--- | :--- | :--- |
| `/` | Landing page giới thiệu & Form đăng ký | Public |
| `/bao-hanh` | Trang tra cứu thẻ bảo hành điện tử | Public |
| `/bao-hanh/[code]` | Trang tra cứu trực tiếp từ mã QR | Public |
| `/bao-hanh/[code]/in-the` | Trang xem & in phiếu bảo hành chuẩn A5/A4 | Public |
| `/admin/login` | Đăng nhập Quản trị viên | Public |
| `/admin` | Dashboard thống kê tổng quan hoạt động | Admin / Staff |
| `/admin/patients` | Quản lý danh sách & hồ sơ bệnh nhân | Admin / Staff |
| `/admin/treatments` | Quản lý ca điều trị & phục hình | Admin / Staff |
| `/admin/teeth` | Quản lý chi tiết răng theo sơ đồ FDI | Admin / Staff |
| `/admin/warranties` | Cấp thẻ, đổi trạng thái, gia hạn & xem logs | Admin / Staff |
| `/admin/consultations` | Tiếp nhận và xử lý yêu cầu tư vấn | Admin / Staff |

> **💡 Tài khoản Quản trị Demo:**
> - **Email:** `admin@smilelabdental.vn`
> - **Mật khẩu:** `Admin@123456`
> - *Trên trang `/admin/login` có nút **"Tự động điền"** giúp bạn đăng nhập thử nghiệm ngay lập tức mà không cần tạo trước tài khoản trong CSDL.*

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Form & Validation:** React Hook Form, Zod v3
- **Database & Backend:** Supabase, PostgreSQL, Row Level Security (RLS)
- **Authentication:** Supabase Auth

---

## 🚀 Hướng dẫn cài đặt & Chạy Local

### 1. Yêu cầu hệ thống
- Node.js version 18.18 trở lên hoặc Node.js 20+
- Trình quản lý gói npm, yarn, hoặc pnpm

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc từ mẫu `.env.example`:
```bash
cp .env.example .env.local
```

Điền các thông tin kết nối Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> **Lưu ý:** Nếu bạn chưa có tài khoản Supabase ngay lúc này, hệ thống sẽ tự động chuyển sang chế độ **Mock Data**, cho phép bạn trải nghiệm đầy đủ giao diện và tính năng mà không bị lỗi.

### 4. Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Hướng dẫn thiết lập Supabase

### Bước 1: Tạo dự án Supabase
1. Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard).
2. Nhấn **New project**, chọn Tổ chức (Organization), nhập Tên dự án (VD: `DentalWarrantyPortal`) và thiết lập Database Password.
3. Chờ 1–2 phút để Supabase khởi tạo máy chủ PostgreSQL.

### Bước 2: Chạy Migration khởi tạo CSDL
1. Tại menu bên trái của Supabase Dashboard, chọn **SQL Editor**.
2. Nhấn **New query**.
3. Mở file [supabase/migrations/20260929_init_schema.sql](supabase/migrations/20260929_init_schema.sql) trong project của bạn, sao chép toàn bộ nội dung và dán vào SQL Editor.
4. Nhấn **Run** (Ctrl + Enter).
   - Hệ thống sẽ tạo 8 bảng: `profiles`, `clinics`, `patients`, `treatments`, `teeth`, `warranties`, `warranty_logs`, `consultation_requests`.
   - Thiết lập các ràng buộc (Foreign keys, Unique, Check constraints).
   - Kích hoạt Row Level Security (RLS) và gán quyền.
   - Tạo hàm Stored Procedure tra cứu an toàn `get_public_warranty_info(p_search_query)`.

### Bước 3: Nạp dữ liệu mẫu (Seed Data)
1. Trong SQL Editor, tạo một query mới.
2. Mở file [supabase/seed.sql](supabase/seed.sql), sao chép nội dung và dán vào SQL Editor.
3. Nhấn **Run**.
   - Các phòng khám, bệnh nhân và thẻ bảo hành mẫu (`SL-2026-88888`, `SL-2021-11111`, `SL-2026-99999`) sẽ được nạp sẵn để bạn kiểm thử.

### Bước 4: Lấy API Keys
1. Vào **Project Settings** -> **API**.
2. Sao chép **Project URL** -> gán vào `NEXT_PUBLIC_SUPABASE_URL`.
3. Sao chép **anon public** key -> gán vào `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Sao chép **service_role secret** key -> gán vào `SUPABASE_SERVICE_ROLE_KEY`.

### Bước 5: Tạo tài khoản Quản trị viên (Admin)
1. Vào mục **Authentication** -> **Users** -> Nhấn **Add user** -> **Create user**.
2. Nhập Email (VD: `admin@smilelabdental.vn`) và Mật khẩu.
3. Vào lại **SQL Editor**, chạy lệnh sau để cấp vai trò admin cho user vừa tạo:
```sql
INSERT INTO public.profiles (id, full_name, email, role)
SELECT id, 'Quản Trị Viên SmileLab', email, 'admin'
FROM auth.users
WHERE email = 'admin@smilelabdental.vn';
```

---

## 🔍 Kiểm tra chất lượng mã nguồn

```bash
# Kiểm tra lỗi cú pháp TypeScript
npm run type-check

# Kiểm tra quy tắc code linting
npm run lint

# Biên dịch kiểm tra bản build production
npm run build
```

---

## 🌐 Triển khai lên Vercel

1. Đẩy mã nguồn lên kho lưu trữ GitHub / GitLab.
2. Truy cập [Vercel](https://vercel.com/) và import repository.
3. Trong mục **Environment Variables**, thêm các biến từ file `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (Domain thực tế, ví dụ `https://smilelab.vercel.app`)
4. Nhấn **Deploy**.
