import { useState } from "react";
import { useRouter } from "next/router";
import SuperAdminFooter from "@/components/SuperAdminFooter";

import {
  CircleUserRound,
  Mail,
  Phone,
  Shield,
  Pencil,
  Lock,
  LogOut,
  ChevronRight,
  Camera,
} from "lucide-react";

export default function Profile() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Super Admin",
    email: "admin@vedaminds.com",
    phone: "9876543210",
    role: "Administrator",
    image: "",
  });

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfile({
        ...profile,
        image: URL.createObjectURL(file),
      });
    }
  };

  /* ---------------- UPDATE PROFILE ---------------- */

  const updateProfile = (field, value) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  /* ---------------- EDIT / SAVE ---------------- */

  const handleEdit = () => {
    if (editing) {
      // Save logic can be added here
      console.log("Profile Saved:", profile);
    }

    setEditing(!editing);
  };

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = () => {
    localStorage.removeItem("superAdminProfile");

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8]">

      {/* ================= MAIN CONTENT ================= */}

      <div className="px-4 py-5 pb-28">

        {/* Page Title */}

        <h2 className="text-xl font-bold text-[#0F1F35]">
          My Profile
        </h2>

        {/* ================= PROFILE CARD ================= */}

        <div className="bg-white rounded-3xl p-4 mt-2  relative">

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
                {profile.role}
              </p>

            </div>

          </div>

        </div>

        {/* ================= PROFILE DETAILS ================= */}

        <div className="bg-white rounded-3xl shadow-sm mt-1 p-5 space-y-6">

          {/* ================= EMAIL ================= */}

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF]  flex items-center justify-center shrink-0">
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
                    updateProfile("email", e.target.value)
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
                    updateProfile("phone", e.target.value)
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

          {/* ================= ROLE ================= */}

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center shrink-0">
              <Shield
                size={20}
                className="text-[#0F1F35]"
              />
            </div>

            <div>

              <p className="text-xs text-gray-500 mb-1">
                Role
              </p>

              <p className="font-semibold text-sm text-[#0F1F35]">
                {profile.role}
              </p>

            </div>

          </div>

        </div>


      </div>

      {/* ================= FOOTER ================= */}

      <SuperAdminFooter />

    </div>
  );
}
