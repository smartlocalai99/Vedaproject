import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SuperAdminFooter from "@/components/SuperAdminFooter";

import {
  Mail,
  Phone,
  Shield,
  Pencil,
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

  /* =========================================================
     LOAD SAVED PROFILE IMAGE
  ========================================================= */

  useEffect(() => {
    const savedImage = localStorage.getItem(
      "superAdminProfileImage"
    );

    const savedProfile = localStorage.getItem(
      "superAdminProfile"
    );

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);

        setProfile((current) => ({
          ...current,
          ...parsedProfile,
          image:
            savedImage ||
            parsedProfile.image ||
            "",
        }));
      } catch (error) {
        console.log(
          "PROFILE LOAD ERROR:",
          error
        );

        if (savedImage) {
          setProfile((current) => ({
            ...current,
            image: savedImage,
          }));
        }
      }
    } else if (savedImage) {
      setProfile((current) => ({
        ...current,
        image: savedImage,
      }));
    }
  }, []);

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Convert image to Base64.
     *
     * Unlike URL.createObjectURL(),
     * Base64 remains available after page reload.
     */

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      setProfile((current) => ({
        ...current,
        image: imageData,
      }));

      /*
       * Save image permanently in browser storage.
       */

      localStorage.setItem(
        "superAdminProfileImage",
        imageData
      );
    };

    reader.onerror = () => {
      console.log(
        "PROFILE IMAGE ERROR"
      );
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     UPDATE PROFILE
  ========================================================= */

  const updateProfile = (
    field,
    value
  ) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =========================================================
     ENTER EDIT MODE
  ========================================================= */

  const handleEdit = () => {
    setEditing(true);
  };

  /* =========================================================
     SAVE CHANGES
  ========================================================= */

  const handleSave = () => {
    /*
     * Save complete profile locally.
     */

    localStorage.setItem(
      "superAdminProfile",
      JSON.stringify(profile)
    );

    /*
     * Save image separately as well.
     * This makes sure the image is available
     * even after logout/login.
     */

    if (profile.image) {
      localStorage.setItem(
        "superAdminProfileImage",
        profile.image
      );
    }

    console.log(
      "Profile Saved:",
      profile
    );

    setEditing(false);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    /*
     * IMPORTANT:
     *
     * Do NOT remove:
     * superAdminProfile
     * superAdminProfileImage
     *
     * Otherwise the profile image will disappear
     * after login again.
     */

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* ================= MAIN CONTENT ================= */}

      <div className="px-4 py-5 pb-32">

        {/* Page Title */}

        <h2 className="text-xl font-bold text-[#0F1F35]">
          My Profile
        </h2>

        {/* ================= PROFILE CARD ================= */}

        <div className="bg-white rounded-3xl p-4 mt-2 relative">

          {/* TOP RIGHT PENCIL */}

          {!editing && (
            <button
              onClick={handleEdit}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-[#F8F5EF] flex items-center justify-center hover:bg-[#eee8dc] transition"
            >
              <Pencil
                size={17}
                className="text-[#0F1F35]"
              />
            </button>
          )}

          {/* PROFILE CONTENT */}

          <div className="flex items-center gap-4">

            {/* ================= PROFILE IMAGE ================= */}

            <div className="relative shrink-0">

              {profile.image ? (

                /* eslint-disable-next-line @next/next/no-img-element */

                <img
                  src={profile.image}
                  alt="Profile"
                  className="w-[70px] h-[70px] rounded-full object-cover border-2 border-white"
                />

              ) : (

                <div className="w-[70px] h-[70px] rounded-full bg-[#0F1F35] flex items-center justify-center">

                  <span className="text-[34px] font-bold text-white">

                    {profile.name
                      ? profile.name
                          .charAt(0)
                          .toUpperCase()
                      : "S"}

                  </span>

                </div>
              )}

              {/* CAMERA */}

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

            <div className="flex-1 min-w-0">

              {editing ? (

                <input
                  value={profile.name}
                  onChange={(e) =>
                    updateProfile(
                      "name",
                      e.target.value
                    )
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

        <div className="bg-white rounded-3xl shadow-sm mt-3 p-5 space-y-6">

          {/* ================= EMAIL ================= */}

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center shrink-0">

              <Mail
                size={20}
                className="text-[#0F1F35]"
              />

            </div>

            <div className="flex-1">

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

        {/* ================= SAVE CHANGES ================= */}

        {editing && (
          <button
            onClick={handleSave}
            className="w-full mt-6 h-14 rounded-2xl bg-[#B67A43] text-white text-[17px] font-bold hover:bg-[#9F6939] transition"
          >
            Save Changes
          </button>
        )}

      </div>

      {/* ================= FOOTER ================= */}

      <SuperAdminFooter />

    </div>
  );
}