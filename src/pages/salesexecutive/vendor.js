import { ArrowLeft, Store } from "lucide-react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";


export default function Vendor() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Vendor Registered Successfully!");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb]">

      {/* Header */}
      <div className="bg-white ">
        <div className="  px-4 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={22} />
            </button>

            <h1 className="text-2xl font-bold">
              Vendor Registration
            </h1>

          </div>

        </div>
      </div>

      {/* Form */}

      <div className=" p-6">

        <div className="bg-white rounded-2xl shadow-sm p-8">

          <div className="flex items-center gap-3 mb-8">

            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">

              <Store className="text-orange-600" size={28} />

            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Register Vendor
              </h2>

              

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >

            <div>
              <label className="block mb-1 font-medium">
                Business Name
              </label>

              <input
                type="text"
                placeholder="ABC Restaurant"
                className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Owner Name
              </label>

              <input
                type="text"
                placeholder="Rahul Kumar"
               className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
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
              <label className="block mb-1 font-medium">
                Email Address
              </label>

              <input
                type="email"
                placeholder="vendor@gmail.com"
              className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Area
              </label>

              <input
                type="text"
                placeholder="Hyderabad"
                className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                City
              </label>

              <input
                type="text"
                placeholder="Hyderabad"
               className="w-full border border-[#b56a38] rounded-xl px-4 py-3 outline-none  focus:ring-orange-200"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">
                Address
              </label>

              <textarea
                rows="3"
                placeholder="Enter complete address"
                className="w-full border border-[#b56a38] rounded-xl px-3 py-2 outline-none  focus:ring-orange-200"
              ></textarea>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4">

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#13273c] text-white hover:bg-[#1d3b5d]"
              >
                Register Vendor
              </button>

            </div>

          </form>

        </div>

      </div>
<Footer />
    </div>
  );
}