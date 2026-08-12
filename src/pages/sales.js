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

import Swal from "sweetalert2";

import {
  ArrowLeft,
  Plus,
  Search,
  UserRound,
  Phone,
  Mail,
  Lock,
  MapPin,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Eye,
  EyeOff,
  Store,
  Users,
  ReceiptText,
  IndianRupee,
} from "lucide-react";

export default function Sales() {
  const router = useRouter();

  const [create, setCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const [sales, setSales] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expanded, setExpanded] = useState(null);

  // Selected sales executive details
  const [selectedSales, setSelectedSales] = useState(null);

  const [salesStats, setSalesStats] = useState({
    vendors: 0,
    members: 0,
    transactions: 0,
    benefits: 0,
  });

  const [statsLoading, setStatsLoading] = useState(false);

  /* =========================================================
     LOAD SALES
  ========================================================= */

  const loadSales = async () => {
    setLoading(true);

    const { data, error: loadError } = await supabase
      .from("sales_executives")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (loadError) {
      setError(loadError.message);
    } else {
      setError("");
      setSales(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSales();
  }, []);

  /* =========================================================
     LOAD SALES EXECUTIVE DETAILS
  ========================================================= */

  const openSalesDetails = async (item) => {
    setSelectedSales(item);
    setStatsLoading(true);

    try {
      /*
       * VENDORS
       *
       * Assumes vendors.sales_id points to
       * sales_executives.id.
       */
      const vendorsQuery = await supabase
        .from("vendors")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("sales_id", item.id);

      /*
       * MEMBERS
       *
       * Assumes members.sales_id points to
       * sales_executives.id.
       */
      const membersQuery = await supabase
        .from("members")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("sales_id", item.id);

      /*
       * GET VENDORS ASSIGNED TO THIS SALES EXECUTIVE
       *
       * Transactions are connected through vendor_id.
       */
      const vendorListQuery = await supabase
        .from("vendors")
        .select("id")
        .eq("sales_id", item.id);

      let transactionCount = 0;
      let benefitTotal = 0;

      if (
        !vendorListQuery.error &&
        vendorListQuery.data &&
        vendorListQuery.data.length > 0
      ) {
        const vendorIds = vendorListQuery.data.map(
          (vendor) => vendor.id
        );

        const transactionQuery = await supabase
          .from("transactions")
          .select("id, benefit_amount")
          .in("vendor_id", vendorIds);

        if (!transactionQuery.error) {
          transactionCount =
            transactionQuery.data?.length || 0;

          benefitTotal = (
            transactionQuery.data || []
          ).reduce(
            (total, transaction) =>
              total +
              Number(
                transaction.benefit_amount || 0
              ),
            0
          );
        }
      }

      setSalesStats({
        vendors: vendorsQuery.count || 0,

        members: membersQuery.count || 0,

        transactions: transactionCount,

        benefits: benefitTotal,
      });
    } catch (err) {
      console.log(
        "SALES DETAILS ERROR:",
        err
      );

      setSalesStats({
        vendors: 0,
        members: 0,
        transactions: 0,
        benefits: 0,
      });
    }

    setStatsLoading(false);
  };

  /* =========================================================
     CLOSE DETAILS
  ========================================================= */

  const closeSalesDetails = () => {
    setSelectedSales(null);

    setSalesStats({
      vendors: 0,
      members: 0,
      transactions: 0,
      benefits: 0,
    });
  };

  /* =========================================================
     DELETE SALES
  ========================================================= */

  const deleteSales = async (id) => {
    const confirmation = await confirmDelete(
      "Delete sales executive?",
      "This action cannot be undone."
    );

    if (!confirmation.isConfirmed) return;

    const { error: deleteError } =
      await supabase
        .from("sales_executives")
        .delete()
        .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);

      showError(
        "Sales operation failed",
        friendlyError(
          deleteError,
          "The sales executive could not be deleted."
        )
      );
    } else {
      await showSuccess(
        "Sales executive deleted successfully"
      );

      setExpanded(null);
      setSelectedSales(null);

      loadSales();
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredSales = sales.filter(
    (item) =>
      item.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      item.employee_id
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  /* =========================================================
     OPEN CREATE FORM
  ========================================================= */

  const openCreate = () => {
    setEditing(null);
    setCreate(true);

    setTimeout(() => {
      document
        .getElementById("create-sales-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 0);
  };

  /* =========================================================
     SALES EXECUTIVE DETAILS VIEW
  ========================================================= */

  if (selectedSales) {
    return (
      <div className="min-h-screen bg-[#F8F4EE] pb-20">

        {/* HEADER */}

        <div className="flex items-center px-5 pt-5">

          <button
            type="button"
            onClick={closeSalesDetails}
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
              Sales Executive
            </h1>

            <p className="text-xs text-gray-500">
              Executive Details
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
                text-lg
                font-bold
              "
            >
              {selectedSales.full_name
                ?.charAt(0)
                ?.toUpperCase() || "S"}
            </div>

            <div className="ml-4">

              <h2 className="text-lg font-bold text-[#172033]">
                {selectedSales.full_name ||
                  "Sales Executive"}
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                {selectedSales.employee_id ||
                  "-"}
              </p>

            </div>

          </div>

          {/* BASIC DETAILS */}

          <div className="mt-5 space-y-3">

            <DetailRow
              icon={<Phone size={15} />}
              label="Mobile"
              value={
                selectedSales.mobile_number ||
                "-"
              }
            />

            <DetailRow
              icon={<Mail size={15} />}
              label="Email"
              value={
                selectedSales.email ||
                "-"
              }
            />

            <DetailRow
              icon={<MapPin size={15} />}
              label="Assigned Area"
              value={
                selectedSales.assigned_area ||
                "-"
              }
            />


          </div>

        </div>

        {/* STATISTICS */}

        <div className="mx-5 mt-4">

          <h2 className="text-sm font-bold text-[#172033] mb-2">
            Activity Summary
          </h2>

          <div className="space-y-2">

            <SalesStat
              icon={<Store size={18} />}
              title="Vendors Assigned"
              value={
                statsLoading
                  ? "..."
                  : salesStats.vendors
              }
            />

            <SalesStat
              icon={<Users size={18} />}
              title="Members Registered"
              value={
                statsLoading
                  ? "..."
                  : salesStats.members
              }
            />


          </div>

        </div>

        <SuperAdminFooter />

      </div>
    );
  }

  /* =========================================================
     MAIN SALES LIST
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F8F4EE] pb-20">

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
            Sales Management
          </h1>

          <p className="text-xs text-gray-500">
            Manage your sales executives and activities.
          </p>

        </div>

        <button
          type="button"
          onClick={openCreate}
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
          Add Sales
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
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search sales executive..."
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
          Loading sales executives...
        </p>
      )}

      {/* ERROR */}

      {error && (
        <p className="text-xs text-red-500 px-5 mt-4">
          {error}
        </p>
      )}

      {/* SALES LIST */}

      <div className="px-5 mt-2 space-y-3">

        {filteredSales.map((item) => {

          const isExpanded =
            expanded === item.id;

          return (
            <div
              key={item.id}
              className="
                bg-white
                rounded-xl
                p-4
                shadow-sm
              "
            >

              {/* TOP ROW */}

              <div className="flex items-center justify-between">

                {/* CLICKABLE PROFILE + NAME */}

                <button
                  type="button"
                  onClick={() =>
                    openSalesDetails(item)
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    text-left
                    flex-1
                  "
                >

                  {/* PROFILE */}

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
                      text-xs
                      font-bold
                    "
                  >
                    {item.full_name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  {/* NAME */}

                  <div>

                    <p
                      className="
                        text-sm
                        font-bold
                        text-[#172033]
                      "
                    >
                      {item.full_name}
                    </p>

                    <p
                      className="
                        text-[10px]
                        text-gray-500
                        mt-1
                      "
                    >
                      {item.employee_id}
                    </p>

                  </div>

                </button>

                {/* ARROW */}

                <button
                  type="button"
                  onClick={() =>
                    setExpanded(
                      isExpanded
                        ? null
                        : item.id
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
                  "
                >

                  {isExpanded ? (
                    <ChevronUp
                      size={18}
                      className="text-[#172033]"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-[#172033]"
                    />
                  )}

                </button>

              </div>

              {/* EXPANDED DETAILS */}

              {isExpanded && (
                <div className="mt-3">

                  {/* ASSIGNED AREA */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      mb-3
                    "
                  >

                    <MapPin
                      size={14}
                      className="text-gray-400"
                    />

                    <span
                      className="
                        text-[10px]
                        text-gray-600
                      "
                    >
                      Assigned Area:
                    </span>

                    <span
                      className="
                        text-[10px]
                        text-[#172033]
                        font-medium
                      "
                    >
                      {item.assigned_area ||
                        "-"}
                    </span>

                  </div>

                  {/* EMAIL */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      mb-3
                    "
                  >

                    <Mail
                      size={14}
                      className="text-gray-400"
                    />

                    <span
                      className="
                        text-[10px]
                        text-gray-600
                      "
                    >
                      {item.email || "-"}
                    </span>

                  </div>

                  {/* PHONE */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <Phone
                      size={14}
                      className="text-gray-400"
                    />

                    <span
                      className="
                        text-[10px]
                        text-gray-600
                      "
                    >
                      {item.mobile_number ||
                        "-"}
                    </span>

                  </div>

                  {/* DELETE ONLY — EDIT REMOVED */}

                  <div
                    className="
                      flex
                      justify-end
                      items-center
                      mt-3
                    "
                  >

                    <button
                      type="button"
                      onClick={() =>
                        deleteSales(item.id)
                      }
                      className="
                        border
                        rounded
                        px-3
                        py-1
                        text-[10px]
                      "
                    >
                      Delete
                    </button>

                  </div>

                </div>
              )}

            </div>
          );
        })}

        {!loading &&
          filteredSales.length === 0 && (
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
                No sales executives found.
              </p>
            </div>
          )}

      </div>

      {/* CREATE / EDIT SALES */}

      {create && (
        <CreateSales
          close={() => {
            setCreate(false);
            setEditing(null);
          }}
          salesItem={editing}
          addSales={async (data) => {

            setError("");

            let result;

            if (editing) {

              result = await supabase
                .from("sales_executives")
                .update(data)
                .eq(
                  "id",
                  editing.id
                );

            } else {

              result = await supabase
                .from("sales_executives")
                .insert(data)
                .select()
                .single();

            }

            if (result.error) {

              setError(
                result.error.message
              );

              showError(
                editing
                  ? "Sales update failed"
                  : "Sales creation failed",

                friendlyError(
                  result.error,
                  "The sales executive could not be saved."
                )
              );

              return;
            }

            /* EDIT SUCCESS */

            if (editing) {

              setCreate(false);
              setEditing(null);

              await showSuccess(
                "Sales executive updated successfully"
              );

              loadSales();

              return;
            }

            /* CREATE SUCCESS */

            const mobile =
              data.mobile_number
                ?.replace(/\D/g, "");

            if (!mobile) {

              setCreate(false);
              setEditing(null);

              await showSuccess(
                "Sales executive created successfully"
              );

              loadSales();

              return;
            }

            const whatsappNumber =
              mobile.length === 10
                ? `91${mobile}`
                : mobile;

            const message = [
              `*Hello ${data.full_name}*`,
              "",
              "Welcome to *Veda Sales Team*.",
              "",
              "Your Veda Sales Executive login credentials are:",
              "",
              `*Mobile number* ${data.mobile_number}`,
              `*Password:* ${data.password || ""}`,
              "",
              "Please use these credentials to log in to the Veda Sales Executive App.",
              "",
              "For security, please change your password after your first login.",
              "",
              "Thank you,",
              "*Veda Team*",
            ].join("\n");

            const whatsappUrl =
              `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                message
              )}`;

            setCreate(false);
            setEditing(null);

            loadSales();

            const shareResult =
              await Swal.fire({
                icon: "success",
                title:
                  "Sales executive created successfully",
                text:
                  "Share the login credentials with the sales executive on WhatsApp.",
                showCancelButton: true,
                confirmButtonText:
                  "Share on WhatsApp",
                cancelButtonText:
                  "Done",
                confirmButtonColor:
                  "#172033",
                cancelButtonColor:
                  "#6b7280",
              });

            if (shareResult.isConfirmed) {

              window.open(
                whatsappUrl,
                "_blank",
                "noopener,noreferrer"
              );

            }

          }}
        />
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

      <div className="w-7 h-7 rounded-full bg-[#F8F4EE] flex items-center justify-center text-[#172033]">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-[10px] text-gray-500">
          {label}
        </p>

        <p className="text-xs font-semibold text-[#172033] mt-0.5">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   SALES STAT
========================================================= */

function SalesStat({
  icon,
  title,
  value,
}) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="w-9 h-9 rounded-full bg-[#F8F4EE] flex items-center justify-center text-[#B97943]">
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
   CREATE / EDIT SALES FORM
========================================================= */

function CreateSales({
  close,
  addSales,
  salesItem,
}) {
  const [form, setForm] = useState({
    id:
      salesItem?.employee_id || "",

    password:
      salesItem?.password || "",

    name:
      salesItem?.full_name || "",

    confirm:
      salesItem?.password || "",

    phone:
      salesItem?.mobile_number || "",

    area:
      salesItem?.assigned_area || "",

    email:
      salesItem?.email || "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const update = (
    key,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const enable =
    form.id &&
    form.name &&
    form.phone &&
    form.area &&
    form.email &&
    (
      salesItem
        ? true
        : form.password &&
          form.confirm
    );

  const createSales = () => {

    if (
      form.password !==
      form.confirm
    ) {
      showError(
        "Password mismatch",
        "Password and Confirm Password must be the same."
      );

      return;
    }

    if (
      form.password &&
      form.password.length < 6
    ) {
      showError(
        "Invalid password",
        "Password must be at least 6 characters."
      );

      return;
    }

    const cleanPhone =
      form.phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      showError(
        "Invalid mobile number",
        "Please enter a valid mobile number."
      );

      return;
    }

    const salesData = {
      employee_id:
        form.id.trim(),

      full_name:
        form.name.trim(),

      mobile_number:
        form.phone.trim(),

      assigned_area:
        form.area.trim(),

      email:
        form.email.trim(),

      status:
        "Active",
    };

    if (form.password) {
      salesData.password =
        form.password;
    }

    addSales(salesData);
  };

  return (
    <div
      id="create-sales-form"
      className="
        bg-white
        rounded-xl
        mt-1
        mx-5
        mb-24
        p-5
        shadow-sm
      "
    >

      <div className="mb-5">

        <h2
          className="
            text-sm
            font-bold
            text-[#172033]
          "
        >
          {salesItem
            ? "EDIT SALES EXECUTIVE"
            : "CREATE SALES EXECUTIVE"}
        </h2>

      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-x-5
          gap-y-5
        "
      >

        <SalesInput
          icon={
            <BadgeCheck size={14} />
          }
          label="Employee ID"
          value={form.id}
          change={(v) =>
            update("id", v)
          }
          placeholder="Enter Employee ID"
        />

        <SalesInput
          icon={
            <UserRound size={14} />
          }
          label="Full Name"
          value={form.name}
          change={(v) =>
            update("name", v)
          }
          placeholder="Enter Full Name"
        />

        <SalesInput
          icon={
            <MapPin size={14} />
          }
          label="Assigned Area"
          value={form.area}
          change={(v) =>
            update("area", v)
          }
          placeholder="Enter Area"
        />

        <SalesInput
          icon={
            <Phone size={14} />
          }
          label="Phone"
          value={form.phone}
          change={(v) =>
            update("phone", v)
          }
          placeholder="Enter Mobile Number"
        />

        <SalesInput
          icon={
            <Mail size={14} />
          }
          label="Email"
          value={form.email}
          change={(v) =>
            update("email", v)
          }
          placeholder="Enter Email Address"
        />

        <PasswordSalesInput
          label="Password"
          value={form.password}
          change={(v) =>
            update("password", v)
          }
          placeholder="Enter Password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <PasswordSalesInput
          label="Confirm Password"
          value={form.confirm}
          change={(v) =>
            update("confirm", v)
          }
          placeholder="Confirm Password"
          showPassword={
            showConfirmPassword
          }
          setShowPassword={
            setShowConfirmPassword
          }
        />

      </div>

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
            hover:bg-gray-50
          "
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={!enable}
          onClick={createSales}
          className={`
            px-4
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
          {salesItem
            ? "Save Sales"
            : "Create Sales"}
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   SALES INPUT
========================================================= */

function SalesInput({
  icon,
  label,
  placeholder,
  value,
  change,
  type = "text",
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
          type={type}
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

/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordSalesInput({
  label,
  placeholder,
  value,
  change,
  showPassword,
  setShowPassword,
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
          <Lock size={14} />
        </span>

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
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

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
          className="
            text-gray-400
            hover:text-[#172033]
            flex
            items-center
            justify-center
            ml-2
          "
        >

          {showPassword ? (
            <EyeOff size={14} />
          ) : (
            <Eye size={14} />
          )}

        </button>

      </div>

    </div>
  );
}