import AdminAuthGate from "@/components/admin/AdminAuthGate";
import SuperAdminDashboard from "@/components/admin/SuperAdminDashboard";

export const metadata = {
  title: "Aegis Admin — Developer Console",
  description: "Developer super admin panel for managing the entire Aegis platform.",
};

export default function AdminDashboardPage() {
  return (
    <AdminAuthGate>
      <SuperAdminDashboard />
    </AdminAuthGate>
  );
}

