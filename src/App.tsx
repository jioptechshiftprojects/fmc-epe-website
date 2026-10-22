import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Departments from "./pages/Departments";
import DepartmentDetail from "./pages/DepartmentDetail";
import Services from "./pages/Services";
import StaffDirectory from "./pages/StaffDirectory";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Events from "./pages/Events";
import Announcements from "./pages/Announcements";
import Faqs from "./pages/Faqs";
import Careers from "./pages/Careers";
import Procurement from "./pages/Procurement";
import Contact from "./pages/Contact";
import Appointments from "./pages/Appointments";
import ConnectionTest from "./pages/ConnectionTest";
import TrainingHome from "./pages/TrainingHome";
import TrainingProgram from "./pages/TrainingProgram";
import NursingApply from "./pages/NursingApply";
import PortalGuard from "./portal/PortalGuard";
import PortalLogin from "./portal/PortalLogin";
import PortalHome from "./portal/PortalHome";
import PortalProfile from "./portal/PortalProfile";
import PortalResults from "./portal/PortalResults";
import PortalFees from "./portal/PortalFees";
import AdminGuard from "./admin/AdminGuard";
import AdminLogin from "./admin/pages/Login";
import AdminDashboard from "./admin/pages/Dashboard";
import InboxAppointments from "./admin/pages/InboxAppointments";
import InboxFeedback from "./admin/pages/InboxFeedback";
import CrudPage from "./admin/pages/CrudPage";
import MediaLibrary from "./admin/pages/Media";
import AdminsPage from "./admin/pages/Admins";
import AuditLog from "./admin/pages/AuditLog";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:slug" element={<DepartmentDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/staff" element={<StaffDirectory />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/connection-test" element={<ConnectionTest />} />
          <Route path="/training" element={<TrainingHome />} />
          <Route path="/training/:slug" element={<TrainingProgram />} />
          <Route path="/training/nursing/apply" element={<NursingApply />} />
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal" element={<PortalGuard />}>
            <Route index element={<PortalHome />} />
            <Route path="profile" element={<PortalProfile />} />
            <Route path="results" element={<PortalResults />} />
            <Route path="fees" element={<PortalFees />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard />}>
            <Route index element={<AdminDashboard />} />
            <Route path="inbox/appointments" element={<InboxAppointments />} />
            <Route path="inbox/feedback" element={<InboxFeedback />} />
            <Route path="content/:entity" element={<CrudPage />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="audit" element={<AuditLog />} />
          </Route>
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
