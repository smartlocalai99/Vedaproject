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
import { friendlyError, showError, showSuccess } from "@/lib/alerts";


export default function Member() {

  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", mobile_number: "", email: "", dob: "", gender: "", city: "", address: "" });
  const sessionRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("salesExecutiveSession");
    if (!saved) { router.replace("/salesexecutive/login"); return; }
    const session = JSON.parse(saved);
    sessionRef.current = session;
    const memberId = router.query.id;
    if (!memberId) return;
    async function loadMember() {
      const { data, error } = await supabase.from("members").select("*").eq("id", memberId).eq("sales_id", session.id).maybeSingle();
      if (error || !data) { showError("Could not load member", "This member is not available."); return; }
      setEditingId(data.id);
      const addressParts = (data.address || "").split(", ");
      setForm({ full_name: data.full_name || "", mobile_number: data.mobile_number || "", email: data.email || "", dob: data.dob || "", gender: data.gender || "", city: addressParts[0] || "", address: addressParts.slice(1).join(", ") });
    }
    loadMember();
  }, [router]);


  const handleSubmit = async (e)=>{
    e.preventDefault();
    const session = sessionRef.current;
    if (!session) return showError("Member creation failed", "Your session has expired. Please log in again.");
    if (!form.full_name.trim() || !form.mobile_number.trim()) return showError("Member validation error", "Please complete all required fields.");
    setLoading(true); setMessage("");
    const { data: lastMember, error: cardError } = editingId ? { data: null, error: null } : await supabase.from("members").select("card_number").order("card_number", { ascending: false }).limit(1).maybeSingle();
    if (cardError) { setLoading(false); return showError("Member creation failed", friendlyError(cardError, "A member number could not be generated.")); }
    const lastNumber = Number(String(lastMember?.card_number || "VEDA000000").replace(/\D/g, ""));
    const card_number = `VEDA${String(lastNumber + 1).padStart(6, "0")}`;
    const { data: duplicate } = await supabase.from("members").select("id").eq("mobile_number", form.mobile_number.trim()).neq("id", editingId || "00000000-0000-0000-0000-000000000000").maybeSingle();
    if (duplicate) { setLoading(false); return showError("Duplicate member", "A member with this mobile number already exists."); }
    const payload = {
      sales_id: session.id, full_name: form.full_name.trim(), mobile_number: form.mobile_number.trim(),
      email: form.email || null, dob: form.dob || null, gender: form.gender || null,
      address: [form.city, form.address].filter(Boolean).join(", "), status: "Active",
    };
    if (!editingId) payload.card_number = card_number;
    const { error } = editingId ? await supabase.from("members").update(payload).eq("id", editingId).eq("sales_id", session.id) : await supabase.from("members").insert(payload);
    setLoading(false);
    if (error) return showError(editingId ? "Member update failed" : "Member creation failed", friendlyError(error, "The member could not be saved. Please try again."));
    await showSuccess(editingId ? "Member updated successfully" : "Member created successfully", editingId ? undefined : `Card: ${card_number}`);
    router.replace("/salesexecutive/members");
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
shadow-sm
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
">

<ArrowLeft size={22}/>

</button>



<div>

<h1 className="
text-m
font-bold
text-[#13273c]
">
{editingId ? "Edit Member" : "Member Registration"}
</h1>


<p className="
text-xs
text-gray-500
">
Add new member details
</p>


</div>


</div>

</header>






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


{/* Title */}

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
shadow
">

<UserPlus
size={25}
className="text-white"
/>


</div>




<div>


<h2 className="
text-lg
font-bold
text-gray-800
">
{editingId ? "Edit Member" : "Register Member"}
</h2>


<p className="
text-xs
text-gray-500
">
Enter member information
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

icon={<User size={15}/>}

label="Full Name"

placeholder="Enter full name"

required
type="text"
name="full_name"
value={form.full_name}
onChange={(e) => setForm({ ...form, full_name: e.target.value })}

/>




<InputBox

icon={<Phone size={15}/>}

label="Mobile Number"

placeholder="9876543210"

type="tel"
name="mobile_number"
value={form.mobile_number}
onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}

required

/>





<InputBox

icon={<Mail size={15}/>}

label="Email Address"

placeholder="example@gmail.com"

type="email"
name="email"
required={false}
value={form.email}
onChange={(e) => setForm({ ...form, email: e.target.value })}

/>





<InputBox

icon={<Calendar size={15}/>}

label="Date of Birth"

type="date"
name="dob"
required={false}
value={form.dob}
onChange={(e) => setForm({ ...form, dob: e.target.value })}

/>





<div>


<label className="
text-sm
font-semibold
text-gray-700
">

Gender

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
">


<Users
size={15}
className="text-gray-400"
/>



<select

name="gender"
value={form.gender}
onChange={(e) => setForm({ ...form, gender: e.target.value })}

className="
w-full
bg-transparent
px-3
py-3
outline-none
text-sm
"

>

<option>
Select Gender
</option>

<option>
Male
</option>

<option>
Female
</option>

<option>
Other
</option>


</select>


</div>


</div>





<InputBox

icon={<MapPin size={15}/>}

label="City"

placeholder="Hyderabad"
type="text"
required={false}
name="city"
value={form.city}
onChange={(e) => setForm({ ...form, city: e.target.value })}

/>






<div className="
md:col-span-2
">


<label className="
text-sm
font-semibold
text-gray-700
">

Address

</label>


<textarea

rows="4"

placeholder="Enter complete address"
value={form.address}
onChange={(e) => setForm({ ...form, address: e.target.value })}

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
focus:border-[#13273c]
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
px-6
py-3
rounded-xl
bg-[#13273c]
text-white
font-semibold
shadow
hover:bg-[#1d3b5d]
"

>


<CheckCircle size={15}/>

{loading ? "Saving..." : editingId ? "Save Member" : "Register Member"}


</button>



</div>




</form>


</div>


</main>



<Footer/>


</div>

);

}

function InputBox({ icon, label, placeholder, type = "text", required, name, value, onChange }) {
  return (
    <div>

      <label className="
        text-sm
        font-semibold
        text-gray-700
      ">
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
