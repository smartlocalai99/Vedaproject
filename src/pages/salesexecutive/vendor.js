import {
  ArrowLeft,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  CreditCard,
} from "lucide-react";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

import {
  friendlyError,
  showError,
  showSuccess,
} from "@/lib/alerts";

export default function Vendor() {
  const router = useRouter();

  const [form, setForm] = useState({
    business_name: "",
    category: "",
    owner_name: "",
    mobile_number: "",
    email: "",
    city: "",
    address: "",
    upi_id: "",
    offer_percentage: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [salesExecutive, setSalesExecutive] = useState(null);

  /* =====================================================
     LOAD SESSION + VENDOR
     ===================================================== */

  useEffect(() => {
    const saved = localStorage.getItem(
      "salesExecutiveSession"
    );

    if (!saved) {
      router.replace("/salesexecutive/login");
      return;
    }

    let session;

    try {
      session = JSON.parse(saved);
    } catch (error) {
      console.error("SESSION PARSE ERROR:", error);
      localStorage.removeItem("salesExecutiveSession");
      router.replace("/salesexecutive/login");
      return;
    }

    /* =====================================================
       LOAD SALES EXECUTIVE
       ===================================================== */

    async function loadSalesExecutive() {
      const { data, error } = await supabase
        .from("sales_executives")
        .select("*")
        .eq("id", session.id)
        .maybeSingle();

      if (error) {
        console.error(
          "SALES EXECUTIVE LOAD ERROR:",
          error
        );
        return;
      }

      if (data) {
        setSalesExecutive(data);
      }
    }

    loadSalesExecutive();

    /* =====================================================
       LOAD VENDOR FOR EDIT
       ===================================================== */

    const vendorId = router.query.id;

    if (!vendorId) return;

    async function loadVendor() {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .eq("sales_id", session.id)
        .maybeSingle();

      if (error) {
        console.error(
          "VENDOR LOAD ERROR:",
          error
        );

        showError(
          "Could not load vendor",
          friendlyError(
            error,
            "This vendor could not be loaded."
          )
        );

        return;
      }

      if (!data) {
        showError(
          "Could not load vendor",
          "This vendor is not available."
        );
        return;
      }

      setEditingId(data.id);

      const addressParts = (
        data.address || ""
      ).split(", ");

      setForm({
        business_name:
          data.business_name || "",

        category:
          data.category || "",

        owner_name:
          data.owner_name || "",

        mobile_number:
          data.mobile_number || "",

        email:
          data.email || "",

        city:
          addressParts[0] || "",

        address:
          addressParts.slice(1).join(", "),

        upi_id:
          data.upi_id || "",

        offer_percentage:
          data.offer_percentage !== null &&
          data.offer_percentage !== undefined
            ? String(data.offer_percentage)
            : "",

        password:
          data.password || "",

        confirm_password:
          data.password || "",
      });
    }

    loadVendor();
  }, [router]);

  /* =====================================================
     HANDLE CHANGE
     ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     SEND WHATSAPP
     ===================================================== */

  const sendVendorCredentials = () => {
    const vendorMobile =
      form.mobile_number.replace(/\D/g, "");

    if (!vendorMobile) {
      showError(
        "Mobile number missing",
        "Vendor mobile number is required to send WhatsApp credentials."
      );
      return;
    }

    const whatsappNumber =
      vendorMobile.length === 10
        ? `91${vendorMobile}`
        : vendorMobile;

    const salesName =
      salesExecutive?.full_name ||
      "Veda Sales Executive";

    const salesMobile =
      salesExecutive?.mobile_number ||
      "";

    const message = [
      `*Hello ${form.business_name}*,`,
      "",
      "Welcome to *Veda Vendor*.",
      "",
      "Your Veda Vendor App login credentials are:",
      "",
      `*Mobile Number:* ${form.mobile_number}`,
      `*Passcode:* ${form.password}`,
      "",
      "Please use your mobile number and 4-digit passcode to log in to the Veda Vendor App.",
      "",
      "For security, please keep your passcode safe.",
      "",
      `Sales Executive: ${salesName}`,
      salesMobile
        ? `Contact: ${salesMobile}`
        : "",
      "",
      "Thank you,",
      "*Veda Team*",
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =====================================================
     SUBMIT
     ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const saved = localStorage.getItem(
      "salesExecutiveSession"
    );

    if (!saved) {
      return showError(
        "Vendor creation failed",
        "Your session has expired. Please log in again."
      );
    }

    let session;

    try {
      session = JSON.parse(saved);
    } catch (error) {
      return showError(
        "Session error",
        "Please log in again."
      );
    }

    /* =====================================================
       REQUIRED SESSION ID
       ===================================================== */

    if (!session.id) {
      return showError(
        "Session error",
        "Sales Executive ID was not found. Please log in again."
      );
    }

    /* =====================================================
       VALIDATION
       ===================================================== */

    if (
      !form.business_name.trim() ||
      !form.owner_name.trim() ||
      !form.mobile_number.trim()
    ) {
      return showError(
        "Vendor validation error",
        "Please complete all required fields."
      );
    }

    if (!form.password) {
      return showError(
        "Vendor validation error",
        "Please enter passcode."
      );
    }

    if (!form.confirm_password) {
      return showError(
        "Vendor validation error",
        "Please confirm the passcode."
      );
    }

    /* =====================================================
       PASSCODE VALIDATION
       ===================================================== */

    if (!/^\d{4}$/.test(form.password)) {
      return showError(
        "Invalid passcode",
        "Passcode must be exactly 4 digits."
      );
    }

    if (
      form.password !==
      form.confirm_password
    ) {
      return showError(
        "Passcode mismatch",
        "Passcode and Confirm Passcode must match."
      );
    }

    /* =====================================================
       MOBILE VALIDATION
       ===================================================== */

    const cleanMobile =
      form.mobile_number.replace(/\D/g, "");

    if (cleanMobile.length !== 10) {
      return showError(
        "Invalid mobile number",
        "Please enter a valid 10-digit vendor mobile number."
      );
    }

    /* =====================================================
       UPI VALIDATION
       ===================================================== */

    const cleanUpiId =
      form.upi_id.trim();

    if (!cleanUpiId) {
      return showError(
        "UPI ID required",
        "Please enter the vendor UPI ID."
      );
    }

    if (
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(
        cleanUpiId
      )
    ) {
      return showError(
        "Invalid UPI ID",
        "Please enter a valid UPI ID, for example vendor@ybl."
      );
    }

    /* =====================================================
       OFFER VALIDATION
       ===================================================== */

    let offerPercentage = null;

    if (
      form.offer_percentage !== "" &&
      form.offer_percentage !== null
    ) {
      offerPercentage =
        Number(form.offer_percentage);

      if (
        !Number.isFinite(
          offerPercentage
        ) ||
        offerPercentage < 0 ||
        offerPercentage > 100
      ) {
        return showError(
          "Invalid offer",
          "Offer percentage must be between 0 and 100."
        );
      }
    }

    setLoading(true);

    /* =====================================================
       PAYLOAD
       ===================================================== */

    const payload = {
      sales_id: session.id,

      business_name:
        form.business_name.trim(),

      category:
        form.category.trim() || null,

      owner_name:
        form.owner_name.trim(),

      mobile_number:
        cleanMobile,

      email:
        form.email.trim() || null,

      address: [
        form.city.trim(),
        form.address.trim(),
      ]
        .filter(Boolean)
        .join(", "),

      upi_id:
        cleanUpiId,

      offer_percentage:
        offerPercentage,

      password:
        form.password,

      status: "Active",
    };

    let result;

    /* =====================================================
       UPDATE
       ===================================================== */

    if (editingId) {
      result = await supabase
        .from("vendors")
        .update(payload)
        .eq("id", editingId)
        .eq("sales_id", session.id);
    }

    /* =====================================================
       INSERT
       ===================================================== */

    else {
      result = await supabase
        .from("vendors")
        .insert(payload);
    }

    setLoading(false);

    /* =====================================================
       DATABASE ERROR
       ===================================================== */

    if (result.error) {
      console.error(
        "VENDOR SAVE ERROR:",
        result.error
      );

      return showError(
        editingId
          ? "Vendor update failed"
          : "Vendor creation failed",
        friendlyError(
          result.error,
          "The vendor could not be saved. Please try again."
        )
      );
    }

    /* =====================================================
       EDIT SUCCESS
       ===================================================== */

    if (editingId) {
      await showSuccess(
        "Vendor updated successfully"
      );

      router.replace(
        "/salesexecutive/vendors"
      );

      return;
    }

    /* =====================================================
       NEW VENDOR SUCCESS
       ===================================================== */

    const shareResult =
      await Swal.fire({
        icon: "success",
        title:
          "Vendor registered successfully",
        text:
          "Send the vendor's login credentials through WhatsApp.",
        showCancelButton: true,
        confirmButtonText:
          "Share on WhatsApp",
        cancelButtonText:
          "Done",
        confirmButtonColor:
          "#13273c",
        cancelButtonColor:
          "#6b7280",
      });

    if (shareResult.isConfirmed) {
      sendVendorCredentials();
    }

    router.replace(
      "/salesexecutive/vendors"
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      <main className="pb-20">

        {/* ================= HEADER ================= */}

        <div className="bg-white border-b border-gray-100">

          <div className="px-5 py-3 flex items-center gap-3">

            <button
              type="button"
              onClick={() => router.back()}
              className="
                p-1
                rounded-lg
                hover:bg-gray-100
              "
            >
              <ArrowLeft
                size={17}
                className="text-[#13273c]"
              />
            </button>

            <div>

              <h1
                className="
                  text-[14px]
                  font-bold
                  text-[#13273c]
                "
              >
                {editingId
                  ? "Edit Vendor"
                  : "Vendor Registration"}
              </h1>

              <p
                className="
                  text-[9px]
                  text-gray-500
                "
              >
                {editingId
                  ? "Update vendor details"
                  : "Add new vendor details"}
              </p>

            </div>

          </div>

        </div>

        {/* ================= REGISTRATION CARD ================= */}

        <div className="px-2 pt-3">

          <div
            className="
              bg-white
              rounded-xl
              px-3
              py-4
              shadow-sm
            "
          >

            {/* CARD HEADER */}

            <div
              className="
                flex
                items-center
                gap-2
                mb-4
              "
            >

              <div
                className="
                  w-8
                  h-8
                  rounded-full
                  bg-orange-500
                  flex
                  items-center
                  justify-center
                  text-white
                "
              >
                <Store size={17} />
              </div>

              <div>

                <h2
                  className="
                    text-[12px]
                    font-bold
                    text-[#13273c]
                  "
                >
                  {editingId
                    ? "Edit Vendor"
                    : "Register Vendor"}
                </h2>

                <p
                  className="
                    text-[8px]
                    text-gray-500
                  "
                >
                  Enter vendor information
                </p>

              </div>

            </div>

            {/* ================= FORM ================= */}

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-2 gap-3">

                <InputBox
                  icon={<Store size={12} />}
                  label="Business Name"
                  placeholder="Enter business name"
                  type="text"
                  name="business_name"
                  value={form.business_name}
                  onChange={handleChange}
                  required
                />

                <InputBox
                  icon={<Store size={12} />}
                  label="Category"
                  placeholder="Restaurant, Hotel, Shopping..."
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required={false}
                />

                <InputBox
                  icon={<User size={12} />}
                  label="Owner Name"
                  placeholder="Enter owner name"
                  type="text"
                  name="owner_name"
                  value={form.owner_name}
                  onChange={handleChange}
                  required
                />

                <InputBox
                  icon={<Phone size={12} />}
                  label="Mobile Number"
                  placeholder="10-digit mobile number"
                  type="tel"
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                  required
                />

                <InputBox
                  icon={<Mail size={12} />}
                  label="Email Address"
                  placeholder="example@gmail.com"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required={false}
                />

                <InputBox
                  icon={<MapPin size={12} />}
                  label="City"
                  placeholder="City"
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required={false}
                />

                <InputBox
                  icon={<MapPin size={14} />}
                  label="Address"
                  placeholder="Enter complete address"
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required={false}
                />

                {/* UPI ID */}

                <InputBox
                  icon={<CreditCard size={12} />}
                  label="UPI ID"
                  placeholder="example@ybl"
                  type="text"
                  name="upi_id"
                  value={form.upi_id}
                  onChange={handleChange}
                  required
                />

                {/* OFFER */}

                <InputBox
                  icon={null}
                  label="Offer Percentage"
                  placeholder="Enter %"
                  type="number"
                  name="offer_percentage"
                  value={form.offer_percentage}
                  onChange={handleChange}
                  required={false}
                />

                {/* PASSCODE */}

                <PasswordBox
                  label="Passcode"
                  placeholder="Enter 4-digit passcode"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  showPassword={showPassword}
                  setShowPassword={
                    setShowPassword
                  }
                />

                {/* CONFIRM PASSCODE */}

                <PasswordBox
                  label="Confirm Passcode"
                  placeholder="Confirm 4-digit passcode"
                  name="confirm_password"
                  value={
                    form.confirm_password
                  }
                  onChange={handleChange}
                  showPassword={
                    showConfirmPassword
                  }
                  setShowPassword={
                    setShowConfirmPassword
                  }
                />

              </div>

              {/* BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-5
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    router.back()
                  }
                  className="
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    border-gray-200
                    text-[10px]
                    text-gray-600
                    hover:bg-gray-100
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex
                    items-center
                    gap-1.5
                    px-4
                    py-2.5
                    rounded-xl
                    bg-[#13273c]
                    text-white
                    text-[10px]
                    font-semibold
                    shadow
                    hover:bg-[#1d3b5d]
                    disabled:opacity-60
                  "
                >

                  <CheckCircle size={12} />

                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Save Vendor"
                    : "Register Vendor"}

                </button>

              </div>

            </form>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}

/* =====================================================
   INPUT BOX
   ===================================================== */

function InputBox({
  icon,
  label,
  placeholder,
  type = "text",
  required,
  name,
  value,
  onChange,
}) {
  return (
    <div>

      <label
        className="
          text-[9px]
          font-semibold
          text-[#13273c]
        "
      >
        {label}
      </label>

      <div
        className="
          mt-1
          flex
          items-center
          bg-[#fafafa]
          border
          border-gray-200
          rounded-xl
          px-3
          h-[40px]
          focus-within:border-[#13273c]
        "
      >

        {icon && (
          <span className="text-gray-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="
            w-full
            bg-transparent
            px-2
            outline-none
            text-[10px]
            text-gray-700
            placeholder:text-gray-400
          "
        />

      </div>

    </div>
  );
}

/* =====================================================
   PASSCODE BOX
   ===================================================== */

function PasswordBox({
  label,
  placeholder,
  name,
  value,
  onChange,
  showPassword,
  setShowPassword,
}) {
  return (
    <div>

      <label
        className="
          text-[9px]
          font-semibold
          text-[#13273c]
        "
      >
        {label}
      </label>

      <div
        className="
          mt-1
          flex
          items-center
          bg-[#fafafa]
          border
          border-gray-200
          rounded-xl
          px-3
          h-[40px]
          focus-within:border-[#13273c]
        "
      >

        <span className="text-gray-400">
          <Lock size={12} />
        </span>

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          name={name}
          value={value}
          onChange={(e) => {
            const numericValue =
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 4);

            onChange({
              target: {
                name,
                value: numericValue,
              },
            });
          }}
          placeholder={placeholder}
          maxLength={4}
          inputMode="numeric"
          pattern="[0-9]{4}"
          required
          className="
            w-full
            bg-transparent
            px-2
            outline-none
            text-[10px]
            text-gray-700
            placeholder:text-gray-400
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
            flex
            items-center
            justify-center
          "
        >
          {showPassword ? (
            <EyeOff size={12} />
          ) : (
            <Eye size={12} />
          )}
        </button>

      </div>

    </div>
  );
}