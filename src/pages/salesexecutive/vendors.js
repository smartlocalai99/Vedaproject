import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Plus, Store, MapPin, Phone, Pencil, Search } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { friendlyError, showError } from "@/lib/alerts";

export default function Vendors() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("salesExecutiveSession");
    if (!saved) {
      router.replace("/salesexecutive/login");
      return;
    }

    const session = JSON.parse(saved);
    async function loadVendors() {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("sales_id", session.id)
        .order("created_at", { ascending: false });

      if (error) showError("Could not load vendors", friendlyError(error, "Please try again."));
      else setVendors(data || []);
      setLoading(false);
    }
    loadVendors();
  }, [router]);

  const filteredVendors = vendors.filter((vendor) =>
    [vendor.business_name, vendor.owner_name, vendor.category, vendor.mobile_number]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f8fb] pb-24">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-[#13273c]">Vendors</h1>
          <p className="text-xs text-gray-500">Manage your registered vendors</p>
        </div>
        <button onClick={() => router.push("/salesexecutive/vendor")} className="flex items-center gap-1.5 rounded-xl bg-[#13273c] px-3 py-2 text-xs font-semibold text-white">
          <Plus size={16} /> Add Vendor
        </button>
      </header>

      <main className="p-4">
        {vendors.length > 0 && (
          <div className="mb-4 flex items-center rounded-xl border border-gray-200 bg-white px-3">
            <Search size={16} className="text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vendors" className="w-full bg-transparent px-2 py-3 text-sm outline-none" />
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading vendors...</p>
        ) : vendors.length === 0 ? (
          <EmptyState title="No vendors added yet" description="Use the Add Vendor button above to start managing vendor offers and benefits." />
        ) : filteredVendors.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No vendors match your search.</p>
        ) : (
          <div className="space-y-3">
            {filteredVendors.map((vendor) => (
              <article key={vendor.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Store size={19} /></div>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-[#13273c]">{vendor.business_name}</h2>
                      <p className="text-xs text-gray-500">{vendor.owner_name || vendor.category || "Vendor"}</p>
                    </div>
                  </div>
                  <button aria-label={`Edit ${vendor.business_name}`} onClick={() => router.push(`/salesexecutive/vendor?id=${vendor.id}`)} className="rounded-lg p-2 text-[#13273c] hover:bg-gray-100"><Pencil size={16} /></button>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                  {vendor.mobile_number && <p className="flex items-center gap-2"><Phone size={13} /> {vendor.mobile_number}</p>}
                  {vendor.address && <p className="flex items-center gap-2"><MapPin size={13} /> {vendor.address}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function EmptyState({ title, description }) {
  return <div className="mt-12 rounded-2xl bg-white px-6 py-10 text-center shadow-sm"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600"><Store size={25} /></div><h2 className="text-base font-bold text-[#13273c]">{title}</h2><p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-gray-500">{description}</p></div>;
}
