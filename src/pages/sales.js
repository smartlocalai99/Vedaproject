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

import {
  ArrowLeft,
  Plus,
  Pencil,
  Search,
  UserRound,
  Phone,
  Mail,
  Lock,
  MapPin,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
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

  /* =========================================================
     LOAD SALES
  ========================================================= */

  const loadSales = async () => {
    setLoading(true);

    const {
      data,
      error: loadError,
    } = await supabase
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
     DELETE SALES
  ========================================================= */

  const deleteSales = async (id) => {
    const confirmation = await confirmDelete(
      "Delete sales executive?",
      "This action cannot be undone."
    );

    if (!confirmation.isConfirmed) return;

    const {
      error: deleteError,
    } = await supabase
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
      loadSales();
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredSales = sales.filter((item) =>
    item.full_name
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
     OPEN EDIT FORM
  ========================================================= */

  const openEdit = (item) => {
    setEditing(item);
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
     RETURN
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between px-5 pt-5">

        <button
          onClick={() => router.push("/")}
          className="
            w-7
            h-7
            rounded
            flex
            items-center
            justify-center
            hover:bg-gray-200
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
          onClick={openCreate}
          type="button"
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

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="
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
      ">

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

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <p className="text-xs text-gray-500 px-5 mt-4">
          Loading sales executives...
        </p>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <p className="text-xs text-red-500 px-5 mt-4">
          {error}
        </p>
      )}

      {/* =====================================================
          SALES LIST
      ===================================================== */}

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

              {/* =================================================
                  TOP ROW
              ================================================= */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  {/* PROFILE CIRCLE */}

                  <div className="
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
                  ">
                    {item.full_name?.charAt(0)}
                  </div>

                  {/* NAME + EMPLOYEE ID */}

                  <div>

                    <p className="
                      text-sm
                      font-bold
                      text-[#172033]
                    ">
                      {item.full_name}
                    </p>

                    <p className="
                      text-[10px]
                      text-gray-500
                      mt-1
                    ">
                      {item.employee_id}
                    </p>

                  </div>

                </div>

                {/* =================================================
                    DOWN / UP ARROW
                ================================================= */}

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
                    hover:bg-gray-100
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

              {/* =================================================
                  EXPANDED DETAILS
              ================================================= */}

              {isExpanded && (
                <div className="mt-3">

                  {/* ASSIGNED AREA */}

                  <div className="
                    flex
                    items-center
                    gap-2
                    mb-3
                  ">

                    <MapPin
                      size={14}
                      className="text-gray-400"
                    />

                    <span className="
                      text-[10px]
                      text-gray-600
                    ">
                      Assigned Area:
                    </span>

                    <span className="
                      text-[10px]
                      text-[#172033]
                      font-medium
                    ">
                      {item.assigned_area || "-"}
                    </span>

                  </div>

                  {/* EMAIL */}

                  <div className="
                    flex
                    items-center
                    gap-2
                    mb-3
                  ">

                    <Mail
                      size={14}
                      className="text-gray-400"
                    />

                    <span className="
                      text-[10px]
                      text-gray-600
                    ">
                      {item.email || "-"}
                    </span>

                  </div>

                  {/* PHONE */}

                  <div className="
                    flex
                    items-center
                    gap-2
                  ">

                    <Phone
                      size={14}
                      className="text-gray-400"
                    />

                    <span className="
                      text-[10px]
                      text-gray-600
                    ">
                      {item.mobile_number || "-"}
                    </span>

                  </div>

                  {/* =================================================
                      EDIT / DELETE
                  ================================================= */}

                  <div className="
                    flex
                    justify-end
                    items-center
                    gap-2
                    mt-3
                  ">

                    <button
                      onClick={() =>
                        openEdit(item)
                      }
                      type="button"
                      className="
                        border
                        rounded
                        px-3
                        py-1
                        text-[10px]
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <Pencil size={11} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteSales(item.id)
                      }
                      type="button"
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

      </div>

      {/* =====================================================
          CREATE / EDIT SALES
      ===================================================== */}

      {create && (
        <CreateSales
          close={() => {
            setCreate(false);
            setEditing(null);
          }}
          salesItem={editing}
          addSales={async (data) => {

            setError("");

            const {
              error: saveError,
            } = editing
              ? await supabase
                  .from("sales_executives")
                  .update(data)
                  .eq("id", editing.id)
              : await supabase
                  .from("sales_executives")
                  .insert(data);

            if (saveError) {

              setError(
                saveError.message
              );

              showError(
                editing
                  ? "Sales update failed"
                  : "Sales creation failed",

                friendlyError(
                  saveError,
                  "The sales executive could not be saved."
                )
              );

              return;
            }

            setCreate(false);
            setEditing(null);

            await showSuccess(
              editing
                ? "Sales executive updated successfully"
                : "Sales executive created successfully"
            );

            loadSales();
          }}
        />
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <SuperAdminFooter />

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
     ENABLE BUTTON
     
     CREATE:
     Password + Confirm required

     EDIT:
     Password is not required
  ========================================================= */

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

  /* =========================================================
     SAVE / CREATE
  ========================================================= */

  const createSales = () => {

    /* Password validation only
       when password is entered */

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

    const salesData = {
      employee_id:
        form.id,

      full_name:
        form.name,

      mobile_number:
        form.phone,

      assigned_area:
        form.area,

      email:
        form.email,
    };

    /* Only send password when:
       creating OR changing password */

    if (
      form.password
    ) {
      salesData.password =
        form.password;
    }

    addSales(
      salesData
    );

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

      {/* =================================================
          FORM TITLE
      ================================================= */}

      <div className="mb-5">

        <h2 className="
          text-sm
          font-bold
          text-[#172033]
        ">
          {salesItem
            ? "EDIT SALES EXECUTIVE"
            : "CREATE SALES EXECUTIVE"}
        </h2>

      </div>


      {/* =================================================
          TWO COLUMN FORM
      ================================================= */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-x-5
        gap-y-5
      ">

        {/* EMPLOYEE ID */}

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


        {/* FULL NAME */}

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


        {/* ASSIGNED AREA */}

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


        {/* MOBILE NUMBER */}

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


        {/* EMAIL */}

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


        {/* PASSWORD */}

        <SalesInput
          icon={
            <Lock size={14} />
          }
          label="Password"
          type="password"
          value={form.password}
          change={(v) =>
            update("password", v)
          }
          placeholder="Enter Password"
        />


        {/* CONFIRM PASSWORD */}

        <SalesInput
          icon={
            <Lock size={14} />
          }
          label="Confirm Password"
          type="password"
          value={form.confirm}
          change={(v) =>
            update("confirm", v)
          }
          placeholder="Confirm Password"
        />

      </div>


      {/* =================================================
          BUTTONS

          mb-24 on parent + pb-2 here keeps buttons
          visible above fixed footer.
      ================================================= */}

      <div className="
        flex
        items-center
        justify-end
        gap-2
        mt-6
        pb-2
      ">

        {/* CANCEL */}

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


        {/* SAVE / CREATE */}

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
   Same style as your reference image
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

      {/* LABEL */}

      <label className="
        block
        text-[10px]
        text-[#172033]
        mb-1.5
      ">
        {label}
      </label>


      {/* INPUT BOX */}

      <div className="
        h-[32px]
        border
        border-[#172033]
        rounded-[4px]
        flex
        items-center
        px-2.5
        bg-white
      ">

        <span className="
          text-gray-400
          mr-2
          flex
          items-center
        ">
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