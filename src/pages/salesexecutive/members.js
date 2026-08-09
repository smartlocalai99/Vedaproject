import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Plus, UserPlus, User, Phone, Pencil, Search } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { friendlyError, showError } from "@/lib/alerts";

export default function Members() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("salesExecutiveSession");
    if (!saved) { router.replace("/salesexecutive/login"); return; }
    const session = JSON.parse(saved);
    async function loadMembers() {
      const { data, error } = await supabase.from("members").select("*").eq("sales_id", session.id).order("created_at", { ascending: false });
      if (error) showError("Could not load members", friendlyError(error, "Please try again."));
      else setMembers(data || []);
      setLoading(false);
    }
    loadMembers();
  }, [router]);

  const filteredMembers = members.filter((member) => [member.full_name, member.mobile_number, member.card_number, member.email].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));

  return <div className="min-h-screen bg-[#f7f8fb] pb-24">
    <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between"><div><h1 className="text-base font-bold text-[#13273c]">Members</h1><p className="text-xs text-gray-500">Manage your registered members</p></div><button onClick={() => router.push("/salesexecutive/member")} className="flex items-center gap-1.5 rounded-xl bg-[#B97943] px-3 py-2 text-xs font-semibold text-white"><Plus size={16} /> Add Member</button></header>
    <main className="p-4">
      {members.length > 0 && <div className="mb-4 flex items-center rounded-xl border border-gray-200 bg-white px-3"><Search size={16} className="text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members" className="w-full bg-transparent px-2 py-3 text-sm outline-none" /></div>}
      {loading ? <p className="py-12 text-center text-sm text-gray-500">Loading members...</p> : members.length === 0 ? <EmptyState /> : filteredMembers.length === 0 ? <p className="py-12 text-center text-sm text-gray-500">No members match your search.</p> : <div className="space-y-3">{filteredMembers.map((member) => <article key={member.id} className="rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#B97943]"><User size={19} /></div><div className="min-w-0"><h2 className="truncate text-sm font-bold text-[#13273c]">{member.full_name}</h2><p className="text-xs text-gray-500">{member.card_number || "Member"}</p></div></div><button aria-label={`Edit ${member.full_name}`} onClick={() => router.push(`/salesexecutive/member?id=${member.id}`)} className="rounded-lg p-2 text-[#13273c] hover:bg-gray-100"><Pencil size={16} /></button></div>{member.mobile_number && <p className="mt-3 flex items-center gap-2 text-xs text-gray-500"><Phone size={13} /> {member.mobile_number}</p>}</article>)}</div>}
    </main><Footer />
  </div>;
}

function EmptyState() {
  return <div className="mt-12 rounded-2xl bg-white px-6 py-10 text-center shadow-sm"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-[#B97943]"><UserPlus size={25} /></div><h2 className="text-base font-bold text-[#13273c]">No members added yet</h2><p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-gray-500">Use the Add Member button above to create the first Veda membership card.</p></div>;
}
