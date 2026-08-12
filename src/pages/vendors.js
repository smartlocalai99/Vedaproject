import {
  Store,
  Search,
  Plus,
  ArrowLeft,
  ChevronDown,
  MapPin,
  Mail,
  Phone,
  UserRound,
  BadgeCheck,
  Trash2,
  ReceiptText,
  Users,
  IndianRupee,
  Percent,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import SuperAdminFooter from "@/components/SuperAdminFooter";
import { supabase } from "@/lib/supabase";

import {
  confirmDelete,
  friendlyError,
  showError,
  showSuccess,
} from "@/lib/alerts";

export default function Vendors() {
  const router = useRouter();

  const [vendors, setVendors] = useState([]);
  const [create, setCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salesExecutives, setSalesExecutives] = useState([]);

  const [selectedVendor, setSelectedVendor] = useState(null);

  const [vendorStats, setVendorStats] = useState({
    members: 0,
    transactions: 0,
    benefits: 0,
  });

  const [statsLoading, setStatsLoading] = useState(false);

  /* =========================================================
     LOAD VENDORS
  ========================================================= */

  const loadVendors = async () => {
    setLoading(true);

    const { data, error: loadError } = await supabase
      .from("vendors")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (loadError) {
      console.log("LOAD VENDORS ERROR:", loadError);
      setError(loadError.message);
    } else {
      setError("");
      setVendors(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadVendors();
  }, []);

  /* =========================================================
     LOAD SALES EXECUTIVES
  ========================================================= */

  useEffect(() => {
    const loadSalesExecutives = async () => {
      const { data, error: salesError } = await supabase
        .from("sales_executives")
        .select("id, employee_id, full_name")
        .order("full_name");

      if (salesError) {
        console.log(
          "LOAD SALES EXECUTIVES ERROR:",
          salesError
        );

        showError(
          "Could not load Sales IDs",
          "Sales IDs are unavailable. Please try again."
        );
      } else {
        setSalesExecutives(data || []);
      }
    };

    loadSalesExecutives();
  }, []);

  /* =========================================================
     GET SALES EXECUTIVE NAME
  ========================================================= */

  const getSalesExecutiveName = (salesId) => {
    if (!salesId) {
      return "-";
    }

    const sales = salesExecutives.find(
      (item) => item.id === salesId
    );

    if (!sales) {
      return "-";
    }

    return sales.full_name || "-";
  };

  /* =========================================================
     OPEN VENDOR DETAILS
  ========================================================= */

  const openVendorDetails = async (vendor) => {
    setSelectedVendor(vendor);

    setVendorStats({
      members: 0,
      transactions: 0,
      benefits: 0,
    });

    setStatsLoading(true);

    try {
      /* =====================================================
         GET TRANSACTIONS FOR THIS VENDOR

         IMPORTANT:
         members table does NOT have vendor_id.

         Relationship:
         transactions.vendor_id -> vendors.id
         transactions.member_id -> members.id
      ===================================================== */

      const {
        data: transactionData,
        error: transactionError,
      } = await supabase
        .from("transactions")
        .select("id, member_id, benefit_amount")
        .eq("vendor_id", vendor.id);

      if (transactionError) {
        console.log(
          "TRANSACTIONS ERROR:",
          transactionError
        );

        setVendorStats({
          members: 0,
          transactions: 0,
          benefits: 0,
        });

        setStatsLoading(false);
        return;
      }

      const transactions = transactionData || [];

      /* =====================================================
         TOTAL TRANSACTIONS
      ===================================================== */

      const transactionCount =
        transactions.length;

      /* =====================================================
         TOTAL UNIQUE MEMBERS

         We use member_id from transactions.

         Set() removes duplicate member IDs.

         Example:
         Member A -> 3 transactions
         Member B -> 2 transactions

         Total Members = 2
      ===================================================== */

      const uniqueMemberIds = new Set();

      transactions.forEach((transaction) => {
        if (transaction.member_id) {
          uniqueMemberIds.add(
            transaction.member_id
          );
        }
      });

      const memberCount =
        uniqueMemberIds.size;

      /* =====================================================
         TOTAL BENEFITS
      ===================================================== */

      const benefitTotal =
        transactions.reduce(
          (total, transaction) => {
            return (
              total +
              Number(
                transaction.benefit_amount || 0
              )
            );
          },
          0
        );

      /* =====================================================
         SET VENDOR STATS
      ===================================================== */

      setVendorStats({
        members: memberCount,
        transactions: transactionCount,
        benefits: benefitTotal,
      });

      console.log(
        "VENDOR STATS:",
        {
          vendorId: vendor.id,
          vendorCode: vendor.vendor_id,
          totalMembers: memberCount,
          totalTransactions: transactionCount,
          totalBenefits: benefitTotal,
        }
      );
    } catch (err) {
      console.log(
        "VENDOR DETAILS ERROR:",
        err
      );

      setVendorStats({
        members: 0,
        transactions: 0,
        benefits: 0,
      });
    }

    setStatsLoading(false);
  };

  /* =========================================================
     CLOSE VENDOR DETAILS
  ========================================================= */

  const closeVendorDetails = () => {
    setSelectedVendor(null);

    setVendorStats({
      members: 0,
      transactions: 0,
      benefits: 0,
    });
  };

  /* =========================================================
     DELETE VENDOR
  ========================================================= */

  const deleteVendor = async (id) => {
    const confirmation =
      await confirmDelete(
        "Delete vendor?",
        "This action cannot be undone."
      );

    if (!confirmation.isConfirmed) {
      return;
    }

    const {
      error: deleteError,
    } = await supabase
      .from("vendors")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);

      showError(
        "Vendor deletion failed",
        friendlyError(
          deleteError,
          "The vendor could not be deleted."
        )
      );
    } else {
      setSelectedVendor(null);

      await showSuccess(
        "Vendor deleted successfully"
      );

      loadVendors();
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredVendors =
    vendors.filter((vendor) =>
      [
        vendor.owner_name,
        vendor.business_name,
        vendor.category,
        vendor.address,
        vendor.mobile_number,
        vendor.email,
        vendor.vendor_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  /* =========================================================
     VENDOR DETAILS VIEW
  ========================================================= */

  if (selectedVendor) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-24">
        {/* HEADER */}

        <div className="flex items-center px-5 pt-5">
          <button
            type="button"
            onClick={closeVendorDetails}
            className="
              w-7
              h-7
              rounded
              flex
              items-center
              justify-center
              bg-[#F8F4EE]
            "
          >
            <ArrowLeft size={18} />
          </button>

          <div className="ml-3">
            <h1 className="text-lg font-bold text-[#172033]">
              Vendor
            </h1>

            <p className="text-xs text-gray-500">
              Vendor Details
            </p>
          </div>
        </div>

        {/* PROFILE */}

        <div className="mx-5 mt-5 bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center">
            <div
              className="
                w-16
                h-16
                rounded-full
                bg-[#172033]
                text-white
                flex
                items-center
                justify-center
              "
            >
              <Store size={26} />
            </div>

            <div className="ml-4">
              <p className="text-lg font-bold text-[#172033]">
                {selectedVendor.business_name ||
                  "-"}
              </p>

              <p className="text-[10px] text-gray-500 mt-1">
                Vendor ID:{" "}
                {selectedVendor.vendor_id ||
                  "-"}
              </p>
            </div>
          </div>

          {/* BASIC DETAILS */}

          <div className="mt-5 space-y-3">
            <DetailRow
              icon={<UserRound size={15} />}
              label="Vendor Name"
              value={
                selectedVendor.owner_name ||
                "-"
              }
            /> 

            <DetailRow
              icon={<Phone size={15} />}
              label="Mobile"
              value={
                selectedVendor.mobile_number ||
                "-"
              }
            />

            <DetailRow
              icon={<Mail size={15} />}
              label="Email"
              value={
                selectedVendor.email ||
                "-"
              }
            />

            <DetailRow
              icon={<MapPin size={15} />}
              label="Address"
              value={
                selectedVendor.address ||
                "-"
              }
            />

            {/* OFFER PERCENTAGE */}

            <DetailRow
              icon={<Percent size={15} />}
              label="Offer"
              value={
                selectedVendor.offer_percentage !==
                  null &&
                selectedVendor.offer_percentage !==
                  undefined &&
                selectedVendor.offer_percentage !==
                  ""
                  ? `${selectedVendor.offer_percentage}%`
                  : "-"
              }
            />

            <DetailRow
              icon={<BadgeCheck size={15} />}
              label="Sales Executive"
              value={getSalesExecutiveName(
                selectedVendor.sales_id
              )}
            />
          </div>
        </div>

        {/* ACTIVITY SUMMARY */}

        <div className="mx-5 mt-4">
          <h2 className="text-sm font-bold text-[#172033] mb-2">
            Activity Summary
          </h2>

          <div className="space-y-2">
            {/* TOTAL MEMBERS */}

            <VendorStat
              icon={<Users size={18} />}
              title="Total Members"
              value={
                statsLoading
                  ? "..."
                  : vendorStats.members
              }
            />

            {/* TOTAL TRANSACTIONS */}

            <VendorStat
              icon={<ReceiptText size={18} />}
              title="Total Transactions"
              value={
                statsLoading
                  ? "..."
                  : vendorStats.transactions
              }
            />

            {/* TOTAL BENEFITS */}

            <VendorStat
              icon={<IndianRupee size={18} />}
              title="Total Benefits"
              value={
                statsLoading
                  ? "..."
                  : `₹${Number(
                      vendorStats.benefits
                    ).toLocaleString("en-IN")}`
              }
            />
          </div>
        </div>

        {/* DELETE */}

        <div className="mx-5 mt-4">
          <button
            type="button"
            onClick={() =>
              deleteVendor(
                selectedVendor.id
              )
            }
            className="
              w-full
              border
              border-red-300
              text-red-600
              bg-white
              rounded-xl
              px-4
              py-3
              text-xs
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <Trash2 size={14} />
            Delete Vendor
          </button>
        </div>

        <SuperAdminFooter />
      </div>
    );
  }

  /* =========================================================
     MAIN VENDOR LIST
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* HEADER */}

      <div className="flex items-center justify-between px-5 pt-5">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="
            w-7
            h-7
            rounded
            flex
            items-center
            justify-center
            bg-[#F8F4EE]
          "
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 ml-3">
          <h1 className="text-lg font-bold text-[#172033]">
            Vendors
          </h1>

          <p className="text-xs text-gray-500">
            Manage all vendors
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreate(true);

            setTimeout(() => {
              document
                .getElementById(
                  "create-vendor-form"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }, 100);
          }}
          className="
            bg-[#172033]
            text-white
            text-xs
            px-3
            py-2
            rounded-md
            flex
            items-center
            gap-2
          "
        >
          <Plus size={14} />
          Add Vendor
        </button>
      </div>

      {/* SEARCH */}

      <div
        className="
          mx-5
          mt-2
          bg-white
          rounded-xl
          px-4
          py-3
          flex
          items-center
          gap-3
          shadow-sm
        "
      >
        <Search
          size={16}
          className="text-gray-400"
        />

        <input
          placeholder="Search vendors"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            outline-none
            text-xs
            w-full
          "
        />
      </div>

      {/* LOADING */}

      {loading && (
        <p className="text-xs text-gray-500 px-5 mt-4">
          Loading vendors...
        </p>
      )}

      {/* ERROR */}

      {error && (
        <p className="text-xs text-red-500 px-5 mt-4">
          {error}
        </p>
      )}

      {/* VENDOR LIST */}

      <div className="px-5 mt-2 space-y-3">
        {filteredVendors.map(
          (vendor) => (
            <div
              key={vendor.id}
              className="
                bg-white
                rounded-xl
                p-4
                shadow-sm
              "
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    openVendorDetails(
                      vendor
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    text-left
                    flex-1
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-[#172033]
                      text-white
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Store size={18} />
                  </div>

                  <div>
                    <p
                      className="
                        text-sm
                        font-bold
                        text-[#172033]
                      "
                    >
                      {vendor.business_name ||
                        "Vendor"}
                    </p>

                    <p
                      className="
                        text-[10px]
                        text-gray-500
                        mt-1
                      "
                    >
                      Vendor ID:{" "}
                      {vendor.vendor_id ||
                        "-"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openVendorDetails(
                      vendor
                    )
                  }
                  className="
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    bg-[#F8F4EE]
                    text-[#172033]
                    flex-shrink-0
                  "
                >
                  <ChevronDown
                    size={16}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>
          )
        )}

        {!loading &&
          filteredVendors.length ===
            0 && (
            <div
              className="
                bg-white
                rounded-xl
                p-5
                text-center
                shadow-sm
              "
            >
              <p className="text-xs text-gray-500">
                No vendors found.
              </p>
            </div>
          )}
      </div>

      {/* CREATE VENDOR */}

      {create && (
        <div
          id="create-vendor-form"
          className="px-5 mt-5"
        >
          <CreateVendor
            close={() =>
              setCreate(false)
            }
            salesExecutives={
              salesExecutives
            }
            addVendor={async (
              data
            ) => {
              setError("");

              /* CHECK SALES ID */

              if (data.sales_id) {
                const validSales =
                  salesExecutives.some(
                    (sales) =>
                      sales.id ===
                      data.sales_id
                  );

                if (!validSales) {
                  showError(
                    "Invalid Sales ID",
                    "Select a valid Sales ID."
                  );

                  return;
                }
              }

              /* CREATE VENDOR */

              const {
                error: insertError,
              } = await supabase
                .from("vendors")
                .insert(data);

              if (insertError) {
                console.log(
                  "CREATE VENDOR ERROR:",
                  insertError
                );

                setError(
                  insertError.message
                );

                showError(
                  "Vendor creation failed",
                  friendlyError(
                    insertError,
                    "The vendor could not be created."
                  )
                );

                return;
              }

              setCreate(false);

              await showSuccess(
                "Vendor created successfully"
              );

              loadVendors();
            }}
          />
        </div>
      )}

      {/* FOOTER */}

      <SuperAdminFooter />
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          w-7
          h-7
          rounded-full
          bg-[#F8F4EE]
          flex
          items-center
          justify-center
          text-[#172033]
          flex-shrink-0
        "
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-500">
          {label}
        </p>

        <p className="text-xs font-semibold text-[#172033] mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   VENDOR STAT
========================================================= */

function VendorStat({
  icon,
  title,
  value,
}) {
  return (
    <div
      className="
        bg-white
        rounded-xl
        px-4
        py-3
        flex
        items-center
        justify-between
        shadow-sm
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            w-9
            h-9
            rounded-full
            bg-[#F8F4EE]
            flex
            items-center
            justify-center
            text-[#B97943]
          "
        >
          {icon}
        </div>

        <p className="text-xs font-semibold text-[#172033]">
          {title}
        </p>
      </div>

      <p className="text-sm font-bold text-[#172033]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   CREATE VENDOR
========================================================= */

function CreateVendor({
  close,
  addVendor,
  salesExecutives,
}) {
  const [form, setForm] = useState({
    vendor_id: "",
    name: "",
    business_name: "",
    category: "",
    location: "",
    phone: "",
    email: "",
    sales_id: "",
    offer: "",
  });

  /* =========================================================
     UPDATE FORM
  ========================================================= */

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  /* =========================================================
     ENABLE BUTTON
  ========================================================= */

  const enable =
    form.vendor_id.trim() &&
    form.name.trim() &&
    form.business_name.trim() &&
    form.category.trim() &&
    form.location.trim() &&
    form.phone.trim() &&
    form.email.trim();

  /* =========================================================
     CREATE VENDOR
  ========================================================= */

  const createVendor = () => {
    const cleanPhone =
      form.phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      showError(
        "Invalid mobile number",
        "Please enter a valid mobile number."
      );

      return;
    }

    addVendor({
      vendor_id:
        form.vendor_id.trim(),

      owner_name:
        form.name.trim(),

      business_name:
        form.business_name.trim(),

      category:
        form.category.trim(),

      mobile_number:
        form.phone.trim(),

      email:
        form.email.trim(),

      sales_id:
        form.sales_id || null,

      address:
        form.location.trim(),

      /* DATABASE COLUMN */

      offer_percentage:
        form.offer !== ""
          ? Number(form.offer)
          : null,
    });
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      {/* TITLE */}

      <div className="mb-5">
        <h2
          className="
            text-sm
            font-bold
            text-[#172033]
          "
        >
          CREATE VENDOR
        </h2>
      </div>

      {/* FORM */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-x-5
          gap-y-5
        "
      >

        {/* VENDOR NAME */}

        <Input
          icon={<UserRound size={14} />}
          label="Vendor Name"
          placeholder="Enter Vendor Name"
          value={form.name}
          change={(v) =>
            update("name", v)
          }
        />

        {/* BUSINESS NAME */}

        <Input
          icon={<Store size={14} />}
          label="Business Name"
          placeholder="Enter Business Name"
          value={form.business_name}
          change={(v) =>
            update(
              "business_name",
              v
            )
          }
        />

        {/* CATEGORY */}

        <Input
          icon={<Store size={14} />}
          label="Category"
          placeholder="Pharmacy"
          value={form.category}
          change={(v) =>
            update("category", v)
          }
        />

        {/* LOCATION */}

        <Input
          icon={<MapPin size={14} />}
          label="Location"
          placeholder="Enter Location"
          value={form.location}
          change={(v) =>
            update("location", v)
          }
        />

        {/* PHONE */}

        <Input
          icon={<Phone size={14} />}
          label="Phone"
          placeholder="Enter Phone"
          value={form.phone}
          change={(v) =>
            update("phone", v)
          }
        />

        {/* EMAIL */}

        <Input
          icon={<Mail size={14} />}
          label="Email"
          placeholder="Enter Email"
          value={form.email}
          change={(v) =>
            update("email", v)
          }
        />

        {/* OFFER */}

        <Input
          icon={<Percent size={14} />}
          label="Offer (%)"
          placeholder="Enter Offer Percentage"
          value={form.offer}
          change={(v) =>
            update("offer", v)
          }
        />

        {/* SALES ID */}

        <div>
          <label
            className="
              block
              text-[10px]
              text-[#172033]
              mb-1.5
            "
          >
            Sales ID
          </label>

          <div
            className="
              h-[32px]
              border
              border-[#172033]
              rounded-[4px]
              flex
              items-center
              px-2.5
              bg-white
            "
          >
            <BadgeCheck
              size={14}
              className="text-gray-400 mr-2"
            />

            <select
              value={form.sales_id}
              onChange={(e) =>
                update(
                  "sales_id",
                  e.target.value
                )
              }
              className="
                outline-none
                text-[10px]
                text-[#172033]
                w-full
                bg-transparent
              "
            >
              <option value="">
                Select Sales ID
              </option>

              {salesExecutives.map(
                (sales) => (
                  <option
                    key={sales.id}
                    value={sales.id}
                  >
                    {sales.employee_id} -{" "}
                    {sales.full_name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* BUTTONS */}

      <div
        className="
          flex
          items-center
          justify-end
          gap-2
          mt-6
          pb-2
        "
      >
        <button
          type="button"
          onClick={close}
          className="
            border
            border-gray-300
            px-5
            py-2
            rounded-md
            text-xs
            text-gray-700
          "
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={!enable}
          onClick={createVendor}
          className={`
            px-5
            py-2
            rounded-md
            text-xs
            text-white
            ${
              enable
                ? "bg-[#172033]"
                : "bg-gray-400 cursor-not-allowed"
            }
          `}
        >
          Create Vendor
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  icon,
  label,
  placeholder,
  value,
  change,
}) {
  return (
    <div>
      <label
        className="
          block
          text-[10px]
          text-[#172033]
          mb-1.5
        "
      >
        {label}
      </label>

      <div
        className="
          h-[32px]
          border
          border-[#172033]
          rounded-[4px]
          flex
          items-center
          px-2.5
          bg-white
        "
      >
        <span
          className="
            text-gray-400
            mr-2
            flex
            items-center
          "
        >
          {icon}
        </span>

        <input
          value={value}
          onChange={(e) =>
            change(e.target.value)
          }
          placeholder={placeholder}
          className="
            outline-none
            text-[10px]
            text-[#172033]
            w-full
            bg-transparent
          "
        />
      </div>
    </div>
  );
}