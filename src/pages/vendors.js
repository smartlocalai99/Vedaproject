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
  Pencil,
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

      showError(
        "Could not load vendors",
        friendlyError(
          loadError,
          "Vendors could not be loaded."
        )
      );
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
      const {
        data: transactionData,
        error: transactionError,
      } = await supabase
        .from("transactions")
        .select(
          "id, member_id, benefit_amount"
        )
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

      const transactionCount =
        transactions.length;

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
     UPDATE VENDOR
  ========================================================= */

  const updateVendor = async (updatedData) => {
    if (!selectedVendor?.id) {
      return;
    }

    setError("");

    const {
      error: updateError,
    } = await supabase
      .from("vendors")
      .update(updatedData)
      .eq("id", selectedVendor.id);

    if (updateError) {
      console.log(
        "UPDATE VENDOR ERROR:",
        updateError
      );

      setError(updateError.message);

      showError(
        "Vendor update failed",
        friendlyError(
          updateError,
          "The vendor could not be updated."
        )
      );

      return;
    }

    await showSuccess(
      "Vendor updated successfully"
    );

    setSelectedVendor(null);

    await loadVendors();
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
        vendor.subcategory,
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
      <VendorDetails
        vendor={selectedVendor}
        vendorStats={vendorStats}
        statsLoading={statsLoading}
        salesExecutives={salesExecutives}
        getSalesExecutiveName={
          getSalesExecutiveName
        }
        close={closeVendorDetails}
        deleteVendor={deleteVendor}
        updateVendor={updateVendor}
      />
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
   VENDOR DETAILS
========================================================= */

function VendorDetails({
  vendor,
  vendorStats,
  statsLoading,
  salesExecutives,
  getSalesExecutiveName,
  close,
  deleteVendor,
  updateVendor,
}) {
  const [editing, setEditing] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* HEADER */}

      <div className="flex items-center px-5 pt-5">
        <button
          type="button"
          onClick={close}
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
              {vendor.business_name ||
                "-"}
            </p>

            <p className="text-[10px] text-gray-500 mt-1">
              Vendor ID:{" "}
              {vendor.vendor_id || "-"}
            </p>
          </div>
        </div>

        {!editing && (
          <>
            {/* BASIC DETAILS */}

            <div className="mt-5 space-y-3">
              <DetailRow
                icon={
                  <UserRound size={15} />
                }
                label="Vendor Name"
                value={
                  vendor.owner_name ||
                  "-"
                }
              />

              <DetailRow
                icon={
                  <Phone size={15} />
                }
                label="Mobile"
                value={
                  vendor.mobile_number ||
                  "-"
                }
              />

              <DetailRow
                icon={
                  <Mail size={15} />
                }
                label="Email"
                value={
                  vendor.email || "-"
                }
              />

              <DetailRow
                icon={
                  <MapPin size={15} />
                }
                label="Address"
                value={
                  vendor.address || "-"
                }
              />

              <DetailRow
                icon={
                  <Store size={15} />
                }
                label="Category"
                value={
                  vendor.category || "-"
                }
              />

              <DetailRow
                icon={
                  <Store size={15} />
                }
                label="Subcategory"
                value={
                  vendor.subcategory ||
                  "-"
                }
              />

              <DetailRow
                icon={
                  <Percent size={15} />
                }
                label="Offer"
                value={
                  vendor.offer_percentage !==
                    null &&
                  vendor.offer_percentage !==
                    undefined &&
                  vendor.offer_percentage !==
                    ""
                    ? `${vendor.offer_percentage}%`
                    : "-"
                }
              />

              <DetailRow
                icon={
                  <BadgeCheck
                    size={15}
                  />
                }
                label="Sales Executive"
                value={getSalesExecutiveName(
                  vendor.sales_id
                )}
              />
            </div>

            {/* EDIT */}

            <div className="mt-5">
              <button
                type="button"
                onClick={() =>
                  setEditing(true)
                }
                className="
                  w-full
                  bg-[#172033]
                  text-white
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
                <Pencil size={14} />
                Edit Vendor
              </button>
            </div>
          </>
        )}

        {editing && (
          <div className="mt-5">
            <EditVendor
              vendor={vendor}
              salesExecutives={
                salesExecutives
              }
              cancel={() =>
                setEditing(false)
              }
              save={async (data) => {
                await updateVendor(
                  data
                );

                setEditing(false);
              }}
            />
          </div>
        )}
      </div>

      {/* ACTIVITY SUMMARY */}

      {!editing && (
        <>
          <div className="mx-5 mt-4">
            <h2 className="text-sm font-bold text-[#172033] mb-2">
              Activity Summary
            </h2>

            <div className="space-y-2">
              <VendorStat
                icon={
                  <Users size={18} />
                }
                title="Total Members"
                value={
                  statsLoading
                    ? "..."
                    : vendorStats.members
                }
              />

              <VendorStat
                icon={
                  <ReceiptText
                    size={18}
                  />
                }
                title="Total Transactions"
                value={
                  statsLoading
                    ? "..."
                    : vendorStats.transactions
                }
              />

              <VendorStat
                icon={
                  <IndianRupee
                    size={18}
                  />
                }
                title="Total Benefits"
                value={
                  statsLoading
                    ? "..."
                    : `₹${Number(
                        vendorStats.benefits
                      ).toLocaleString(
                        "en-IN"
                      )}`
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
                  vendor.id
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
        </>
      )}

      <SuperAdminFooter />
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
    category_id: "",
    subcategory: "",
    location: "",
    phone: "",
    email: "",
    sales_id: "",
    offer: "",
  });

  const [categories, setCategories] =
    useState([]);

  const [
    subcategories,
    setSubcategories,
  ] = useState([]);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(false);

  const [
    subcategoriesLoading,
    setSubcategoriesLoading,
  ] = useState(false);

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("vendor_categories")
        .select("*")
        .order("id", {
          ascending: true,
        });

      if (error) {
        console.error(
          "LOAD VENDOR CATEGORIES ERROR:",
          error
        );

        showError(
          "Could not load categories",
          "Vendor categories could not be loaded. Please try again."
        );

        setCategories([]);
      } else {
        setCategories(data || []);
      }

      setCategoriesLoading(false);
    };

    loadCategories();
  }, []);

  /* =========================================================
     LOAD SUBCATEGORIES WHEN CATEGORY CHANGES
  ========================================================= */

  useEffect(() => {
    const loadSubcategories =
      async () => {
        if (!form.category_id) {
          setSubcategories([]);
          return;
        }

        setSubcategories([]);
        setSubcategoriesLoading(
          true
        );

        const {
          data,
          error,
        } = await supabase
          .from(
            "vendor_subcategories"
          )
          .select("*")
          .eq(
            "category_id",
            form.category_id
          )
          .order("id", {
            ascending: true,
          });

        if (error) {
          console.error(
            "LOAD VENDOR SUBCATEGORIES ERROR:",
            error
          );

          showError(
            "Could not load subcategories",
            "Subcategories could not be loaded. Please try again."
          );

          setSubcategories([]);
        } else {
          setSubcategories(
            data || []
          );
        }

        setSubcategoriesLoading(
          false
        );
      };

    loadSubcategories();
  }, [form.category_id]);

  /* =========================================================
     UPDATE FORM
  ========================================================= */

  const update = (
    key,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  /* =========================================================
     CATEGORY CHANGE
  ========================================================= */

  const handleCategoryChange = (
    categoryId
  ) => {
    const selectedCategory =
      categories.find(
        (category) =>
          String(category.id) ===
          String(categoryId)
      );

    setForm((previous) => ({
      ...previous,
      category_id:
        categoryId,
      category:
        selectedCategory?.name ||
        "",
      subcategory: "",
    }));

    setSubcategories([]);
  };

  /* =========================================================
     ENABLE BUTTON
  ========================================================= */

  const enable =
    form.vendor_id.trim() &&
    form.name.trim() &&
    form.business_name.trim() &&
    form.category.trim() &&
    form.subcategory.trim() &&
    form.location.trim() &&
    form.phone.trim() &&
    form.email.trim();

  /* =========================================================
     CREATE VENDOR
  ========================================================= */

  const createVendor = () => {
    const cleanPhone =
      form.phone.replace(
        /\D/g,
        ""
      );

    if (cleanPhone.length < 10) {
      showError(
        "Invalid mobile number",
        "Please enter a valid mobile number."
      );

      return;
    }

    if (!form.category) {
      showError(
        "Category required",
        "Please select a category."
      );

      return;
    }

    if (!form.subcategory) {
      showError(
        "Subcategory required",
        "Please select a subcategory."
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

      subcategory:
        form.subcategory.trim(),

      mobile_number:
        form.phone.trim(),

      email:
        form.email.trim(),

      sales_id:
        form.sales_id || null,

      address:
        form.location.trim(),

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
          icon={
            <UserRound size={14} />
          }
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
          value={
            form.business_name
          }
          change={(v) =>
            update(
              "business_name",
              v
            )
          }
        />

        {/* CATEGORY */}

        <CategorySelect
          categories={categories}
          value={form.category_id}
          loading={
            categoriesLoading
          }
          onChange={
            handleCategoryChange
          }
        />

        {/* SUBCATEGORY */}

        <SubcategorySelect
          subcategories={
            subcategories
          }
          value={
            form.subcategory
          }
          loading={
            subcategoriesLoading
          }
          disabled={
            !form.category_id ||
            subcategoriesLoading
          }
          onChange={(value) =>
            update(
              "subcategory",
              value
            )
          }
        />

        {/* LOCATION */}

        <Input
          icon={
            <MapPin size={14} />
          }
          label="Location"
          placeholder="Enter Location"
          value={form.location}
          change={(v) =>
            update(
              "location",
              v
            )
          }
        />

        {/* PHONE */}

        <Input
          icon={
            <Phone size={14} />
          }
          label="Phone"
          placeholder="Enter Phone"
          value={form.phone}
          change={(v) =>
            update(
              "phone",
              v
            )
          }
        />

        {/* EMAIL */}

        <Input
          icon={
            <Mail size={14} />
          }
          label="Email"
          placeholder="Enter Email"
          value={form.email}
          change={(v) =>
            update(
              "email",
              v
            )
          }
        />

        {/* OFFER */}

        <Input
          icon={
            <Percent size={14} />
          }
          label="Offer (%)"
          placeholder="Enter Offer Percentage"
          value={form.offer}
          change={(v) =>
            update(
              "offer",
              v
            )
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
              value={
                form.sales_id
              }
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
                    value={
                      sales.id
                    }
                  >
                    {
                      sales.employee_id
                    }{" "}
                    -{" "}
                    {
                      sales.full_name
                    }
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
   EDIT VENDOR
========================================================= */

function EditVendor({
  vendor,
  salesExecutives,
  cancel,
  save,
}) {
  const [form, setForm] =
    useState({
      vendor_id:
        vendor.vendor_id || "",
      name:
        vendor.owner_name || "",
      business_name:
        vendor.business_name || "",
      category:
        vendor.category || "",
      category_id: "",
      subcategory:
        vendor.subcategory || "",
      location:
        vendor.address || "",
      phone:
        vendor.mobile_number || "",
      email:
        vendor.email || "",
      sales_id:
        vendor.sales_id || "",
      offer:
        vendor.offer_percentage !==
          null &&
        vendor.offer_percentage !==
          undefined
          ? String(
              vendor.offer_percentage
            )
          : "",
    });

  const [categories, setCategories] =
    useState([]);

  const [
    subcategories,
    setSubcategories,
  ] = useState([]);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(false);

  const [
    subcategoriesLoading,
    setSubcategoriesLoading,
  ] = useState(false);

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  useEffect(() => {
    const loadCategories =
      async () => {
        setCategoriesLoading(
          true
        );

        const {
          data,
          error,
        } = await supabase
          .from(
            "vendor_categories"
          )
          .select("*")
          .order("id", {
            ascending: true,
          });

        if (error) {
          console.error(
            "EDIT LOAD CATEGORIES ERROR:",
            error
          );

          showError(
            "Could not load categories",
            "Vendor categories could not be loaded."
          );

          setCategories([]);
        } else {
          setCategories(
            data || []
          );

          const existingCategory =
            data?.find(
              (category) =>
                category.name ===
                vendor.category
            );

          if (
            existingCategory
          ) {
            setForm(
              (previous) => ({
                ...previous,
                category_id:
                  String(
                    existingCategory.id
                  ),
              })
            );
          }
        }

        setCategoriesLoading(
          false
        );
      };

    loadCategories();
  }, [vendor.category]);

  /* =========================================================
     LOAD SUBCATEGORIES
  ========================================================= */

  useEffect(() => {
    const loadSubcategories =
      async () => {
        if (!form.category_id) {
          setSubcategories([]);
          return;
        }

        setSubcategoriesLoading(
          true
        );

        const {
          data,
          error,
        } = await supabase
          .from(
            "vendor_subcategories"
          )
          .select("*")
          .eq(
            "category_id",
            form.category_id
          )
          .order("id", {
            ascending: true,
          });

        if (error) {
          console.error(
            "EDIT LOAD SUBCATEGORIES ERROR:",
            error
          );

          showError(
            "Could not load subcategories",
            "Subcategories could not be loaded."
          );

          setSubcategories([]);
        } else {
          setSubcategories(
            data || []
          );
        }

        setSubcategoriesLoading(
          false
        );
      };

    loadSubcategories();
  }, [form.category_id]);

  /* =========================================================
     UPDATE FORM
  ========================================================= */

  const update = (
    key,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  /* =========================================================
     CATEGORY CHANGE
  ========================================================= */

  const handleCategoryChange = (
    categoryId
  ) => {
    const selectedCategory =
      categories.find(
        (category) =>
          String(category.id) ===
          String(categoryId)
      );

    setForm((previous) => ({
      ...previous,
      category_id:
        categoryId,
      category:
        selectedCategory?.name ||
        "",
      subcategory: "",
    }));

    setSubcategories([]);
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const enable =
    form.vendor_id.trim() &&
    form.name.trim() &&
    form.business_name.trim() &&
    form.category.trim() &&
    form.subcategory.trim() &&
    form.location.trim() &&
    form.phone.trim() &&
    form.email.trim();

  /* =========================================================
     SAVE
  ========================================================= */

  const saveVendor = () => {
    const cleanPhone =
      form.phone.replace(
        /\D/g,
        ""
      );

    if (cleanPhone.length < 10) {
      showError(
        "Invalid mobile number",
        "Please enter a valid mobile number."
      );

      return;
    }

    if (!form.category) {
      showError(
        "Category required",
        "Please select a category."
      );

      return;
    }

    if (!form.subcategory) {
      showError(
        "Subcategory required",
        "Please select a subcategory."
      );

      return;
    }

    save({
      vendor_id:
        form.vendor_id.trim(),

      owner_name:
        form.name.trim(),

      business_name:
        form.business_name.trim(),

      category:
        form.category.trim(),

      subcategory:
        form.subcategory.trim(),

      mobile_number:
        form.phone.trim(),

      email:
        form.email.trim(),

      sales_id:
        form.sales_id || null,

      address:
        form.location.trim(),

      offer_percentage:
        form.offer !== ""
          ? Number(form.offer)
          : null,
    });
  };

  return (
    <div>
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-x-5
          gap-y-5
        "
      >
        {/* VENDOR ID */}

        <Input
          icon={
            <BadgeCheck size={14} />
          }
          label="Vendor ID"
          placeholder="Enter Vendor ID"
          value={
            form.vendor_id
          }
          change={(v) =>
            update(
              "vendor_id",
              v
            )
          }
        />

        {/* VENDOR NAME */}

        <Input
          icon={
            <UserRound size={14} />
          }
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
          value={
            form.business_name
          }
          change={(v) =>
            update(
              "business_name",
              v
            )
          }
        />

        {/* CATEGORY */}

        <CategorySelect
          categories={categories}
          value={
            form.category_id
          }
          loading={
            categoriesLoading
          }
          onChange={
            handleCategoryChange
          }
        />

        {/* SUBCATEGORY */}

        <SubcategorySelect
          subcategories={
            subcategories
          }
          value={
            form.subcategory
          }
          loading={
            subcategoriesLoading
          }
          disabled={
            !form.category_id ||
            subcategoriesLoading
          }
          onChange={(value) =>
            update(
              "subcategory",
              value
            )
          }
        />

        {/* LOCATION */}

        <Input
          icon={
            <MapPin size={14} />
          }
          label="Location"
          placeholder="Enter Location"
          value={
            form.location
          }
          change={(v) =>
            update(
              "location",
              v
            )
          }
        />

        {/* PHONE */}

        <Input
          icon={
            <Phone size={14} />
          }
          label="Phone"
          placeholder="Enter Phone"
          value={form.phone}
          change={(v) =>
            update(
              "phone",
              v
            )
          }
        />

        {/* EMAIL */}

        <Input
          icon={
            <Mail size={14} />
          }
          label="Email"
          placeholder="Enter Email"
          value={form.email}
          change={(v) =>
            update(
              "email",
              v
            )
          }
        />

        {/* OFFER */}

        <Input
          icon={
            <Percent size={14} />
          }
          label="Offer (%)"
          placeholder="Enter Offer Percentage"
          value={form.offer}
          change={(v) =>
            update(
              "offer",
              v
            )
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
              value={
                form.sales_id
              }
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
                    value={
                      sales.id
                    }
                  >
                    {
                      sales.employee_id
                    }{" "}
                    -{" "}
                    {
                      sales.full_name
                    }
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
          onClick={cancel}
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
          onClick={saveVendor}
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
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   CATEGORY SELECT
========================================================= */

function CategorySelect({
  categories,
  value,
  loading,
  onChange,
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
        Category
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
        <Store
          size={14}
          className="text-gray-400 mr-2"
        />

        <select
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          disabled={loading}
          className="
            outline-none
            text-[10px]
            text-[#172033]
            w-full
            bg-transparent
          "
        >
          <option value="">
            {loading
              ? "Loading categories..."
              : "Select Category"}
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={
                  category.id
                }
              >
                {category.id}.{" "}
                {category.name}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
}

/* =========================================================
   SUBCATEGORY SELECT
========================================================= */

function SubcategorySelect({
  subcategories,
  value,
  loading,
  disabled,
  onChange,
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
        Subcategory
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
        <Store
          size={14}
          className="text-gray-400 mr-2"
        />

        <select
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          disabled={disabled}
          className="
            outline-none
            text-[10px]
            text-[#172033]
            w-full
            bg-transparent
          "
        >
          <option value="">
            {!value &&
            !loading &&
            disabled
              ? "Select Category First"
              : loading
              ? "Loading subcategories..."
              : "Select Subcategory"}
          </option>

          {subcategories.map(
            (subcategory) => (
              <option
                key={subcategory.id}
                value={
                  subcategory.name
                }
              >
                {subcategory.name}
              </option>
            )
          )}
        </select>
      </div>
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
            change(
              e.target.value
            )
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