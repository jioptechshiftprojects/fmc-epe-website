import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const NAV: { to: string; label: string; end?: boolean }[] = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/departments", label: "Departments" },
  { to: "/services", label: "Services" },
  { to: "/training", label: "Training" },
  { to: "/staff", label: "Our Team" },
  { to: "/news", label: "News" },
  { to: "/events", label: "Events" },
  { to: "/careers", label: "Careers" },
  { to: "/procurement", label: "Procurement" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
];

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
      isActive ? "bg-forest-800 text-gold-400" : "text-cream/90 hover:bg-forest-700 hover:text-white"
    }`;

  return (
    <header className="bg-forest-700 shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src="/assets/fmc-logo.jpg" alt="Federal Medical Centre Epe logo"
            className="h-12 w-12 rounded-full border-2 border-gold-500 bg-white object-contain" />
          <div className="leading-tight">
            <p className="text-base font-bold text-white md:text-lg">Federal Medical Centre, Epe</p>
            <p className="text-[10px] uppercase tracking-wide text-gold-400 md:text-xs">
              Excellence in Service Delivery and Training
            </p>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/appointments" className="hidden rounded-lg bg-gold-500 px-4 py-2 text-sm font-bold text-forest-900 transition hover:bg-gold-400 md:inline-block">
            Book Appointment
          </Link>
          <button
            className="rounded-md p-2 text-cream hover:bg-forest-600 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        <nav className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 pt-2 md:flex md:w-auto md:flex-row md:items-center md:pt-0`}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass} onClick={() => setOpen(false)}>
              {n.label}
            </NavLink>
          ))}
          <Link to="/appointments" className="mt-1 rounded-lg bg-gold-500 px-4 py-2 text-center text-sm font-bold text-forest-900 md:hidden" onClick={() => setOpen(false)}>
            Book Appointment
          </Link>
        </nav>
      </div>
    </header>
  );
}
