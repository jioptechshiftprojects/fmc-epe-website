import { Link, NavLink } from "react-router-dom";

export default function BrandHeader() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-forest-800 text-gold-400" : "text-cream hover:bg-forest-700 hover:text-white"
    }`;

  return (
    <header className="bg-forest-700 shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/fmc-logo.jpg"
            alt="Federal Medical Centre Epe logo"
            className="h-14 w-14 rounded-full border-2 border-gold-500 bg-white object-contain"
          />
          <div className="leading-tight">
            <p className="text-lg font-bold text-white">Federal Medical Centre, Epe</p>
            <p className="text-xs uppercase tracking-wide text-gold-400">
              Excellence in Service Delivery and Training
            </p>
          </div>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/connection-test" className={linkClass}>
            Connection Test
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
