import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ServicesSection from "@/components/landing/ServicesSection";
import ProcessSection from "@/components/landing/ProcessSection";
import WarrantyBenefits from "@/components/landing/WarrantyBenefits";
import ConsultationForm from "@/components/landing/ConsultationForm";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. Header Navigation */}
      <Header />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Giới thiệu Phòng khám & Lab */}
        <AboutSection />

        {/* 4. Dịch vụ Răng sứ */}
        <ServicesSection />

        {/* 5. Quy trình 5 bước */}
        <ProcessSection />

        {/* 6. Lợi ích Bảo hành điện tử */}
        <WarrantyBenefits />

        {/* 7. Form Đăng ký tư vấn */}
        <ConsultationForm />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
