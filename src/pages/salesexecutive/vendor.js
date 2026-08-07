
import {
  ArrowLeft,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle,
} from "lucide-react";

import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default function Vendor() {

  const router = useRouter();
  const [form, setForm] = useState({ business_name: "", owner_name: "", mobile_number: "", email: "", area: "", city: "", address: "" });
  const sessionRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("salesExecutiveSession");
    if (!saved) { router.replace("/salesexecutive/login"); return; }
    sessionRef.current = JSON.parse(saved);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const session = sessionRef.current;
    if (!session) return;
    setLoading(true); setMessage("");
    const { error } = await supabase.from("vendors").insert({
      sales_id: session.id,
      business_name: form.business_name,
      owner_name: form.owner_name,
      category: "General",
      mobile_number: form.mobile_number,
      email: form.email || null,
      address: [form.area, form.city, form.address].filter(Boolean).join(", "),
      status: "Active",
    });
    setLoading(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Vendor registered successfully.");
    setForm({ business_name: "", owner_name: "", mobile_number: "", email: "", area: "", city: "", address: "" });
  };

  return (

    <div className="
      min-h-screen
      flex
      flex-col
      bg-[#f7f8fb]
    ">


      {/* Header */}

      <header className="
        bg-white
        sticky
        top-0
        z-10
      ">

        <div className="
          px-4
          py-4
          flex
          items-center
          gap-3
        ">

          <button
            onClick={()=>router.back()}
            className="
            p-2
            rounded-xl
            hover:bg-gray-100
            "
          >
            <ArrowLeft size={22}/>
          </button>


          <div>

            <h1 className="
              text-m
              font-bold
              text-[#13273c]
            ">
              Vendor Registration
            </h1>

            <p className="
              text-xs
              text-gray-500
            ">
              Add new business partner
            </p>

          </div>


        </div>

      </header>



      {/* Content */}

      <main className="
        flex-1
        px-4
        py-6
        pb-28
      ">


        <div className="
          mx-auto
          bg-white
          rounded-3xl
          p-6
        ">


          {/* Profile Icon */}

          <div className="
            flex
            items-center
            gap-3
            mb-8
          ">


            <div className="
              w-10
              h-10
              rounded-2xl
              bg-gradient-to-br
              from-orange-400
              to-orange-600
              flex
              items-center
              justify-center
              
            ">

              <Store
                size={25}
                className="text-white"
              />

            </div>


            <div>

              <h2 className="
                text-xl
                font-bold
                text-gray-800
              ">
                Register Vendor
              </h2>


              <p className="
                text-xs
                text-gray-500
              ">
                Enter vendor business details
              </p>

            </div>


          </div>




          <form
            onSubmit={handleSubmit}
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-2
            "
          >


            <InputBox
  icon={<Building2 size={15} />}
  label="Business Name"
  type="text"
  placeholder="Business Name"
  required
  name="business_name"
  value={form.business_name}
  onChange={(e) =>
    setForm({
      ...form,
      business_name: e.target.value,
    })
  }
/>

<InputBox
  icon={<User size={15} />}
  label="Owner Name"
  type="text"
  placeholder="Owner Name"
  required
  name="owner_name"
  value={form.owner_name}
  onChange={(e) =>
    setForm({
      ...form,
      owner_name: e.target.value,
    })
  }
/>


           <InputBox
  icon={<Phone size={15} />}
  label="Mobile Number"
  placeholder="Mobile Number"
  type="tel"
  required
  name="mobile_number"
  value={form.mobile_number}
  onChange={(e) =>
    setForm({
      ...form,
      mobile_number: e.target.value,
    })
  }
/>


            <InputBox
  icon={<Mail size={15} />}
  label="Email Address"
  placeholder="example@gmail.com"
  type="email"
  required={false}
  name="email"
  value={form.email}
  onChange={(e) =>
    setForm({
      ...form,
      email: e.target.value,
    })
  }
/>


            <InputBox
  icon={<MapPin size={15} />}
  label="Area"
  type="text"
  placeholder="Area"
  required
  name="area"
  value={form.area}
  onChange={(e) =>
    setForm({
      ...form,
      area: e.target.value,
    })
  }
/>


            <InputBox
  icon={<MapPin size={15} />}
  label="City"
  type="text"
  placeholder="City"
  required
  name="city"
  value={form.city}
  onChange={(e) =>
    setForm({
      ...form,
      city: e.target.value,
    })
  }
/>



            <div className="
              md:col-span-2
            ">

              <label className="
                text-sm
                font-semibold
                text-gray-700
              ">
                Complete Address
              </label>

<textarea
  rows={4}
  placeholder="Enter complete address"
  value={form.address}
  onChange={(e) =>
    setForm({
      ...form,
      address: e.target.value,
    })
  }
  className="
    mt-2
    w-full
    bg-[#fafafa]
    border
    border-gray-200
    rounded-xl
    px-4
    py-3
    outline-none
  "
/>
</div>




            <div className="
              md:col-span-2
              flex
              justify-end
              gap-2
              pt-4
            ">


              <button
                type="button"
                onClick={()=>router.back()}
                className="
                px-6
                py-3
                rounded-xl
                border
                text-gray-600
                hover:bg-gray-100
                "
              >
                Cancel
              </button>



              <button
                type="submit"
                className="
                flex
                items-center
                gap-2
                px-5
                py-3
                rounded-lg
                bg-[#13273c]
                text-white
                font-semibold
                hover:bg-[#1d3b5d]
                shadow
                "
              >

                <CheckCircle size={15}/>

                {loading ? "Registering..." : "Register"}

              </button>


            </div>



          </form>

          {message && <p className="mt-3 text-sm text-[#B97943]">{message}</p>}


        </div>


      </main>



      <Footer/>


    </div>

  );
}

function InputBox({ icon, label, placeholder, type = "text", required, name, value, onChange }) {
  return (
    <div>

      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="
        mt-2
        flex
        items-center
        bg-[#fafafa]
        border
        border-gray-200
        rounded-xl
        px-4
        focus-within:border-[#13273c]
        transition
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
