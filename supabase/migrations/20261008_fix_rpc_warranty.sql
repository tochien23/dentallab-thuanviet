-- ==============================================================================
-- FIX: Cập nhật hàm get_public_warranty_info để sửa lỗi Postgres 42804
-- (Type mismatch giữa TEXT và VARCHAR ở cột effective_status)
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
        (CASE 
            WHEN w.status = 'suspended' THEN 'suspended'
            WHEN w.status = 'cancelled' THEN 'cancelled'
            WHEN w.status = 'pending' THEN 'pending'
            WHEN NOW() > w.expires_at THEN 'expired'
            ELSE 'active'
        END)::VARCHAR AS effective_status,
        w.public_note,
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

GRANT EXECUTE ON FUNCTION public.get_public_warranty_info(TEXT) TO anon, authenticated;
