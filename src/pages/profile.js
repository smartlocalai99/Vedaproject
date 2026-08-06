
// import SuperAdminFooter from "@/components/SuperAdminFooter";

// import {
//   CircleUserRound,
//   Mail,
//   Phone,
//   Shield,
//   Pencil,
//   Lock,
//   LogOut,
//   ChevronRight,
// } from "lucide-react";

// export default function Profile() {
//   return (
//     <main className="bg-[#F8F5EF] min-h-screen max-w-[430px] mx-auto pb-24">


//       <div className="px-4 py-5">

//         <h2 className="text-2xl font-bold text-[#0F1F35]">
//           My Profile
//         </h2>

//         {/* Profile Card */}

//         <div className="bg-white rounded-3xl shadow-sm p-6 mt-5">

//           <div className="flex flex-col items-center">

//             <div className="w-24 h-24 rounded-full bg-[#0F1F35] flex items-center justify-center">

//               <CircleUserRound
//                 size={70}
//                 className="text-white"
//               />

//             </div>

//             <button className="mt-3 text-[#B67A43] text-sm font-semibold flex items-center gap-1">
//               <Pencil size={15} />
//               Edit Photo
//             </button>

//             <h3 className="text-xl font-bold text-[#0F1F35] mt-4">
//               Super Admin
//             </h3>

//             <p className="text-gray-500">
//               Administrator
//             </p>

//           </div>

//         </div>

//         {/* Details */}

//         <div className="bg-white rounded-3xl shadow-sm mt-5">

//           <div className="flex items-center justify-between px-5 py-4 border-b">

//             <div className="flex items-center gap-3">

//               <Mail className="text-[#0F1F35]" />

//               <div>

//                 <p className="text-xs text-gray-500">
//                   Email
//                 </p>

//                 <p className="font-medium">
//                   admin@vedaminds.com
//                 </p>

//               </div>

//             </div>

//           </div>

//           <div className="flex items-center justify-between px-5 py-4 border-b">

//             <div className="flex items-center gap-3">

//               <Phone className="text-[#0F1F35]" />

//               <div>

//                 <p className="text-xs text-gray-500">
//                   Mobile
//                 </p>

//                 <p className="font-medium">
//                   +91 9876543210
//                 </p>

//               </div>

//             </div>

//           </div>

//           <div className="flex items-center justify-between px-5 py-4">

//             <div className="flex items-center gap-3">

//               <Shield className="text-[#0F1F35]" />

//               <div>

//                 <p className="text-xs text-gray-500">
//                   Role
//                 </p>

//                 <p className="font-medium">
//                   Super Administrator
//                 </p>

//               </div>

//             </div>

//           </div>

//         </div>

//         {/* Settings */}

//         <div className="bg-white rounded-3xl shadow-sm mt-5">

//           <button className="w-full flex items-center justify-between px-5 py-4 border-b">

//             <div className="flex items-center gap-3">

//               <Lock className="text-[#0F1F35]" />

//               <span className="font-medium">
//                 Change Password
//               </span>

//             </div>

//             <ChevronRight size={18} />

//           </button>

//           <button className="w-full flex items-center justify-between px-5 py-4 text-red-600">

//             <div className="flex items-center gap-3">

//               <LogOut />

//               <span className="font-medium">
//                 Logout
//               </span>

//             </div>

//             <ChevronRight size={18} />

//           </button>

//         </div>

//       </div>

//       <SuperAdminFooter />

//     </main>
//   );
// }







// import { useState } from "react";
// import SuperAdminFooter from "@/components/SuperAdminFooter";

// import {
//   CircleUserRound,
//   Mail,
//   Phone,
//   Shield,
//   Pencil,
//   Lock,
//   LogOut,
//   ChevronRight,
// } from "lucide-react";

// export default function Profile() {
//   const [editing, setEditing] = useState(false);

//   const [profile, setProfile] = useState({
//     name: "Super Admin",
//     email: "admin@vedaminds.com",
//     phone: "9876543210",
//     role: "Administrator",
//     image: "",
//   });

//   const handleImage = (e) => {
//     const file = e.target.files[0];

//     if (file) {
//       setProfile({
//         ...profile,
//         image: URL.createObjectURL(file),
//       });
//     }
//   };

//   return (
//     <main className="bg-[#F8F5EF] min-h-screen max-w-[430px] mx-auto pb-24">

//       <div className="px-4 py-5">

