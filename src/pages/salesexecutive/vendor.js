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
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(
      "salesExecutiveSession"
    );

    if (!saved) {
      router.replace("/salesexecutive/login");
      return;
    }

    const session = JSON.parse(saved);

    const vendorId = router.query.id;

    if (!vendorId) return;

    async function loadVendor() {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .eq("sales_id", session.id)
        .maybeSingle();

      if (error || !data) {
        showError(
          "Could not load vendor",
          "This vendor is not available."
        );
        return;
      }

      setEditingId(data.id);

      const addressParts = (data.address || "").split(", ");

      setForm({
        business_name: data.business_name || "",
        category: data.category || "",
        owner_name: data.owner_name || "",
        mobile_number: data.mobile_number || "",
        email: data.email || "",
        city: addressParts[0] || "",
        address: addressParts.slice(1).join(", "),
        password: data.password || "",
        confirm_password: data.password || "",
      });
    }

    loadVendor();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    const session = JSON.parse(saved);

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
        "Please enter password."
      );
    }

    if (!form.confirm_password) {
      return showError(
        "Vendor validation error",
        "Please confirm the password."
      );
    }

    if (form.password.length < 6) {
      return showError(
        "Invalid password",
        "Password must be at least 6 characters."
      );
    }

    if (
      form.password !== form.confirm_password
    ) {
      return showError(
        "Password mismatch",
        "Password and Confirm Password must match."
      );
    }

    setLoading(true);

    const payload = {
      sales_id: session.id,
      business_name:
        form.business_name.trim(),
      category:
        form.category.trim() || null,
      owner_name:
        form.owner_name.trim(),
      mobile_number:
        form.mobile_number.trim(),
      email:
        form.email.trim() || null,
      address: [
        form.city.trim(),
        form.address.trim(),
      ]
        .filter(Boolean)
        .join(", "),
      password:
        form.password,
      status: "Active",
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("vendors")
        .update(payload)
        .eq("id", editingId)
        .eq("sales_id", session.id);
    } else {
      result = await supabase
        .from("vendors")
        .insert(payload);
    }

    setLoading(false);

    if (result.error) {
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

    if (editingId) {
      await showSuccess("Vendor updated successfully");
    } else {
      const mobile =
        form.mobile_number.replace(/\D/g, "");

      const whatsappNumber =
        mobile.length === 10
          ? `91${mobile}`
          : mobile;

      const message = [
        `*Hello ${form.business_name} \u{1F44B}*`,
        "",
        "Welcome to *Veda Vendor*.",
        "",
        "Your Veda Vendor App login credentials are:",
        "",
        `*Email:* ${form.email}`,
        `*Password:* ${form.password}`,
        "",
        "Please use these credentials to log in to the Veda Vendor App.",
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

      const shareResult = await Swal.fire({
        icon: "success",
        title: "Vendor registered successfully",
        text: "Share the new vendor's login credentials on WhatsApp.",
        showCancelButton: true,
        confirmButtonText: "Share on WhatsApp",
        cancelButtonText: "Done",
        confirmButtonColor: "#13273c",
        cancelButtonColor: "#6b7280",
      });

      if (shareResult.isConfirmed) {
        window.open(
          whatsappUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }
    }

    router.replace(
      "/salesexecutive/vendors"
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      <main className="pb-20">

        {/* Header */}

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
              <h1 className="
                text-[14px]
                font-bold
                text-[#13273c]
              ">
                {editingId
                  ? "Vendor Registration"
                  : "Vendor Registration"}
              </h1>

              <p className="
                text-[9px]
                text-gray-500
              ">
                Add new vendor details
              </p>
            </div>

          </div>

        </div>

        {/* Registration Card */}

        <div className="px-2 pt-3">

          <div className="
            bg-white
            rounded-xl
            px-3
            py-4
            shadow-sm
          ">

            {/* Card Header */}

            <div className="
              flex
              items-center
              gap-2
              mb-4
            ">

              <div className="
                w-8
                h-8
                rounded-full
                bg-orange-500
                flex
                items-center
                justify-center
                text-white
              ">
                <Store size={17} />
              </div>

              <div>
                <h2 className="
                  text-[12px]
                  font-bold
                  text-[#13273c]
                ">
                  {editingId
                    ? "Edit Vendor"
                    : "Register Vendor"}
                </h2>

                <p className="
                  text-[8px]
                  text-gray-500
                ">
                  Enter vendor information
                </p>
              </div>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-2 gap-3">

  {/* Business Name */}
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

  {/* Category */}
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

  {/* Owner Name */}
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

  {/* Mobile */}
  <InputBox
    icon={<Phone size={12} />}
    label="Mobile Number"
    placeholder="mobile number"
    type="tel"
    name="mobile_number"
    value={form.mobile_number}
    onChange={handleChange}
    required
  />

  {/* Email */}
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

  {/* City */}
  <InputBox
    icon={<MapPin size={12} />}
    label="City"
    placeholder="city"
    type="text"
    name="city"
    value={form.city}
    onChange={handleChange}
    required={false}
  />

  {/* Address - full width */}
  <div className="col-span-2">

    <label className="
      text-[9px]
      font-semibold
      text-[#13273c]
    ">
      Address
    </label>

    <textarea
      rows="3"
      name="address"
      placeholder="Enter complete address"
      value={form.address}
      onChange={handleChange}
      className="
        mt-1
        w-full
        bg-[#fafafa]
        border
        border-gray-200
        rounded-xl
        px-3
        py-2.5
        outline-none
        focus:border-[#13273c]
        text-[10px]
        resize-none
      "
    />

  </div>

  {/* Password */}
  <PasswordBox
    label="Password"
    placeholder="Enter password"
    name="password"
    value={form.password}
    onChange={handleChange}
    showPassword={showPassword}
    setShowPassword={setShowPassword}
  />

  {/* Confirm Password */}
  <PasswordBox
    label="Confirm Password"
    placeholder="Confirm password"
    name="confirm_password"
    value={form.confirm_password}
    onChange={handleChange}
    showPassword={showConfirmPassword}
    setShowPassword={setShowConfirmPassword}
  />

</div>

              {/* Buttons */}

              <div className="
                flex
                justify-end
                gap-2
                pt-5
              ">

                <button
                  type="button"
                  onClick={() => router.back()}
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


/* =========================
   INPUT BOX
========================= */

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

      <label className="
        text-[9px]
        font-semibold
        text-[#13273c]
      ">
        {label}
      </label>

      <div className="
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
      ">

        <span className="text-gray-400">
          {icon}
        </span>

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


/* =========================
   PASSWORD BOX
========================= */

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

      <label className="
        text-[9px]
        font-semibold
        text-[#13273c]
      ">
        {label}
      </label>

      <div className="
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
      ">

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
          onChange={onChange}
          placeholder={placeholder}
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
