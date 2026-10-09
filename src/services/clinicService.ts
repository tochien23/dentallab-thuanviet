import { getDbClient } from "./dbHelper";
import { Clinic } from "@/types/database.types";
import { MOCK_CLINICS } from "./mockData";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder-project"));
}

export const clinicService = {
  async getAllClinics(): Promise<Clinic[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("clinics")
          .select("*")
          .eq("is_active", true)
          .order("name", { ascending: true });

        if (!error && data) {
          return data as Clinic[];
        }
      } catch (err) {
        console.warn("[clinicService] Lỗi khi lấy danh sách phòng khám:", err);
      }
    }
    return MOCK_CLINICS;
  },
};
