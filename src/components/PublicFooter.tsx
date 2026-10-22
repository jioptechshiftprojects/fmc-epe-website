import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="mt-auto bg-forest-900 text-cream/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src="/assets/fmc-logo.jpg" alt="" className="h-10 w-10 rounded-full border border-gold-500 bg-white object-contain" />
            <p className="font-bold text-white">Federal Medical Centre, Epe</p>
          </div>
          <p className="mt-3 text-xs leading-relaxed">
            A federal tertiary health institution serving Epe and Lagos East —
            Excellence in Service Delivery and Training.
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold uppercase tracking-wide text-gold-400">Quick links</p>
          <ul className="space-y-1 text-xs">
            <li><Link className="hover:text-white" to="/appointments">Book an appointment</Link></li>
            <li><Link className="hover:text-white" to="/contact">Feedback &amp; enquiries</Link></li>
            <li><Link className="hover:text-white" to="/careers">Recruitment</Link></li>
            <li><Link className="hover:text-white" to="/procurement">Procurement notices</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold uppercase tracking-wide text-gold-400">Contact</p>
          <ul className="space-y-1 text-xs">
            <li>Epe, Lagos State, Nigeria</li>
            <li>Phone: <span className="text-cream/60">[to be published]</span></li>
            <li>Email: <span className="text-cream/60">[to be published]</span></li>
            <li>Emergency: <span className="text-cream/60">[to be published]</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-forest-700 py-4 text-center text-[11px] text-cream/50">
        © {new Date().getFullYear()} Federal Medical Centre, Epe ·{" "}
        <Link to="/admin/login" className="underline hover:text-cream">staff login</Link> · <Link to="/connection-test" className="underline hover:text-cream">connection status</Link>
      </div>
    </footer>
  );
}
