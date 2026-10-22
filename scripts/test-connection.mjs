/**
 * FMC EPE — Supabase proof-of-connection (terminal version).
 *
 * Usage:
 *   SUPABASE_URL=https://YOUR_REF.supabase.co \
 *   SUPABASE_ANON_KEY=YOUR_ANON_KEY \
 *   node scripts/test-connection.mjs
 *
 * Exits 0 only if all five checks pass. Test data only.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.");
  process.exit(2);
}

const supabase = createClient(url, anonKey);
const results = [];

function report(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}
      ${detail}`);
}

// 1. Read an approved (seeded) test record
const read = await supabase.from("connection_tests").select("*").order("created_at", { ascending: false }).limit(10);
report(
  "Read approved test record",
  !read.error && (read.data?.length ?? 0) > 0,
  read.error ? read.error.message : `${read.data.length} row(s) returned`
);

// 2. Submit a harmless test record
const write = await supabase
  .from("connection_tests")
  .insert({ note: `CLI connection test at ${new Date().toISOString()}`, created_by: "cli-test" })
  .select();
const insertedId = write.data?.[0]?.id;
report("Submit harmless test record", !write.error && !!insertedId, write.error ? write.error.message : `inserted ${insertedId}`);

// 3. Confirm persistence (fresh read must find the just-inserted row)
const verify = insertedId
  ? await supabase.from("connection_tests").select("id").eq("id", insertedId)
  : { data: [], error: { message: "no id from step 2" } };
report(
  "Record persists (re-read)",
  !verify.error && (verify.data?.length ?? 0) === 1,
  verify.error ? verify.error.message : "row still present"
);

// 4. Unauthorised read must be denied (RLS → zero rows)
const adminRead = await supabase.from("admin_profiles").select("*");
report(
  "Unauthorised read of admin_profiles denied",
  !adminRead.error && (adminRead.data?.length ?? 0) === 0,
  adminRead.error ? `unexpected error: ${adminRead.error.message}` : `${adminRead.data.length} rows leaked`
);

// 5. Unauthorised write must be denied — target a REAL row (zero-row writes
// never evaluate RLS and false-pass). Inserted row is used as the probe.
const before = await supabase.from("connection_tests").select("note").eq("id", insertedId).single();
const upd = await supabase.from("connection_tests").update({ note: "SHOULD NOT STICK" }).eq("id", insertedId);
const after = await supabase.from("connection_tests").select("note").eq("id", insertedId).single();
const unchanged = !after.error && before.data && after.data && before.data.note === after.data.note;
report(
  "Unauthorised write on real row denied",
  unchanged,
  unchanged
    ? `write had no effect${upd.error ? ` (${upd.error.code ?? "err"}: ${upd.error.message})` : ""}`
    : "SECURITY FAILURE: anonymous update CHANGED the stored value!"
);

const failed = results.filter((r) => !r.pass).length;
console.log(failed === 0 ? "
ALL CHECKS PASSED — foundation verified." : `
${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
