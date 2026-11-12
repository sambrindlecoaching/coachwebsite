import { useQuery } from "@tanstack/react-query";
import { db as supabase } from "./db";
import { AdminHeader, Bars, Panel, Stat } from "./ui";

const weekAgo = () => new Date(Date.now() - 7 * 864e5).toISOString();

export function Overview() {
  const { data } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const since = new Date(Date.now() - 56 * 864e5).toISOString();
      const [leads, clients, outreach] = await Promise.all([
        supabase.from("leads").select("created_at,source,status").gte("created_at", since),
        supabase.from("clients").select("id").eq("active", true),
        supabase.from("outreach").select("kind,created_at").gte("created_at", weekAgo()),
      ]);
      return { leads: leads.data ?? [], clients: clients.data ?? [], outreach: outreach.data ?? [] };
    },
  });

  const leads = data?.leads ?? [];
  const wk = weekAgo();
  const newThisWeek = leads.filter((l) => l.created_at >= wk).length;
  const unlocks = leads.filter((l) => l.source === "voice_notes" && l.created_at >= wk).length;
  const calls = leads.filter((l) => l.status === "call_booked").length + (data?.outreach.filter((o) => o.kind === "call_booked").length ?? 0);

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = Date.now() - (7 - i) * 7 * 864e5;
    const start = end - 7 * 864e5;
    return {
      label: new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      value: leads.filter((l) => {
        const t = new Date(l.created_at).getTime();
        return t > start && t <= end;
      }).length,
    };
  });

  const sources = ["voice_notes", "quiz", "resource", "email_series", "contact_form", "referral"].map((s) => ({
    label: s.replace("_", " ").replace("voice notes", "notes").replace("contact form", "contact").replace("email series", "series"),
    value: leads.filter((l) => l.source === s).length,
  }));

  return (
    <>
      <AdminHeader title="Morning, Sam." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New leads this week" value={newThisWeek} />
        <Stat label="Calls booked" value={calls} />
        <Stat label="Active clients" value={data?.clients.length ?? "–"} />
        <Stat label="Voice note unlocks (7 days)" value={unlocks} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel><p className="mb-4 font-semibold">Leads per week</p><Bars data={weeks} /></Panel>
        <Panel><p className="mb-4 font-semibold">Where they came from (8 weeks)</p><Bars data={sources} /></Panel>
      </div>
    </>
  );
}
