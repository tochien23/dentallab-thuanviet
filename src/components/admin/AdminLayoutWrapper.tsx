"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { authService } from "@/services/authService";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayoutWrapper({
  children,
  title,
  subtitle,
}: AdminLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <AdminHeader
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
