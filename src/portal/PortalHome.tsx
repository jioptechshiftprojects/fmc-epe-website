import { Link } from "react-router-dom";
import { useQuery } from "../lib/hooks";
import { supabase } from "../lib/supabase";
import { useStudent } from "./useStudent";

export default function PortalHome() {
  const { profile, userId } = useStudent();

  const { data: fees } = useQuery(
    () => supabase.from("fee_payments").select("*").eq("student_id", profile!.id).order("created_at", { ascending: false }),
    [profile?.id]
  );
  const { data: results } = useQuery(
    () => supabase.from("academic_results").select("*").eq("student_id", profile!.id).order("created_at", { ascending: false }),
    [profile?.id]
  );

  if (!profile || !userId) return null;
  const verifiedAdmission = (fees ?? []).some((f) => f.kind === "admission" && f.status === "verified");
  const pendingFees = (fees ?? []).filter((f) => f.status === "pending").length;

  const statusCard = () => {
    if (profile.admission_status === "admitted") {
      if (profile.category === "applicant") {
        return verifiedAdmission
          ? { tone: "ok", title: "Admission fee verified", body: "Congratulations — proceed to My Profile and tap “Complete enrollment” to activate your student record." }
          : { tone: "warn", title: "You have been offered admission", body: "Pay the admission fee at the school office, then upload your payment evidence under Fees. The school will verify it and you can then complete your enrollment." };
      }
      return { tone: "ok", title: "Enrollment active", body: "Your student record is active. Keep your profile and fee evidence up to date." };
    }
    if (profile.admission_status === "rejected")
      return { tone: "bad", title: "Application not successful", body: "Unfortunately this application was not successful. Contact the school office for guidance on the next intake." };
    if (profile.admission_status === "under_review")
      return { tone: "info", title: "Application under review", body: "The admissions committee is reviewing your application. Check back here for updates." };
    return { tone: "info", title: "Application submitted", body: "Your application has been received and is awaiting review. You will see updates here as they happen." };
  };

  const s = statusCard();
  const tones: Record<string, string> = {
    ok: "border-forest-200 bg-forest-50",
    warn: "border-gold-500 bg-gold-100",
    bad: "border-red-200 bg-red-50",
    info: "border-forest-100 bg-white",
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-forest-800">Hello, {profile.full_name}</h1>
      <p className="mb-5 text-sm text-forest-900/60">
        {profile.category === "applicant" ? "Applicant" : profile.category === "fresh" ? "Fresh Student" : "Returning Student"}
        {" · "}{profile.current_session || "Session to be assigned"}
      </p>

      <div className={`mb-6 rounded-xl border p-5 ${tones[s.tone]}`}>
        <p className="font-bold text-forest-800">{s.title}</p>
        <p className="mt-1 text-sm text-forest-900/70">{s.body}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/portal/fees" className="card transition hover:-translate-y-0.5 hover:border-gold-500">
          <p className="text-3xl font-bold text-forest-800">{pendingFees}</p>
          <p className="text-sm text-forest-900/65">fee payment(s) awaiting verification</p>
        </Link>
        <Link to="/portal/results" className="card transition hover:-translate-y-0.5 hover:border-gold-500">
          <p className="text-3xl font-bold text-forest-800">{(results ?? []).length}</p>
          <p className="text-sm text-forest-900/65">result record(s) published</p>
        </Link>
        <Link to="/portal/profile" className="card transition hover:-translate-y-0.5 hover:border-gold-500">
          <p className="text-3xl font-bold text-forest-800">{profile.current_year || "—"}</p>
          <p className="text-sm text-forest-900/65">current year / session no.</p>
        </Link>
      </div>

      {profile.category !== "applicant" && (
        <div className="card mt-6">
          <p className="font-bold text-forest-800">Quick links</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-forest-900/70">
            <li><Link className="underline" to="/portal/fees">Upload school-fee evidence</Link></li>
            <li><Link className="underline" to="/portal/results">Check your results</Link></li>
            <li><Link className="underline" to="/portal/profile">Update your profile</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
}
