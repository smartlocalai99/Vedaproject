import {
  ArrowLeft,
  UserPlus,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
} from "lucide-react";

import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

import {
  friendlyError,
  showError,
  showSuccess,
} from "@/lib/alerts";

export default function Member() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    mobile_number: "",
    email: "",
    dob: "",
    gender: "",
    city: "",
    address: "",
  });

  const sessionRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState("");

  /* =====================================================
     LOAD SESSION + EDIT MEMBER
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

      localStorage.removeItem(
        "salesExecutiveSession"
      );

      router.replace("/salesexecutive/login");
      return;
    }

    if (!session?.id) {
      localStorage.removeItem(
        "salesExecutiveSession"
      );

      router.replace("/salesexecutive/login");
      return;
    }

    sessionRef.current = session;

    /*
     * EDIT MODE
     */

    if (!router.isReady) {
      return;
    }

    const memberId = router.query.id;

    if (!memberId) {
      return;
    }

    async function loadMember() {
      const {
        data,
        error,
      } = await supabase
        .from("members")
        .select("*")
        .eq("id", memberId)
        .eq("sales_id", session.id)
        .maybeSingle();

      if (error) {
        console.error(
          "LOAD MEMBER ERROR:",
          error
        );

        showError(
          "Could not load member",
          friendlyError(
            error,
            "This member could not be loaded."
          )
        );

        return;
      }

      if (!data) {
        showError(
          "Member not found",
          "This member is not available."
        );

        return;
      }

      setEditingId(data.id);

      const addressParts = (
        data.address || ""
      ).split(", ");

      setForm({
        full_name:
          data.full_name || "",

        mobile_number:
          data.mobile_number || "",

        email:
          data.email || "",

        dob:
          data.dob || "",

        gender:
          data.gender || "",

        city:
          addressParts[0] || "",

        address:
          addressParts
            .slice(1)
            .join(", "),
      });
    }

    loadMember();
  }, [router.isReady, router]);

  /* =====================================================
     GENERATE NEXT CARD NUMBER
     VEDA000001
     VEDA000002
     ...
     ===================================================== */

  const generateCardNumber = async () => {
    const {
      data,
      error,
    } = await supabase
      .from("members")
      .select("card_number")
      .not("card_number", "is", null)
      .order("card_number", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "CARD NUMBER ERROR:",
        error
      );

      throw error;
    }

    let lastNumber = 0;

    if (data?.card_number) {
      const match =
        String(data.card_number).match(
          /(\d+)$/
        );

      if (match) {
        lastNumber = Number(
          match[1]
        );
      }
    }

    return `VEDA${String(
      lastNumber + 1
    ).padStart(6, "0")}`;
  };

  /* =====================================================
     SUBMIT
     ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const session =
      sessionRef.current;

    if (!session?.id) {
      showError(
        "Member creation failed",
        "Your session has expired. Please log in again."
      );

      return;
    }

    /*
     * REQUIRED VALIDATION
     */

    if (
      !form.full_name.trim() ||
      !form.mobile_number.trim()
    ) {
      showError(
        "Member validation error",
        "Please enter the member name and mobile number."
      );

      return;
    }

    /*
     * MOBILE VALIDATION
     */

    const mobile =
      form.mobile_number.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {
      showError(
        "Invalid mobile number",
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }

    setLoading(true);

    try {
      /* =================================================
         CHECK DUPLICATE MOBILE
         ================================================= */

      let duplicateQuery =
        supabase
          .from("members")
          .select("id")
          .eq(
            "mobile_number",
            mobile
          );

      if (editingId) {
        duplicateQuery =
          duplicateQuery.neq(
            "id",
            editingId
          );
      }

      const {
        data: duplicate,
        error: duplicateError,
      } = await duplicateQuery.maybeSingle();

      if (duplicateError) {
        console.error(
          "DUPLICATE CHECK ERROR:",
          duplicateError
        );

        showError(
          "Member validation failed",
          friendlyError(
            duplicateError,
            "Could not check the mobile number."
          )
        );

        return;
      }

      if (duplicate) {
        showError(
          "Duplicate member",
          "A member with this mobile number already exists."
        );

        return;
      }

      /* =================================================
         ADDRESS
         ================================================= */

      const fullAddress = [
        form.city.trim(),
        form.address.trim(),
      ]
        .filter(Boolean)
        .join(", ");

      /* =================================================
         UPDATE MEMBER
         ================================================= */

      if (editingId) {
        const updatePayload = {
          sales_id: session.id,

          full_name:
            form.full_name.trim(),

          mobile_number:
            mobile,

          email:
            form.email.trim() ||
            null,

          dob:
            form.dob ||
            null,

          gender:
            form.gender &&
            form.gender !==
              "Select Gender"
              ? form.gender
              : null,

          address:
            fullAddress ||
            null,

          status: "Active",
        };

        const {
          error,
        } = await supabase
          .from("members")
          .update(updatePayload)
          .eq("id", editingId)
          .eq("sales_id", session.id);

        if (error) {
          console.error(
            "UPDATE MEMBER ERROR:",
            error
          );

          showError(
            "Member update failed",
            friendlyError(
              error,
              "The member could not be updated."
            )
          );

          return;
        }

        await showSuccess(
          "Member updated successfully"
        );

        router.replace(
          "/salesexecutive/members"
        );

        return;
      }

      /* =================================================
         CREATE NEW MEMBER
         ================================================= */

      const cardNumber =
        await generateCardNumber();

      const insertPayload = {
        sales_id: session.id,

        card_number:
          cardNumber,

        full_name:
          form.full_name.trim(),

        mobile_number:
          mobile,

        email:
          form.email.trim() ||
          null,

        dob:
          form.dob ||
          null,

        gender:
          form.gender &&
          form.gender !==
            "Select Gender"
            ? form.gender
            : null,

        address:
          fullAddress ||
          null,

        status: "Active",
      };

      const {
        data,
        error,
      } = await supabase
        .from("members")
        .insert(
          insertPayload
        )
        .select()
        .single();

      if (error) {
        console.error(
          "CREATE MEMBER ERROR:",
          error
        );

        showError(
          "Member creation failed",
          friendlyError(
            error,
            "The member could not be created. Please try again."
          )
        );

        return;
      }

      console.log(
        "MEMBER CREATED:",
        data
      );

      await showSuccess(
        "Member created successfully",
        `Card: ${cardNumber}`
      );

      router.replace(
        "/salesexecutive/members"
      );
    } catch (error) {
      console.error(
        "MEMBER SAVE ERROR:",
        error
      );

      showError(
        editingId
          ? "Member update failed"
          : "Member creation failed",
        friendlyError(
          error,
          "Something went wrong. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div
      className="
        min-h-screen
        flex
        flex-col
        bg-[#f7f8fb]
      "
    >
      {/* HEADER */}

      <header
        className="
          bg-white
          shadow-sm
          sticky
          top-0
          z-10
        "
      >
        <div
          className="
            px-4
            py-4
            flex
            items-center
            gap-3
          "
        >
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="
              p-2
              rounded-xl
              hover:bg-gray-100
            "
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1
              className="
                text-lg
                font-bold
                text-[#13273c]
              "
            >
              {editingId
                ? "Edit Member"
                : "Member Registration"}
            </h1>

            <p
              className="
                text-xs
                text-gray-500
              "
            >
              Add new member details
            </p>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main
        className="
          flex-1
          px-4
          py-6
          pb-28
        "
      >
        <div
          className="
            mx-auto
            bg-white
            rounded-3xl
            p-6
          "
        >
          {/* TITLE */}

          <div
            className="
              flex
              items-center
              gap-3
              mb-8
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-2xl
                bg-gradient-to-br
                from-orange-400
                to-orange-600
                flex
                items-center
                justify-center
                shadow
              "
            >
              <UserPlus
                size={25}
                className="text-white"
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  font-bold
                  text-gray-800
                "
              >
                {editingId
                  ? "Edit Member"
                  : "Register Member"}
              </h2>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Enter member information
              </p>
            </div>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >
            <InputBox
              icon={<User size={15} />}
              label="Full Name"
              placeholder="Enter full name"
              required
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={(event) =>
                setForm({
                  ...form,
                  full_name:
                    event.target.value,
                })
              }
            />

            <InputBox
              icon={<Phone size={15} />}
              label="Mobile Number"
              placeholder="9876543210"
              type="tel"
              name="mobile_number"
              value={form.mobile_number}
              onChange={(event) =>
                setForm({
                  ...form,
                  mobile_number:
                    event.target.value.replace(
                      /\D/g,
                      ""
                    ).slice(0, 10),
                })
              }
              required
            />

            <InputBox
              icon={<Mail size={15} />}
              label="Email Address"
              placeholder="example@gmail.com"
              type="email"
              name="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email:
                    event.target.value,
                })
              }
            />

            <InputBox
              icon={<Calendar size={15} />}
              label="Date of Birth"
              type="date"
              name="dob"
              value={form.dob}
              onChange={(event) =>
                setForm({
                  ...form,
                  dob:
                    event.target.value,
                })
              }
            />

            {/* GENDER */}

            <div>
              <label
                className="
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Gender
              </label>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  bg-[#fafafa]
                  border
                  border-gray-200
                  rounded-xl
                  px-4
                "
              >
                <Users
                  size={15}
                  className="text-gray-400"
                />

                <select
                  name="gender"
                  value={form.gender}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      gender:
                        event.target.value,
                    })
                  }
                  className="
                    w-full
                    bg-transparent
                    px-3
                    py-3
                    outline-none
                    text-sm
                  "
                >
                  <option value="">
                    Select Gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>
            </div>

            {/* CITY */}

            <InputBox
              icon={<MapPin size={15} />}
              label="City"
              placeholder="Hyderabad"
              type="text"
              name="city"
              value={form.city}
              onChange={(event) =>
                setForm({
                  ...form,
                  city:
                    event.target.value,
                })
              }
            />

            {/* ADDRESS */}

            <div
              className="
                md:col-span-2
              "
            >
              <label
                className="
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Address
              </label>

              <textarea
                rows="4"
                placeholder="Enter complete address"
                value={form.address}
                onChange={(event) =>
                  setForm({
                    ...form,
                    address:
                      event.target.value,
                  })
                }
                className="
                  mt-2
                  w-full
                  bg-[#fafafa]
                  border
                  border-gray-200
                  rounded-xl
                  px-3
                  py-3
                  outline-none
                  focus:border-[#13273c]
                  text-sm
                "
              />
            </div>

            {/* BUTTONS */}

            <div
              className="
                md:col-span-2
                flex
                justify-end
                gap-2
                pt-4
              "
            >
              <button
                type="button"
                onClick={() =>
                  router.back()
                }
                disabled={loading}
                className="
                  px-6
                  py-3
                  rounded-xl
                  border
                  text-gray-600
                  hover:bg-gray-100
                  disabled:opacity-50
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
                  gap-2
                  px-6
                  py-3
                  rounded-xl
                  bg-[#13273c]
                  text-white
                  font-semibold
                  shadow
                  hover:bg-[#1d3b5d]
                  disabled:opacity-50
                "
              >
                <CheckCircle size={15} />

                {loading
                  ? "Saving..."
                  : editingId
                  ? "Save Member"
                  : "Register Member"}
              </button>
            </div>
          </form>
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
  required = false,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label
        className="
          text-sm
          font-semibold
          text-gray-700
        "
      >
        {label}
      </label>

      <div
        className="
          mt-2
          flex
          items-center
          bg-[#fafafa]
          border
          border-gray-200
          rounded-xl
          px-4
          focus-within:border-[#13273c]
        "
      >
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
            px-3
            py-3
            outline-none
            text-sm
          "
        />
      </div>
    </div>
  );
}

