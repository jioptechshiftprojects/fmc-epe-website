import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "../lib/auth";
import AdminLayout from "./AdminLayout";

export default function AdminGuard() {
  const { loading, session, profile, role } = useAdmin();

  if (loading)
    return <main className="px-4 py-24 text-center text-sm text-forest-900/60">Checking your session…</main>;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!profile || !role)
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-forest-800">No admin access</h1>
        <p className="mt-2 text-sm text-forest-900/65">
          This account is not linked to an administrator profile. Ask the super administrator
          (via the admin-invite process) to grant you a role.
        </p>
      </main>
    );
  return (
    <AdminLayout role={role} name={profile.full_name}>
      <Outlet />
    </AdminLayout>
  );
}
