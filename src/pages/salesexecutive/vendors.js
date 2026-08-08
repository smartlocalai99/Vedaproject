
import { Store, Search, Plus, ArrowLeft, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { confirmDelete, friendlyError, showError, showSuccess } from "@/lib/alerts";

export default function SalesVendors() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const loadVendors = async (salesId) => {
    setLoading(true);
    const { data, error } = await supabase.from("vendors").select("*").eq("sales_id", salesId).order("created_at", { ascending: false });
    setLoading(false);
    if (error) return showError("Could not load vendors", friendlyError(error, "Please try again."));
    setVendors(data || []);
  };

  useEffect(() => {
    const saved = localStorage.getItem("salesExecutiveSession");
    if (!saved) { router.replace("/salesexecutive/login"); return; }
    const currentSession = JSON.parse(saved);
    setSession(currentSession);
    loadVendors(currentSession.id);
  }, [router]);

  const deleteVendor = async (vendor) => {
    const result = await confirmDelete("Delete vendor?", `Delete ${vendor.business_name}?`);
    if (!result.isConfirmed) return;
    const { error } = await supabase.from("vendors").delete().eq("id", vendor.id).eq("sales_id", session.id);
    if (error) return showError("Vendor deletion failed", friendlyError(error, "The vendor could not be deleted."));
    await showSuccess("Vendor deleted successfully");
    loadVendors(session.id);
  };

  const filtered = vendors.filter((vendor) => [vendor.business_name, vendor.category, vendor.address, vendor.mobile_number].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));

  return <><main className="bg-[#F8F4EE] min-h-screen pb-24 p-5 text-[#1B2232]">
    <div className="flex justify-between items-center"><div className="flex items-center gap-2"><button onClick={() => router.push("/")} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200"><ArrowLeft size={16}/></button><div><h1 className="font-bold text-sm">Total Vendors</h1><p className="text-[10px] text-gray-500">Manage all vendors</p></div></div><button onClick={() => router.push("/salesexecutive/vendor")} className="bg-[#172033] text-white text-xs px-4 py-2 rounded-md flex items-center gap-2"><Plus size={14}/>Add Vendor</button></div>
    <div className="bg-white rounded-lg mt-2 h-10 flex items-center px-3 gap-2"><Search size={16} className="text-gray-400"/><input placeholder="Search vendors" value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none text-xs w-full"/></div>
    <div className="mt-3 space-y-3">{loading ? <p className="text-xs text-gray-500">Loading vendors...</p> : filtered.length === 0 ? <p className="text-xs text-gray-500">No vendors found</p> : filtered.map((vendor) => <div key={vendor.id} className="bg-white rounded-lg p-3 shadow-sm"><div className="flex justify-between items-center"><div className="flex gap-3 items-center"><div className="w-10 h-10 rounded-full bg-[#F3E8DA] flex items-center justify-center text-[#B97943]"><Store size={20}/></div><div><h3 className="text-xs font-bold">{vendor.business_name}</h3><p className="text-[10px] text-gray-500">{vendor.category}</p><p className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={10}/>{vendor.address}</p></div></div><div className="text-[10px] flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${vendor.status === "Active" ? "bg-green-500" : "bg-red-500"}`}/><span>{vendor.status}</span><button onClick={() => router.push(`/salesexecutive/vendor?id=${vendor.id}`)} className="border rounded px-2 py-1">Edit</button><button onClick={() => deleteVendor(vendor)} className="border rounded px-2 py-1">Delete</button></div></div></div>)}</div>
  </main><Footer/></>;
}
