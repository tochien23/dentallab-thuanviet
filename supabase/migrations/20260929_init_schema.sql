-- ==============================================================================
-- DENTAL WARRANTY PORTAL (SMILELAB DENTAL)
-- MIGRATION: 20260929_init_schema.sql
-- ==============================================================================

-- 1. KÍCH HOẠT EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TẠO BẢNG PROFILES (LIÊN KẾT VỚI SUPABASE AUTH)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(30) DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'technician')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TẠO BẢNG CLINICS (PHÒNG KHÁM / LAB ĐỐI TÁC)
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TẠO BẢNG PATIENTS (BỆNH NHÂN / KHÁCH HÀNG)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TẠO BẢNG TREATMENTS (CA ĐIỀU TRỊ PHỤC HÌNH)
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_code VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE RESTRICT,
    dentist_name VARCHAR(150) NOT NULL,
    treatment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TẠO BẢNG TEETH (CHI TIẾT TỪNG VỊ TRÍ RĂNG)
CREATE TABLE IF NOT EXISTS public.teeth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
    tooth_number VARCHAR(10) NOT NULL,
    jaw VARCHAR(20) NOT NULL CHECK (jaw IN ('upper', 'lower')),
    material VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    shade VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TẠO BẢNG WARRANTIES (THẺ BẢO HÀNH ĐIỆN TỬ)
CREATE TABLE IF NOT EXISTS public.warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warranty_code VARCHAR(50) UNIQUE NOT NULL,
    qr_token VARCHAR(100) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE RESTRICT,
    tooth_id UUID REFERENCES public.teeth(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    warranty_period_months INT NOT NULL CHECK (warranty_period_months > 0),
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'suspended', 'cancelled')),
    public_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TẠO BẢNG WARRANTY_LOGS (LỊCH SỬ THAO TÁC BẢO HÀNH)
CREATE TABLE IF NOT EXISTS public.warranty_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warranty_id UUID NOT NULL REFERENCES public.warranties(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TẠO BẢNG CONSULTATION_REQUESTS (FORM YÊU CẦU TƯ VẤN)
CREATE TABLE IF NOT EXISTS public.consultation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    service VARCHAR(100) NOT NULL,
    message TEXT,
    status VARCHAR(30) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'cancelled')),
    internal_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEX TỐI ƯU HIỆU NĂNG TRUY VẤN
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_patients_code ON public.patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_treatments_case_code ON public.treatments(case_code);
CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON public.treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_teeth_treatment_id ON public.teeth(treatment_id);
CREATE INDEX IF NOT EXISTS idx_warranties_code ON public.warranties(warranty_code);
CREATE INDEX IF NOT EXISTS idx_warranties_qr_token ON public.warranties(qr_token);
CREATE INDEX IF NOT EXISTS idx_warranties_patient_id ON public.warranties(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_status ON public.consultation_requests(status);

-- ==============================================================================
-- TRIGGER TỰ ĐỘNG CẬP NHẬT CỘT updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER update_clinics_timestamp BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER update_patients_timestamp BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER update_treatments_timestamp BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER update_warranties_timestamp BEFORE UPDATE ON public.warranties FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER update_consultations_timestamp BEFORE UPDATE ON public.consultation_requests FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ==============================================================================
-- CẤU HÌNH ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teeth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

-- 1. CONSULTATION REQUESTS:
-- Guest/Anon được phép gửi biểu mẫu tư vấn
CREATE POLICY "Public can insert consultation requests" ON public.consultation_requests
    FOR INSERT WITH CHECK (true);

-- Nhân viên quản trị đã đăng nhập có toàn quyền xem và sửa
CREATE POLICY "Staff can view and manage consultations" ON public.consultation_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- 2. QUYỀN TRUY CẬP CHO AUTHENTICATED STAFF TRÊN CÁC BẢNG NỘI BỘ
CREATE POLICY "Staff can manage profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage clinics" ON public.clinics
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage patients" ON public.patients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage treatments" ON public.treatments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage teeth" ON public.teeth
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage warranties" ON public.warranties
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage warranty_logs" ON public.warranty_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- HÀM POSTGRESQL TRA CỨU BẢO HÀNH CÔNG KHAI BẢO MẬT (RPC)
-- TUYỆT ĐỐI KHÔNG LỘ SỐ ĐIỆN THOẠI, EMAIL, ĐỊA CHỈ HOẶC TÊN ĐẦY ĐỦ CỦA BỆNH NHÂN
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_public_warranty_info(p_search_query TEXT)
RETURNS TABLE (
    warranty_code VARCHAR,
    product_name VARCHAR,
    brand VARCHAR,
    tooth_number VARCHAR,
    jaw VARCHAR,
    material VARCHAR,
    shade VARCHAR,
    clinic_name VARCHAR,
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status VARCHAR,
    effective_status VARCHAR,
    public_note TEXT,
    masked_patient_name TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.warranty_code,
        w.product_name,
        w.brand,
        t.tooth_number,
        t.jaw,
        t.material,
        t.shade,
        c.name AS clinic_name,
        w.activated_at,
        w.expires_at,
        w.status,
        CASE 
            WHEN w.status = 'suspended' THEN 'suspended'
            WHEN w.status = 'cancelled' THEN 'cancelled'
            WHEN w.status = 'pending' THEN 'pending'
            WHEN NOW() > w.expires_at THEN 'expired'
            ELSE 'active'
        END AS effective_status,
        w.public_note,
        -- Khử nhận dạng: Giữ chữ cái đầu, thay các chữ cái sau bằng *** (Ví dụ: "Nguyễn Văn An" -> "N*** V*** A***")
        REGEXP_REPLACE(p.full_name, '(\S)\S+', '\1***', 'g') AS masked_patient_name
    FROM public.warranties w
    LEFT JOIN public.patients p ON w.patient_id = p.id
    LEFT JOIN public.teeth t ON w.tooth_id = t.id
    LEFT JOIN public.treatments tr ON w.treatment_id = tr.id
    LEFT JOIN public.clinics c ON tr.clinic_id = c.id
    WHERE LOWER(w.warranty_code) = LOWER(TRIM(p_search_query))
       OR LOWER(w.qr_token) = LOWER(TRIM(p_search_query))
    LIMIT 1;
END;
$$;

-- CẤP QUYỀN GỌI HÀM CHO CẢ GUEST (ANON) VÀ AUTHENTICATED
GRANT EXECUTE ON FUNCTION public.get_public_warranty_info(TEXT) TO anon, authenticated;