//         <h2 className="text-2xl font-bold text-[#0F1F35]">
//           My Profile
//         </h2>

//         {/* Profile Card */}

//         <div className="bg-white rounded-3xl shadow-sm p-6 mt-5">

//           <div className="flex flex-col items-center">

//             <div className="relative">

//               {profile.image ? (
//                 <img
//                   src={profile.image}
//                   alt="Profile"
//                   className="w-24 h-24 rounded-full object-cover border-4 border-[#0F1F35]"
//                 />
//               ) : (
//                 <div className="w-24 h-24 rounded-full bg-[#0F1F35] flex items-center justify-center">
//                   <CircleUserRound
//                     size={70}
//                     className="text-white"
//                   />
//                 </div>
//               )}

//               {editing && (
//                 <>
//                   <input
//                     type="file"
//                     id="profileImage"
//                     accept="image/*"
//                     hidden
//                     onChange={handleImage}
//                   />

//                   <label
//                     htmlFor="profileImage"
//                     className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#B67A43] flex items-center justify-center cursor-pointer"
//                   >
//                     <Pencil
//                       size={15}
//                       className="text-white"
//                     />
//                   </label>
//                 </>
//               )}

//             </div>

//             <button
//               onClick={() => setEditing(!editing)}
//               className="mt-4 bg-[#B67A43] text-white px-5 py-2 rounded-xl font-medium"
//             >
//               {editing ? "Save Profile" : "Edit Profile"}
//             </button>

//             {editing ? (
//               <input
//                 className="border mt-5 rounded-xl px-4 py-3 w-full text-center outline-none"
//                 value={profile.name}
//                 onChange={(e) =>
//                   setProfile({
//                     ...profile,
//                     name: e.target.value,
//                   })
//                 }
//               />
//             ) : (
//               <h3 className="text-xl font-bold text-[#0F1F35] mt-5">
//                 {profile.name}
//               </h3>
//             )}

//             <p className="text-gray-500 mt-1">
//               {profile.role}
//             </p>

//           </div>

//         </div>

//         {/* Profile Details */}

//         <div className="bg-white rounded-3xl shadow-sm mt-5">
//                       {/* Email */}

//           <div className="flex items-center gap-3 px-5 py-4 border-b">

//             <Mail className="text-[#0F1F35]" size={20} />

//             <div className="flex-1">

//               <p className="text-xs text-gray-500">
//                 Email
//               </p>

//               {editing ? (
//                 <input
//                   type="email"
//                   value={profile.email}
//                   onChange={(e) =>
//                     setProfile({
//                       ...profile,
//                       email: e.target.value,
//                     })
//                   }
//                   className="w-full mt-1 border rounded-lg px-3 py-2 outline-none"
//                 />
//               ) : (
//                 <p className="font-medium">
//                   {profile.email}
//                 </p>
//               )}

//             </div>

//           </div>

//           {/* Mobile */}

//           <div className="flex items-center gap-3 px-5 py-4 border-b">

//             <Phone className="text-[#0F1F35]" size={20} />

//             <div className="flex-1">

//               <p className="text-xs text-gray-500">
//                 Mobile
//               </p>

//               {editing ? (
//                 <input
//                   type="text"
//                   value={profile.phone}
//                   onChange={(e) =>
//                     setProfile({
//                       ...profile,
//                       phone: e.target.value,
//                     })
//                   }
//                   className="w-full mt-1 border rounded-lg px-3 py-2 outline-none"
//                 />
//               ) : (
//                 <p className="font-medium">
//                   +91 {profile.phone}
//                 </p>
//               )}

//             </div>

//           </div>

//           {/* Role */}

//           <div className="flex items-center gap-3 px-5 py-4">

//             <Shield className="text-[#0F1F35]" size={20} />

//             <div>

//               <p className="text-xs text-gray-500">
//                 Role
//               </p>

//               <p className="font-medium">
//                 {profile.role}
//               </p>

//             </div>

//           </div>

//         </div>

//         {/* Settings */}

//         <div className="bg-white rounded-3xl shadow-sm mt-5 overflow-hidden">

//           <button className="w-full flex items-center justify-between px-5 py-4 border-b hover:bg-gray-50 transition">

//             <div className="flex items-center gap-3">

//               <Lock className="text-[#0F1F35]" />

//               <span className="font-medium">
//                 Change Password
//               </span>

//             </div>

//             <ChevronRight size={18} />

//           </button>

