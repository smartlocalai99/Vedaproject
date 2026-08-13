import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Plus,
  Store,
  MapPin,
  Phone,
  Search,
  Trash2,
  Tag,
} from "lucide-react";

import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

import {
  friendlyError,
  showError,
  showSuccess,
  confirmDelete,
} from "@/lib/alerts";

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
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.log("LOAD VENDORS ERROR:", error);

        showError(
          "Could not load vendors",
          friendlyError(error, "Please try again.")
        );
      } else {
        setVendors(data || []);
      }

      setLoading(false);
    }

    loadVendors();
  }, [router]);

  const deleteVendor = async (vendor) => {
    const confirmation = await confirmDelete(
      "Delete vendor?",
      `Are you sure you want to delete ${
        vendor.business_name || "this vendor"
      }?`
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    const { error } = await supabase
      .from("vendors")
      .delete()
      .eq("id", vendor.id);

    if (error) {
      console.log("DELETE VENDOR ERROR:", error);

      showError(
        "Vendor deletion failed",
        friendlyError(
          error,
          "The vendor could not be deleted."
        )
      );

      return;
    }

    setVendors((previous) =>
      previous.filter((item) => item.id !== vendor.id)
    );

    await showSuccess("Vendor deleted successfully");
  };

  const filteredVendors = vendors.filter((vendor) => {
    const searchText = [
      vendor.vendor_id,
      vendor.business_name,
      vendor.owner_name,
      vendor.category,
      vendor.mobile_number,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8F4EE] pb-20">

      {/* HEADER */}

      <div className="flex items-center justify-between px-5 pt-5">

        <div>
          <h1 className="text-lg font-bold text-[#172033]">
            Vendors
          </h1>

          <p className="text-xs text-gray-500">
            Manage your registered vendors
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/salesexecutive/vendor")
          }
          className="
            flex
            items-center
            gap-1.5
            rounded-xl
            bg-[#13273c]
            px-3
            py-2
            text-xs
            font-semibold
            text-white
          "
        >
          <Plus size={14} />
          Add Vendor
        </button>

      </div>

      {/* MAIN */}

      <main className="p-4 -mt-2">

        {/* SEARCH */}

        {vendors.length > 0 && (
          <div
            className="
              mb-2
              flex
              items-center
              rounded-xl
              border
              border-gray-200
              bg-white
              px-3
            "
          >
            <Search
              size={16}
              className="text-gray-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search vendors"
              className="
                w-full
                bg-transparent
                px-2
                py-3
                text-sm
                outline-none
              "
            />
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">
            Loading vendors...
          </p>
        ) : vendors.length === 0 ? (
          <EmptyState
            title="No vendors added yet"
            description="Use the Add Vendor button above to start managing vendor offers and benefits."
          />
        ) : filteredVendors.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            No vendors match your search.
          </p>
        ) : (
          <div className="space-y-3">

            {filteredVendors.map((vendor) => (
              <article
                key={vendor.id}
                className="
                  rounded-2xl
                  bg-white
                  p-4
                  shadow-sm
                "
              >

                <div className="flex items-start justify-between gap-3">

                  {/* VENDOR DETAILS */}

                  <div className="flex min-w-0 gap-3">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-orange-100
                        text-orange-600
                      "
                    >
                      <Store size={19} />
                    </div>

                    <div className="min-w-0">

                      <h2
                        className="
                          truncate
                          text-sm
                          font-bold
                          text-[#13273c]
                        "
                      >
                        {vendor.business_name}
                      </h2>

                      {/* VENDOR ID */}

                      <p className="text-xs text-gray-500">
                        {vendor.owner_name ||
                          vendor.category ||
                          "Vendor"}
                      </p>

                      <p className="mt-1 text-[10px] text-gray-500">
                        Vendor ID:{" "}
                        {vendor.vendor_id || "-"}
                      </p>

                    </div>

                  </div>

                  {/* DELETE BUTTON */}

                  <button
                    type="button"
                    aria-label={`Delete ${
                      vendor.business_name || "vendor"
                    }`}
                    onClick={() =>
                      deleteVendor(vendor)
                    }
                    className="
                      rounded-lg
                      p-2
                      text-red-500
                      hover:bg-red-50
                    "
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

                {/* CONTACT DETAILS */}

                <div className="mt-2 space-y-1.5 text-xs text-gray-500">

                  {vendor.mobile_number && (
                    <p className="flex items-center gap-2">
                      <Phone size={13} />
                      {vendor.mobile_number}
                    </p>
                  )}

                  {vendor.address && (
                    <p className="flex items-center gap-2">
                      <MapPin size={13} />
                      {vendor.address}
                    </p>
                  )}

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

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="py-12 text-center">

      <div
        className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-[#F8F4EE]
          text-[#B97943]
        "
      >
        <Store size={22} />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#172033]">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
        {description}
      </p>

    </div>
  );
}













