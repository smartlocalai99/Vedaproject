// import { useState } from "react";
// import { useRouter } from "next/router";
// import { Mail, ArrowLeft } from "lucide-react";
// import Image from "next/image";
// import { showError, showSuccess } from "@/lib/alerts";

// export default function ResetPassword() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSendOTP = async (e) => {
//     e.preventDefault();

//     if (loading) return;

//     const cleanEmail = email.trim().toLowerCase();

//     if (!cleanEmail) {
//       showError(
//         "Email Required",
//         "Please enter your email address."
//       );
//       return;
//     }

//     if (
//       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
//         cleanEmail
//       )
//     ) {
//       showError(
//         "Invalid Email",
//         "Please enter a valid email address."
//       );
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(
//         "/api/auth/send-reset-otp",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             email: cleanEmail,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         showError(
//           "Unable to Send OTP",
//           data.message ||
//             "Unable to send OTP. Please try again."
//         );
//         return;
//       }

//       showSuccess(
//         "OTP Sent",
//         `OTP sent to ${cleanEmail}`
//       );

//       router.push(
//         `/salesexecutive/verify-otp?email=${encodeURIComponent(
//           cleanEmail
//         )}`
//       );
//     } catch (error) {
//       console.error(
//         "SEND RESET OTP ERROR:",
//         error
//       );

//       showError(
//         "Something went wrong",
//         "Unable to send OTP. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBack = () => {
//     router.push("/salesexecutive/login");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4">

//       <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">

//         {/* BACK */}

//         <button
//           type="button"
//           onClick={handleBack}
//           className="flex items-center gap-2 text-gray-500 hover:text-[#b56a38] mb-6"
//         >
//           <ArrowLeft size={19} />
//           Back to Login
//         </button>

//         {/* LOGO */}

//         <div className="text-center mb-8">

//           <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">

//             <Image
//               src="/Logo veda.png"
//               alt="Veda Minds"
//               width={85}
//               height={85}
//               className="object-contain"
//               priority
//             />

//           </div>

//           <h1 className="text-3xl font-bold">
//             Reset Password
//           </h1>

//           <p className="text-gray-500 mt-2">
//             Enter your registered email address
//           </p>

//         </div>

//         {/* EMAIL FORM */}

//         <form
//           onSubmit={handleSendOTP}
//           className="space-y-5"
//         >

//           <div>

//             <label className="block mb-2 font-medium">
//               Email Address
//             </label>

//             <div className="relative">

//               <Mail
//                 className="absolute left-4 top-4 text-gray-400"
//                 size={20}
//               />

//               <input
//                 type="email"
//                 name="email"
//                 value={email}
//                 onChange={(e) =>
//                   setEmail(e.target.value)
//                 }
//                 placeholder="Enter Email Address"
//                 className="
//                   w-full
//                   border
//                   border-[#b56a38]
//                   rounded-xl
//                   pl-12
//                   pr-4
//                   py-3
//                   outline-none
//                   focus:ring-orange-200
//                 "
//                 autoComplete="email"
//                 required
//               />

//             </div>

//           </div>

//           {/* SEND OTP */}

//           <button
//             type="submit"
//             disabled={loading}
//             className="
//               w-full
//               bg-[#13273c]
//               hover:bg-[#1d3650]
//               text-white
//               py-3
//               rounded-xl
//               font-semibold
//               transition
//               disabled:opacity-60
//               disabled:cursor-not-allowed
//             "
//           >
//             {loading
//               ? "Sending OTP..."
//               : "Send OTP"}
//           </button>

//         </form>

//       </div>

//     </div>
//   );
// }















import { useState } from "react";
import { useRouter } from "next/router";
import { Mail, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { showError, showSuccess } from "@/lib/alerts";

export default function ResetPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      showError(
        "Email Required",
        "Please enter your email address."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      showError(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/send-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        showError(
          "OTP Failed",
          data.message || "Unable to send OTP."
        );
        return;
      }

      showSuccess(
        "OTP Sent",
        `OTP sent to ${cleanEmail}`
      );

      router.push(
        `/salesexecutive/verify-otp?email=${encodeURIComponent(
          cleanEmail
        )}`
      );
    } catch (error) {
      console.error(
        "SEND OTP ERROR:",
        error
      );

      showError(
        "Error",
        "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4">

      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">

        <button
          type="button"
          onClick={() =>
            router.push("/salesexecutive/login")
          }
          className="flex items-center gap-2 text-gray-500 hover:text-[#b56a38] mb-6"
        >
          <ArrowLeft size={19} />
          Back to Login
        </button>

        <div className="text-center mb-8">

          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">

            <Image
              src="/Logo veda.png"
              alt="Veda Minds"
              width={85}
              height={85}
              className="object-contain"
              priority
            />

          </div>

          <h1 className="text-3xl font-bold">
            Reset Password
          </h1>

          <p className="text-gray-500 mt-2">
            Enter your registered email address
          </p>

        </div>

        <form
          onSubmit={handleSendOTP}
          className="space-y-5"
        >

          <div>

            <label className="block mb-2 font-medium">
              Email Address
            </label>

            <div className="relative">

              <Mail
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter Email Address"
                className="
                  w-full
                  border
                  border-[#b56a38]
                  rounded-xl
                  pl-12
                  pr-4
                  py-3
                  outline-none
                "
                required
              />

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-[#13273c]
              hover:bg-[#1d3650]
              text-white
              py-3
              rounded-xl
              font-semibold
              disabled:opacity-60
            "
          >
            {loading
              ? "Sending OTP..."
              : "Send OTP"}
          </button>

        </form>

      </div>

    </div>
  );
}