//           <button className="w-full flex items-center justify-between px-5 py-4 text-red-600 hover:bg-red-50 transition">

//             <div className="flex items-center gap-3">

//               <LogOut />

//               <span className="font-medium">
//                 Logout
//               </span>

//             </div>

//             <ChevronRight size={18} />

//           </button>

//         </div>

//       </div>

//       <SuperAdminFooter />

//     </main>
//   );
// }
    
        



import { useState } from "react";
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
} from "lucide-react";

export default function Profile() {
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Super Admin",
    email: "admin@vedaminds.com",
    phone: "9876543210",
    role: "Administrator",
    image: "",
  });

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfile({
        ...profile,
        image: URL.createObjectURL(file),
      });
    }
  };

  return (
    <main className="bg-[#F8F5EF] min-h-screen max-w-[430px] mx-auto pb-24">

      <div className="px-4 py-5">

        <h2 className="text-2xl font-bold text-[#0F1F35]">
          My Profile
        </h2>

        {/* Profile Card */}

        <div className="bg-white rounded-3xl shadow-sm p-6 mt-5">

          <div className="flex flex-col items-center">

            <div className="relative">

              {profile.image ? (
                <img
                  src={profile.image}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#0F1F35]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#0F1F35] flex items-center justify-center">
                  <CircleUserRound
                    size={70}
                    className="text-white"
                  />
                </div>
              )}

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
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#B67A43] flex items-center justify-center cursor-pointer shadow-lg"
                  >
                    <Pencil
                      size={15}
                      className="text-white"
                    />
                  </label>
                </>
              )}

            </div>

            <button
              onClick={() => setEditing(!editing)}
              className="mt-4 bg-[#B67A43] hover:bg-[#9C6337] text-white px-5 py-2 rounded-xl font-medium transition"
            >
              {editing ? "Save Profile" : "Edit Profile"}
            </button>

            {editing ? (
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
                className="mt-5 w-full border rounded-xl px-4 py-3 text-center outline-none focus:ring-2 focus:ring-[#B67A43]"
              />
            ) : (
              <h3 className="text-xl font-bold text-[#0F1F35] mt-5">
                {profile.name}
              </h3>
            )}

            <p className="text-gray-500 mt-1">
              {profile.role}
            </p>

          </div>

        </div>

        {/* Profile Details */}

        <div className="bg-white rounded-3xl shadow-sm mt-5 p-5 space-y-6">
                    {/* Email */}

        <div className="flex items-start gap-4">

          <div className="w-11 h-11 rounded-xl bg-[#F8F5EF] flex items-center justify-center">
            <Mail size={20} className="text-[#0F1F35]" />
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
                  setProfile({
                    ...profile,
                    email: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3 outline-none  focus:ring-[#B67A43]"
              />
            ) : (
              <p className="font-semibold text-[#0F1F35]">
                {profile.email}
              </p>
            )}

          </div>

        </div>

        {/* Mobile */}

        <div className="flex items-start gap-4">

          <div className="w-11 h-11 rounded-xl bg-[#F8F5EF] flex items-center justify-center">
            <Phone size={20} className="text-[#0F1F35]" />
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
                  setProfile({
                    ...profile,
                    phone: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3 outline-none  focus:ring-[#B67A43]"
              />
            ) : (
              <p className="font-semibold text-[#0F1F35]">
                +91 {profile.phone}
              </p>
            )}

          </div>

        </div>

        {/* Role */}

        <div className="flex items-start gap-4">

          <div className="w-11 h-11 rounded-xl bg-[#F8F5EF] flex items-center justify-center">
            <Shield size={20} className="text-[#0F1F35]" />
          </div>

          <div>

            <p className="text-xs text-gray-500 mb-1">
              Role
            </p>

            <p className="font-semibold text-[#0F1F35]">
              {profile.role}
            </p>

          </div>

        </div>

      </div>

      {/* Settings */}

      <div className="bg-white rounded-3xl shadow-sm mt-5 p-2">
                <button
          className="w-full flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-[#F8F5EF] transition"
        >
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] flex items-center justify-center">
              <Lock size={20} className="text-[#0F1F35]" />
            </div>

            <span className="font-medium text-[#0F1F35]">
              Change Password
            </span>

          </div>

          <ChevronRight
            size={18}
            className="text-gray-400"
          />
        </button>

        <button
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

      <div className="h-24" />

      <SuperAdminFooter />
</div>
    </main>
  );
}