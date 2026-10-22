import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAdmin } from "../lib/auth";
import { ENTITIES } from "./config";

export default function AdminLayout({ role, name, children }: { role: string; name: string; children: ReactNode }) {
  const { signOut } = useAdmin();
  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
      isActive ? "bg-forest-700 text-white" : "text-forest-800 hover:bg-forest-100"
    }`;

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-forest-700 px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/assets/fmc-logo.jpg" alt="" className="h-9 w-9 rounded-full border-2 border-gold-500 bg-white object-contain" />
            <span className="text-sm font-bold text-white">FMC Epe · Admin</span>
          </Link>
          <span className="ml-auto text-xs text-gold-400">{name} · {role.replace("_", " ")}</span>
          <button onClick={() => void signOut()} className="rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-semibold text-cream hover:bg-forest-900">
            Sign out
          </button>
        </div>
        <nav className="mx-auto mt-2 flex max-w-6xl gap-1 overflow-x-auto pb-1">
          <NavLink to="/admin" end className={link}>Dashboard</NavLink>
          <NavLink to="/admin/inbox/appointments" className={link}>Appointments</NavLink>
          <NavLink to="/admin/inbox/feedback" className={link}>Feedback</NavLink>
          {ENTITIES.filter((e) => role === "super_admin" || e.roles.includes(role as never)).map((e) => (
            <NavLink key={e.key} to={`/admin/content/${e.key}`} className={link}>{e.title}</NavLink>
          ))}
          {(role === "super_admin" || role === "content_admin") && (
            <NavLink to="/admin/media" className={link}>Media</NavLink>
          )}
          {role === "super_admin" && (
            <>
              <NavLink to="/admin/admins" className={link}>Admins</NavLink>
              <NavLink to="/admin/audit" className={link}>Audit log</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
