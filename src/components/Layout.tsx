import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

const TITLES: [RegExp, string][] = [
  [/^\/$/, "Federal Medical Centre, Epe | Lagos"],
  [/^\/about/, "About the Centre | FMC Epe"],
  [/^\/departments\/[\w-]+/, "Department | FMC Epe"],
  [/^\/departments/, "Departments | FMC Epe"],
  [/^\/services/, "Clinical Services | FMC Epe"],
  [/^\/staff/, "Our Team | FMC Epe"],
  [/^\/news\/[\w-]+/, "News Article | FMC Epe"],
  [/^\/news/, "News & Press | FMC Epe"],
  [/^\/events/, "Events & Programmes | FMC Epe"],
  [/^\/faqs/, "FAQs | FMC Epe"],
  [/^\/careers/, "Careers & Recruitment | FMC Epe"],
  [/^\/procurement/, "Procurement Notices | FMC Epe"],
  [/^\/contact/, "Contact & Feedback | FMC Epe"],
  [/^\/appointments/, "Book an Appointment | FMC Epe"],
  [/^\/admin/, "Staff Console | FMC Epe"],
];

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    const hit = TITLES.find(([re]) => re.test(pathname));
    document.title = hit ? hit[1] : "Federal Medical Centre, Epe | Lagos";
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <Outlet />
      <PublicFooter />
    </div>
  );
}
