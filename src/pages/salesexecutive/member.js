import { ArrowLeft, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";

export default function Member() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Member Registered Successfully!");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb]">

      {/* Header */}

      <div className="bg-white ">

        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">

          <button
            onClick={() => router.back()}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-2xl font-bold">
            Add Member
          </h1>

        </div>

      </div>

      {/* Form */}

      <div className="max-w-5xl mx-auto p-6">

        <div className="bg-white rounded-2xl shadow-sm p-8">

          <div className="flex items-center gap-4 mb-8">

            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">

              <UserPlus
                className="text-[#b56a38]"
                size={28}
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Member Registration
              </h2>


            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >

            <div>
              <label className="block font-medium mb-1">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter Full Name"
                className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Mobile Number
              </label>

              <input
                type="tel"
                placeholder="9876543210"
                className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Email Address
              </label>

              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Date of Birth
              </label>

              <input
                type="date"
                className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Gender
              </label>

              <select className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200">
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">
                City
              </label>

              <input
                type="text"
                placeholder="Enter City"
                className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
              />
            </div>

            <div className="md:col-span-2">

              <label className="block font-medium mb-1">
                Address
              </label>

              <textarea
                rows="3"
                placeholder="Enter Address"
                className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
              />

            </div>

            <div className="md:col-span-2 flex justify-end gap-4">

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#13273c] text-white hover:bg-[#1c3652]"
              >
                Register Member
              </button>

            </div>

          </form>

        </div>

      </div>
<Footer />
    </div>
  );
}