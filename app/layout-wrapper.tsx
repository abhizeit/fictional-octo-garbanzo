"use client";

import { NavigationSidebar } from "@/components/custom/navigation-sidebar";
import { ProtectedRoute } from "@/components/custom/protected-route";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't protect or show sidebar on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Protect all other routes and show sidebar
  return (
    <ProtectedRoute>
      <NavigationSidebar>{children}</NavigationSidebar>
    </ProtectedRoute>
  );
}
