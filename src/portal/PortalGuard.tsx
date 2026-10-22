import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useStudent } from "./useStudent";

export default function PortalGuard() {
  const { loading, userId, profile, signOut } = useStudent();

  if (loading) return <main className="px-4 py-24 text-center text-sm text-forest-900/60">Checking your session...</main>;
  if (!userId) return <Navigate to="/portal/login" replace />;
  if (!profile)
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-forest-800">Student account required</h1>
        <p className="mt-2 text-sm text-forest-900/65">
          This account is not linked to a student profile. Please{" "}
          <NavLink to="/training/nursing/apply" className="font-bold underline">apply for admission</NavLink> first.
        </p>
      </main>
    );

  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${isActive ? "bg-forest-700 text-white" : "text-forest-800 hover:bg-forest-100"}`;

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-forest-700 px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <img src="/assets/fmc-logo.jpg" alt="" className="h-9 w-9 rounded-full border-2 border-gold-500 bg-white object-contain" />
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">FMC Epe · Student Portal</p>
            <p className="text-[11px] text-gold-400 capitalize">{profile.category} student</p>
          </div>
          <button onClick={() => void signOut()} className="ml-auto rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-semibold text-cream hover:bg-forest-900">
            Sign out
          </button>
        </div>
        <nav className="mx-auto mt-2 flex max-w-5xl gap-1 overflow-x-auto pb-1">
          <NavLink to="/portal" end className={link}>Overview</NavLink>
          <NavLink to="/portal/profile" className={link}>My Profile</NavLink>
          <NavLink to="/portal/results" className={link}>Results</NavLink>
          <NavLink to="/portal/fees" className={link}>Fees</NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
