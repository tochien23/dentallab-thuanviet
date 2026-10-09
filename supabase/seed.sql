-- ==============================================================================
-- DENTAL WARRANTY PORTAL (SMILELAB DENTAL)
-- SEED DATA: supabase/seed.sql
-- Dữ liệu demo để kiểm thử local hoặc import vào Supabase Studio
-- ==============================================================================

-- 1. PHÒNG KHÁM DEMO
INSERT INTO public.clinics (id, name, address, phone, email, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'SmileLab Dental Clinic & Lab', '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', '0901234567', 'info@smilelabdental.vn', true),
    ('22222222-2222-2222-2222-222222222222', 'Nha Khoa Quốc Tế SmileCare', '456 Lê Duẩn, Quận Hải Châu, TP. Đà Nẵng', '0909888777', 'contact@smilecare.vn', true)
ON CONFLICT (id) DO NOTHING;

-- 2. BỆNH NHÂN DEMO
INSERT INTO public.patients (id, patient_code, full_name, phone, email, date_of_birth, gender, notes)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'BN-2026-0001', 'Nguyễn Văn An', '0912345678', 'nguyenvanan@gmail.com', '1990-05-15', 'male', 'Phục hình thẩm mỹ răng cửa hàm trên'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'BN-2026-0002', 'Trần Thị Mai', '0987654321', 'tranmai92@gmail.com', '1992-10-20', 'female', 'Phục hình răng hàm Zirconia'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'BN-2026-0003', 'Lê Hoàng Long', '0903112233', 'long.le@gmail.com', '1985-03-08', 'male', 'Cấy ghép Implant và mão toàn sứ')
ON CONFLICT (id) DO NOTHING;

-- 3. CA ĐIỀU TRỊ DEMO
INSERT INTO public.treatments (id, case_code, patient_id, clinic_id, dentist_name, treatment_date, notes)
VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'CASE-2026-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'BS. CKI Trần Minh Tuấn', '2026-01-10', 'Bọc sứ thẩm mỹ 2 răng cửa hàm trên'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'CASE-2021-099', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'BS. Vũ Thị Hồng', '2021-02-15', 'Cầu răng Zirconia hàm dưới (đã hết hạn BH)'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'CASE-2026-003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'BS. Nguyễn Quốc Huy', '2026-02-01', 'Phục hình Veneer')
ON CONFLICT (id) DO NOTHING;

-- 4. CHI TIẾT TỪNG RĂNG DEMO
INSERT INTO public.teeth (id, treatment_id, tooth_number, jaw, material, brand, shade, notes)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11', 'upper', 'Sứ E.max Press', 'Ivoclar Vivadent', 'BL2', 'Răng cửa chính hàm trên bên phải'),
    ('10000000-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '21', 'upper', 'Sứ E.max Press', 'Ivoclar Vivadent', 'BL2', 'Răng cửa chính hàm trên bên trái'),
    ('20000000-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '46', 'lower', 'Zirconia HT', 'Dentsply Sirona', 'A2', 'Răng cối lớn hàm dưới'),
    ('30000000-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '12', 'upper', 'Veneer E.max', 'Ivoclar Vivadent', 'A1', 'Mặt dán sứ răng cửa bên')
ON CONFLICT (id) DO NOTHING;

-- 5. THẺ BẢO HÀNH ĐIỆN TỬ DEMO
-- 5.1. Thẻ CÒN HIỆU LỰC (Active)
INSERT INTO public.warranties (
    id, warranty_code, qr_token, patient_id, treatment_id, tooth_id, 
    product_name, brand, warranty_period_months, activated_at, expires_at, status, public_note
) VALUES (
    'w1111111-1111-1111-1111-111111111111', 
    'SL-2026-88888', 
    'qr-token-active-88888', 
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
    'dddddddd-dddd-dddd-dddd-dddddddddddd', 
    '10000000-0000-0000-0000-000000000001', 
    'Răng toàn sứ IPS E.max Press', 
    'Ivoclar Vivadent', 
    120, 
    '2026-01-10 10:00:00+07', 
    '2036-01-10 10:00:00+07', 
    'active', 
    'Bảo hành chính hãng 10 năm: gãy vỡ, nứt mẻ, biến màu tự nhiên theo tiêu chuẩn Ivoclar.'
) ON CONFLICT (warranty_code) DO NOTHING;

-- 5.2. Thẻ ĐÃ HẾT HẠN (Expired)
INSERT INTO public.warranties (
    id, warranty_code, qr_token, patient_id, treatment_id, tooth_id, 
    product_name, brand, warranty_period_months, activated_at, expires_at, status, public_note
) VALUES (
    'w2222222-2222-2222-2222-222222222222', 
    'SL-2021-11111', 
    'qr-token-expired-11111', 
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 
    '20000000-0000-0000-0000-000000000001', 
    'Răng sứ Zirconia HT Standard', 
    'Dentsply Sirona', 
    36, 
    '2021-02-15 09:30:00+07', 
    '2024-02-15 09:30:00+07', 
    'active', -- Dù cột status là active nhưng expires_at trong quá khứ -> RPC sẽ tự tính effective_status là 'expired'
    'Bảo hành 3 năm theo tiêu chuẩn kỹ thuật phòng lab.'
) ON CONFLICT (warranty_code) DO NOTHING;

-- 5.3. Thẻ TẠM KHÓA (Suspended)
INSERT INTO public.warranties (
    id, warranty_code, qr_token, patient_id, treatment_id, tooth_id, 
    product_name, brand, warranty_period_months, activated_at, expires_at, status, public_note
) VALUES (
    'w3333333-3333-3333-3333-333333333333', 
    'SL-2026-99999', 
    'qr-token-suspended-99999', 
    'cccccccc-cccc-cccc-cccc-cccccccccccc', 
    'ffffffff-ffff-ffff-ffff-ffffffffffff', 
    '30000000-0000-0000-0000-000000000001', 
    'Mặt dán sứ E.max Veneer Siêu Mỏng', 
    'Ivoclar Vivadent', 
    84, 
    '2026-02-01 14:00:00+07', 
    '2033-02-01 14:00:00+07', 
    'suspended', 
    'Thẻ đang tạm thời khóa theo yêu cầu kiểm tra kỹ thuật định kỳ. Vui lòng liên hệ hotline phòng khám.'
) ON CONFLICT (warranty_code) DO NOTHING;

-- 6. YÊU CẦU TƯ VẤN DEMO
INSERT INTO public.consultation_requests (full_name, phone, email, service, message, status)
VALUES 
    ('Phạm Thu Trang', '0933221100', 'thutrang@gmail.com', 'Răng sứ E.max', 'Tôi muốn tư vấn dán sứ veneer cho 4 răng cửa.', 'new'),
    ('Đặng Văn Lâm', '0911554433', 'vanlam@gmail.com', 'Phục hình trên Implant', 'Bác sĩ kiểm tra và báo giá giúp ca phục hình răng hàm.', 'contacted')
ON CONFLICT DO NOTHING;
