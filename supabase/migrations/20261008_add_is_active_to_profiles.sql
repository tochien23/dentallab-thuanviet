-- ==============================================================================
-- DENTAL WARRANTY PORTAL (SMILELAB DENTAL)
-- MIGRATION: 20261008_add_is_active_to_profiles.sql
-- Thêm cột is_active cho bảng profiles để quản lý trạng thái tài khoản nhân sự
-- ==============================================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Cập nhật mặc định cho các tài khoản hiện có nếu giá trị null
UPDATE public.profiles 
SET is_active = TRUE 
WHERE is_active IS NULL;
