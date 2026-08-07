/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SuperAdminFooter from "@/components/SuperAdminFooter";
import { supabase } from "@/lib/supabase";

import {
  CircleUserRound,
  Mail,
  Phone,
  Pencil,
  LogOut,
  ChevronRight,
  Camera,
  Briefcase,
  Calendar,
  MapPin,
  BadgeCheck,
} from "lucide-react";

export default function Profile() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [profileId, setProfileId] = useState("");

  const [profile, setProfile] = useState({
    name: "Rahul Kumar",
    employeeId: "VEDA001",
    designation: "Sales Executive",
    email: "rahul@vedaminds.com",
    phone: "9876543210",
    joiningDate: "01 Jan 2025",
    address: "Madhapur,\nHyderabad,\nTelangana - 500081",
    role: "Sales Executive",
    image: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("salesExecutiveSession");
    if (!saved) { router.replace("/salesexecutive/login"); return; }
    const session = JSON.parse(saved);
    setProfileId(session.id);
    async function loadProfile() {
      const { data } = await supabase.from("sales_executives").select("*").eq("id", session.id).maybeSingle();
      if (!data) return;
      setProfile((current) => ({ ...current, name: data.full_name || "", employeeId: data.employee_id || "", email: data.email || "", phone: data.mobile_number || "", address: data.assigned_area || "", joiningDate: data.created_at ? new Date(data.created_at).toLocaleDateString("en-IN") : "" }));
    }
    loadProfile();
  }, [router]);

  /* ================= IMAGE UPLOAD ================= */

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfile({
        ...profile,
        image: URL.createObjectURL(file),
      });
    }
  };

  /* ================= UPDATE PROFILE ================= */

  const updateProfile = (field, value) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  /* ================= EDIT / SAVE ================= */

  const handleEdit = async () => {
    if (editing) {
      const { error } = await supabase.from("sales_executives").update({ full_name: profile.name, email: profile.email, mobile_number: profile.phone, assigned_area: profile.address }).eq("id", profileId);
      if (error) { alert(error.message); return; }
      const saved = JSON.parse(localStorage.getItem("salesExecutiveSession") || "{}");
      localStorage.setItem("salesExecutiveSession", JSON.stringify({ ...saved, full_name: profile.name, email: profile.email, mobile_number: profile.phone, assigned_area: profile.address }));
    }

    setEditing(!editing);
  };

  /* ================= CONTACT ADMIN ================= */

  const contactAdmin = () => {
    window.location.href = "tel:+919876543210";
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("employeeProfile");

    router.push("/salesexecutive/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8]">

      {/* ================= MAIN CONTENT ================= */}

      <div className="px-4 py-5 pb-28">

        {/* ================= PAGE TITLE ================= */}

        <h2 className="text-xl font-bold text-[#0F1F35]">
          My Profile
        </h2>

        {/* ================= PROFILE CARD ================= */}

        <div className="bg-white rounded-3xl p-4 mt-2 relative">

          {/* Edit / Save Button */}

          <button
            onClick={handleEdit}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-[#F8F5EF] flex items-center justify-center hover:bg-[#eee8dc] transition"
          >
            {editing ? (
              <span className="text-xs font-semibold text-[#B67A43]">
                Save
              </span>
            ) : (
              <Pencil
                size={17}
                className="text-[#0F1F35]"
              />
            )}
          </button>

          {/* Profile Content */}

          <div className="flex items-center gap-4">

            {/* ================= PROFILE IMAGE ================= */}

            <div className="relative shrink-0">

              {profile.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.image}
                  alt="Profile"
                  className="w-15 h-15 rounded-full object-cover border-4 border-[#0F1F35]"
                />
              ) : (
                <div className="w-15 h-15 rounded-full bg-[#0F1F35] flex items-center justify-center">
                  <CircleUserRound
                    size={35}
                    className="text-white"
                  />
                </div>
              )}

              {/* Camera Button */}

              {editing && (
                <>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    hidden
                    onChange={handleImage}
                  />

                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#B67A43] flex items-center justify-center cursor-pointer shadow-md"
                  >
                    <Camera
                      size={14}
                      className="text-white"
                    />
                  </label>
                </>
              )}

            </div>

            {/* ================= NAME + ROLE ================= */}

            <div className="flex-1 pr-10">

              {editing ? (
                <input
                  value={profile.name}
                  onChange={(e) =>
                    updateProfile("name", e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base font-bold text-[#0F1F35] outline-none focus:ring-2 focus:ring-[#B67A43]"
                />
              ) : (
                <h3 className="text-lg font-bold text-[#0F1F35] truncate">
                  {profile.name}
                </h3>
              )}

              <p className="text-sm text-gray-500 mt-1">
                {profile.designation}
              </p>

            </div>

          </div>

        </div>

        {/* ================= PROFILE DETAILS ================= */}

        <div className="bg-white rounded-3xl shadow-sm mt-2 p-5 space-y-6">

          {/* ================= EMPLOYEE ID ================= */}

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center shrink-0">
              <BadgeCheck
                size={20}
                className="text-[#0F1F35]"
              />
            </div>

            <div className="flex-1">

              <p className="text-xs text-gray-500 mb-1">
                Employee ID
              </p>

              <p className="font-semibold text-sm text-[#0F1F35]">
                {profile.employeeId}
              </p>

            </div>

          </div>

          {/* ================= DESIGNATION ================= */}

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center shrink-0">
              <Briefcase
                size={20}
                className="text-[#0F1F35]"
              />
            </div>

            <div className="flex-1">

              <p className="text-xs text-gray-500 mb-1">
                Designation
              </p>

              {editing ? (
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) =>
                    updateProfile(
                      "designation",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#B67A43]"
                />
              ) : (
                <p className="font-semibold text-sm text-[#0F1F35]">
                  {profile.designation}
                </p>
              )}

            </div>

          </div>

          {/* ================= MOBILE ================= */}

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center shrink-0">
              <Phone
                size={20}
                className="text-[#0F1F35]"
              />
            </div>

            <div className="flex-1">

              <p className="text-xs text-gray-500 mb-1">
                Mobile Number
              </p>

              {editing ? (
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) =>
                    updateProfile(
                      "phone",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#B67A43]"
                />
              ) : (
                <p className="font-semibold text-sm text-[#0F1F35]">
                  +91 {profile.phone}
                </p>
              )}

            </div>

          </div>

          {/* ================= EMAIL ================= */}

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center shrink-0">
              <Mail
                size={20}
                className="text-[#0F1F35]"
              />
            </div>

            <div className="flex-1 ">

              <p className="text-xs text-gray-500 mb-1">
                Email
              </p>

              {editing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    updateProfile(
                      "email",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#B67A43]"
                />
              ) : (
                <p className="font-semibold text-sm text-[#0F1F35] break-all">
                  {profile.email}
                </p>
              )}

            </div>

          </div>

          {/* ================= JOINING DATE ================= */}

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center shrink-0">
              <Calendar
                size={20}
                className="text-[#0F1F35]"
              />
            </div>

            <div className="flex-1">

              <p className="text-xs text-gray-500 mb-1">
                Joining Date
              </p>

              {editing ? (
                <input
                  type="text"
                  value={profile.joiningDate}
                  onChange={(e) =>
                    updateProfile(
                      "joiningDate",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#B67A43]"
                />
              ) : (
                <p className="font-semibold text-sm text-[#0F1F35]">
                  {profile.joiningDate}
                </p>
              )}

            </div>

          </div>

          {/* ================= ADDRESS ================= */}

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center shrink-0">
              <MapPin
                size={20}
                className="text-[#0F1F35]"
              />
            </div>

            <div className="flex-1">

              <p className="text-xs text-gray-500 mb-1">
                Address
              </p>

              {editing ? (
                <textarea
                  value={profile.address}
                  onChange={(e) =>
                    updateProfile(
                      "address",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-[#B67A43]"
                />
              ) : (
                <p className="font-semibold text-sm text-[#0F1F35] whitespace-pre-line">
                  {profile.address}
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ================= SETTINGS ================= */}

        <div className="bg-white rounded-3xl shadow-sm mt-2 p-2">

          {/* ================= CONTACT ADMIN ================= */}

          <button
            onClick={contactAdmin}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-[#F8F5EF] transition"
          >

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center">
                <Phone
                  size={20}
                  className="text-[#0F1F35]"
                />
              </div>

              <span className="font-medium text-[#0F1F35]">
                Contact Admin
              </span>

            </div>

            <ChevronRight
              size={18}
              className="text-gray-400"
            />

          </button>

          {/* ================= LOGOUT ================= */}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-red-50 transition"
          >

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <LogOut
                  size={20}
                  className="text-red-500"
                />
              </div>

              <span className="font-medium text-red-500">
                Logout
              </span>

            </div>

            <ChevronRight
              size={18}
              className="text-red-400"
            />

          </button>

        </div>

      </div>

      {/* ================= FOOTER ================= */}

      <SuperAdminFooter />

    </div>
  );
}
