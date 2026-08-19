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
import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

import {
  friendlyError,
  showError,
  showSuccess,
} from "@/lib/alerts";

const DOCUMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";
const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const hasAllowedDocumentType = (file) => {
  if (!file) return false;

  const extension = file.name.split(".").pop()?.toLowerCase();
  return (
    DOCUMENT_MIME_TYPES.includes(file.type) ||
    ["pdf", "jpg", "jpeg", "png"].includes(extension)
  );
};

export default function Vendor() {
  const router = useRouter();

  const [form, setForm] = useState({
    business_name: "",
    category: "",
    subcategory: "",
    owner_name: "",
    mobile_number: "",
    email: "",
    location: "",
    upi_id: "",
    offer_percentage: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState("");
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] =
    useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [salesExecutive, setSalesExecutive] = useState(null);
  const [governmentProofFile, setGovernmentProofFile] =
    useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [existingDocuments, setExistingDocuments] = useState({
    governmentProof: "",
    aadhaar: "",
  });
  const [locationResults, setLocationResults] = useState([]);
  const [locationResultsQuery, setLocationResultsQuery] =
    useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocationResults, setShowLocationResults] =
    useState(false);
  const [locationSearchError, setLocationSearchError] =
    useState("");
  const [hasSelectedLocation, setHasSelectedLocation] =
    useState(false);
  const locationSearchTimeout = useRef(null);

  const activeCategoryId =
    selectedCategoryId ||
    String(
      categories.find(
        (category) => category.name === form.category
      )?.id || ""
    );

  /* =====================================================
     LOAD CATEGORY MASTER DATA
     ===================================================== */

  useEffect(() => {
    async function loadCategories() {
      setCategoriesLoading(true);

      const { data, error } = await supabase
        .from("vendor_categories")
        .select("*")
        .order("id", { ascending: true });

      setCategoriesLoading(false);

      if (error) {
        console.error("VENDOR CATEGORIES LOAD ERROR:", error);
        showError(
          "Could not load categories",
          friendlyError(
            error,
            "Vendor categories could not be loaded. Please try again."
          )
        );
        return;
      }

      setCategories(data || []);
    }

    loadCategories();
  }, []);

  /* =====================================================
     LOAD SUBCATEGORIES FOR THE SELECTED CATEGORY ONLY
     ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadSubcategories() {
      if (!activeCategoryId) {
        setSubcategories([]);
        setSubcategoriesLoading(false);
        return;
      }

      setSubcategories([]);
      setSubcategoriesLoading(true);

      const { data, error } = await supabase
        .from("vendor_subcategories")
        .select("*")
        .eq("category_id", activeCategoryId)
        .order("id", { ascending: true });

      if (cancelled) return;

      setSubcategoriesLoading(false);

      if (error) {
        console.error("VENDOR SUBCATEGORIES LOAD ERROR:", error);
        showError(
          "Could not load subcategories",
          friendlyError(
            error,
            "Vendor subcategories could not be loaded. Please try again."
          )
        );
        return;
      }

      setSubcategories(data || []);
    }

    loadSubcategories();

    return () => {
      cancelled = true;
    };
  }, [activeCategoryId]);

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
      setExistingDocuments({
        governmentProof: data.government_proof_path || "",
        aadhaar: data.aadhaar_path || "",
      });

      setForm({
        business_name:
          data.business_name || "",

        category:
          data.category || "",

        subcategory:
          data.subcategory || "",

        owner_name:
          data.owner_name || "",

        mobile_number:
          data.mobile_number || "",

        email:
          data.email || "",

        location: data.address || "",

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
      setHasSelectedLocation(Boolean(data.address));
    }

    loadVendor();
  }, [router]);

  useEffect(() => {
    const query = form.location.trim();

    if (locationSearchTimeout.current) {
      clearTimeout(locationSearchTimeout.current);
    }

    if (query.length < 3) {
      return;
    }

    locationSearchTimeout.current = setTimeout(async () => {
      setLocationLoading(true);
      setLocationSearchError("");

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`
        );
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok || !contentType.includes("application/json")) {
          throw new Error("Location search returned an invalid response.");
        }

        const data = await response.json();
        setLocationResults(Array.isArray(data) ? data : []);
        setLocationResultsQuery(query);
      } catch (error) {
        console.error("LOCATION SEARCH ERROR:", error);
        setLocationResults([]);
        setLocationResultsQuery(query);
        setLocationSearchError(
          "Could not search locations. Please try again."
        );
      } finally {
        setLocationLoading(false);
      }
    }, 500);

    return () => clearTimeout(locationSearchTimeout.current);
  }, [form.location]);

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

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(
      (category) => String(category.id) === categoryId
    );

    setSelectedCategoryId(categoryId);
    setSubcategories([]);
    setForm((prev) => ({
      ...prev,
      category: selectedCategory?.name || "",
      subcategory: "",
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

  const handleDocumentChange = (event, setFile) => {
    const file = event.target.files?.[0] || null;

    if (file && !hasAllowedDocumentType(file)) {
      event.target.value = "";
      setFile(null);
      showError(
        "Invalid document type",
        "Please select a PDF, JPG, JPEG, or PNG document."
      );
      return;
    }

    setFile(file);
  };

  const uploadDocument = async (vendorId, file, documentName) => {
    if (!file) return null;

    const extension = file.name.split(".").pop()?.toLowerCase() || "file";
    const timestamp = Date.now();
    const filename = `${documentName}-${timestamp}.${extension}`;
    const bucketAttempts = [
      { bucket: "vendor-documents", path: `${vendorId}/${filename}` },
      { bucket: "documents", path: `vendor-documents/${vendorId}/${filename}` },
    ];
    let lastError;

    for (const attempt of bucketAttempts) {
      const { error } = await supabase.storage
        .from(attempt.bucket)
        .upload(attempt.path, file, {
          contentType: file.type || undefined,
          upsert: false,
        });

      if (!error) {
        return {
          bucket: attempt.bucket,
          path: attempt.path,
          reference: `${attempt.bucket}/${attempt.path}`,
        };
      }

      lastError = error;

      if (!/bucket.*not found|not found.*bucket/i.test(error.message || "")) {
        break;
      }
    }

    throw lastError || new Error("Document upload failed.");
  };

  const removeUploadedDocuments = async (uploads) => {
    await Promise.all(
      uploads.map(({ bucket, path }) =>
        supabase.storage.from(bucket).remove([path])
      )
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
      !form.category.trim() ||
      !form.subcategory.trim() ||
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

    if (!form.location.trim() || !hasSelectedLocation) {
      return showError(
        "Location required",
        "Please select a location from the search results."
      );
    }

    if (!editingId && !governmentProofFile) {
      return showError(
        "Government Proof required",
        "Please select the vendor's Government Proof document."
      );
    }

    if (!editingId && !aadhaarFile) {
      return showError(
        "Aadhaar Card required",
        "Please select the vendor's Aadhaar Card document."
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

      subcategory:
        form.subcategory.trim() || null,

      owner_name:
        form.owner_name.trim(),

      mobile_number:
        cleanMobile,

      email:
        form.email.trim() || null,

      address: form.location.trim(),

      upi_id:
        cleanUpiId,

      offer_percentage:
        offerPercentage,

      password:
        form.password,

      status: "Active",
    };

    let vendorId = editingId;
    let createdVendor = false;
    const uploadedDocuments = [];

    try {
      if (editingId) {
        const { error } = await supabase
          .from("vendors")
          .update(payload)
          .eq("id", editingId)
          .eq("sales_id", session.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("vendors")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;

        vendorId = data?.id;
        createdVendor = true;

        if (!vendorId) {
          throw new Error("The new vendor ID was not returned.");
        }
      }

      const documentUpdates = {};

      if (governmentProofFile) {
        const upload = await uploadDocument(
          vendorId,
          governmentProofFile,
          "government-proof"
        );
        uploadedDocuments.push(upload);
        documentUpdates.government_proof_path = upload.reference;
      }

      if (aadhaarFile) {
        const upload = await uploadDocument(
          vendorId,
          aadhaarFile,
          "aadhaar"
        );
        uploadedDocuments.push(upload);
        documentUpdates.aadhaar_path = upload.reference;
      }

      if (Object.keys(documentUpdates).length > 0) {
        const { error } = await supabase
          .from("vendors")
          .update(documentUpdates)
          .eq("id", vendorId)
          .eq("sales_id", session.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error("VENDOR SAVE OR DOCUMENT UPLOAD ERROR:", error);
      await removeUploadedDocuments(uploadedDocuments);

      if (createdVendor && vendorId) {
        const { error: deleteError } = await supabase
          .from("vendors")
          .delete()
          .eq("id", vendorId)
          .eq("sales_id", session.id);

        if (deleteError) {
          console.error("VENDOR CLEANUP ERROR:", deleteError);
        }
      }

      setLoading(false);
      return showError(
        editingId ? "Vendor update failed" : "Vendor creation failed",
        friendlyError(
          error,
          "The vendor and documents could not be saved. Please try again."
        )
      );
    }

    setLoading(false);

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

                <SelectBox
                  icon={<Store size={12} />}
                  label="Category"
                  name="category"
                  value={activeCategoryId}
                  onChange={handleCategoryChange}
                  disabled={categoriesLoading}
                  required
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </SelectBox>

                <SelectBox
                  icon={<Store size={12} />}
                  label="Subcategory"
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  disabled={
                    !activeCategoryId || subcategoriesLoading
                  }
                  required
                >
                  <option value="">
                    {!activeCategoryId
                      ? "Select category first"
                      : subcategoriesLoading
                      ? "Loading subcategories..."
                      : "Select subcategory"}
                  </option>
                  {subcategories.map((subcategory) => (
                    <option
                      key={subcategory.id}
                      value={subcategory.name}
                    >
                      {subcategory.name}
                    </option>
                  ))}
                </SelectBox>

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

                <LocationAutocomplete
                  value={form.location}
                  onChange={(value) => {
                    setForm((prev) => ({ ...prev, location: value }));
                    setHasSelectedLocation(false);
                    setLocationLoading(value.trim().length >= 3);
                    setLocationSearchError("");
                  }}
                  onSelect={(value) => {
                    setForm((prev) => ({ ...prev, location: value }));
                    setHasSelectedLocation(true);
                    setLocationLoading(false);
                  }}
                  error={locationSearchError}
                  results={locationResults}
                  resultsQuery={locationResultsQuery}
                  loading={locationLoading}
                  open={showLocationResults}
                  onOpenChange={setShowLocationResults}
                />

                <DocumentBox
                  label="Government Proof"
                  file={governmentProofFile}
                  existingReference={existingDocuments.governmentProof}
                  onChange={(event) =>
                    handleDocumentChange(event, setGovernmentProofFile)
                  }
                  required={!editingId}
                />

                <DocumentBox
                  label="Aadhaar Card"
                  file={aadhaarFile}
                  existingReference={existingDocuments.aadhaar}
                  onChange={(event) =>
                    handleDocumentChange(event, setAadhaarFile)
                  }
                  required={!editingId}
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

function DocumentBox({
  label,
  file,
  existingReference,
  onChange,
  required,
}) {
  return (
    <div>
      <label className="text-[9px] font-semibold text-[#13273c]">
        {label} {required && <span className="text-red-500">* Required</span>}
      </label>

      <div className="mt-1 flex items-center bg-[#fafafa] border border-gray-200 rounded-xl px-3 h-[40px] focus-within:border-[#13273c]">
        <input
          type="file"
          accept={DOCUMENT_ACCEPT}
          onChange={onChange}
          required={required}
          className="w-full text-[9px] text-gray-700 file:mr-2 file:border-0 file:bg-transparent file:text-[9px] file:font-semibold file:text-[#13273c]"
        />
      </div>

      <p className="mt-1 text-[8px] text-gray-500">
        {file
          ? `Selected: ${file.name}`
          : existingReference
          ? "Document already uploaded. Choose a file only to replace it."
          : "PDF, JPG, JPEG, or PNG"}
      </p>
    </div>
  );
}

function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  error,
  results,
  resultsQuery,
  loading,
  open,
  onOpenChange,
}) {
  const visibleResults =
    value.trim().length >= 3 &&
    resultsQuery === value.trim()
      ? results
      : [];

  const selectLocation = (location) => {
    onSelect(location.display_name || "");
    onOpenChange(false);
  };

  return (
    <div className="relative">
      <label className="text-[9px] font-semibold text-[#13273c]">Location</label>

      <div className="mt-1 flex items-center bg-[#fafafa] border border-gray-200 rounded-xl px-3 h-[40px] focus-within:border-[#13273c]">
        <span className="text-gray-400"><MapPin size={12} /></span>
        <input
          type="text"
          name="location"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            onOpenChange(true);
          }}
          onFocus={() => onOpenChange(true)}
          placeholder="Search location..."
          autoComplete="off"
          className="w-full bg-transparent px-2 outline-none text-[10px] text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {open && value.trim().length >= 3 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {loading && (
            <p className="px-3 py-2 text-[9px] text-gray-500">Searching locations...</p>
          )}
          {!loading && error && (
            <p className="px-3 py-2 text-[9px] text-red-500">{error}</p>
          )}
          {!loading && !error && visibleResults.length === 0 && (
            <p className="px-3 py-2 text-[9px] text-gray-500">No locations found</p>
          )}
          {!loading && !error && visibleResults.map((location) => (
            <button
              key={location.place_id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectLocation(location)}
              className="block w-full border-b border-gray-100 px-3 py-2 text-left text-[9px] text-gray-700 last:border-b-0 hover:bg-gray-50"
            >
              {location.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   SELECT BOX
   ===================================================== */

function SelectBox({
  icon,
  label,
  required,
  name,
  value,
  onChange,
  disabled,
  children,
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

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="
            w-full
            bg-transparent
            px-2
            outline-none
            text-[10px]
            text-gray-700
            disabled:cursor-not-allowed
            disabled:text-gray-400
          "
        >
          {children}
        </select>

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







