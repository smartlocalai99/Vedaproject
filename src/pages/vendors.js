/* eslint-disable react-hooks/set-state-in-effect */
import {
  Store,
  Search,
  Plus,
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SuperAdminFooter from "@/components/SuperAdminFooter";
import { supabase } from "@/lib/supabase";


export default function Vendors(){


const router = useRouter();


const [vendors,setVendors] = useState([]);

const [create,setCreate] = useState(false);
const [editing, setEditing] = useState(null);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const loadVendors = async () => {
  setLoading(true);
  const { data, error: loadError } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
  if (loadError) setError(loadError.message);
  else setVendors(data || []);
  setLoading(false);
};

useEffect(() => { loadVendors(); }, []);

const deleteVendor = async (id) => {
  if (!window.confirm("Delete this vendor?")) return;
  const { error: deleteError } = await supabase.from("vendors").delete().eq("id", id);
  if (deleteError) setError(deleteError.message);
  else loadVendors();
};

const filteredVendors = vendors.filter((vendor) => [vendor.business_name, vendor.category, vendor.address, vendor.mobile_number].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));



return (

<>

<main className="
bg-[#F8F4EE]
min-h-screen
pb-24
p-5
text-[#1B2232]
">


{/* HEADER */}

<div className="
flex
justify-between
items-center
">


<div className="
flex
items-center
gap-2
">


<button

onClick={()=>router.push("/")}

className="
w-7
h-7
flex
items-center
justify-center
rounded
hover:bg-gray-200
"

>

<ArrowLeft size={16}/>

</button>



<div>

<h1 className="
font-bold
text-sm
">

Vendors

</h1>


<p className="
text-[10px]
text-gray-500
">

Manage all vendors

</p>


</div>


</div>




<button

onClick={()=>{ setEditing(null); setCreate(true); setTimeout(() => document.getElementById("create-vendor-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }}
type="button"

className="
bg-[#172033]
text-white
text-xs
px-4
py-2
rounded-md
flex
items-center
gap-2
"

>

<Plus size={14}/>

Add Vendor

</button>


</div>





{/* SEARCH */}


<div className="
bg-white
rounded-lg
mt-2
h-10
flex
items-center
px-3
gap-2
">


<Search 
size={16}
className="text-gray-400"
/>


<input

placeholder="Search vendors"
value={search}
onChange={(e) => setSearch(e.target.value)}

className="
outline-none
text-xs
w-full
"

/>


</div>





{/* LIST */}


<div className="
mt-1
space-y-3
">


{
filteredVendors.map((vendor,index)=>(


<div

key={vendor.id}

className="
bg-white
rounded-lg
p-3
shadow-sm
"


>


<div className="
flex
justify-between
items-center
">


<div className="
flex
gap-3
items-center
">


<div className="
w-10
h-10
rounded-full
bg-[#F3E8DA]
flex
items-center
justify-center
text-[#B97943]
">


<Store size={20}/>


</div>




<div>

<h3 className="
text-xs
font-bold
">

{vendor.business_name}

</h3>


<p className="
text-[10px]
text-gray-500
">

{vendor.category}

</p>


<p className="
text-[10px]
text-gray-400
">

{vendor.address}

</p>


  </div>

{loading && <p className="text-xs text-gray-500">Loading vendors...</p>}
{error && <p className="text-xs text-red-600">{error}</p>}


</div>





<div className="text-[10px] flex items-center gap-1">


<span className={`
w-2
h-2
rounded-full
${vendor.status==="Active"
?"bg-green-500"
:"bg-red-500"}
`}></span>


<span className={`
${vendor.status==="Active"
?"text-green-700"
:"text-red-600"}
`}>

{vendor.status}

</span>

<button onClick={() => { setEditing(vendor); setCreate(true); }} className="border rounded px-2 py-1 text-[10px]">Edit</button>
<button onClick={() => deleteVendor(vendor.id)} className="border rounded px-2 py-1 text-[10px]">Delete</button>


</div>


</div>


</div>


))

}


</div>






{
create &&

<CreateVendor

close={()=>setCreate(false)}

vendorItem={editing}

  addVendor={async (data)=>{
    setError("");
    const { error: insertError } = editing
      ? await supabase.from("vendors").update(data).eq("id", editing.id)
      : await supabase.from("vendors").insert(data);
    if (insertError) { setError(insertError.message); return; }
    setCreate(false);
    loadVendors();
  }}


/>

}



</main>



<SuperAdminFooter/>


</>

);


}





function CreateVendor({

close,
addVendor,
vendorItem

}){


const [form,setForm] = useState({

name:vendorItem?.business_name || "",
category:vendorItem?.category || "",
location:vendorItem?.address || "",
phone:vendorItem?.mobile_number || "",
email:vendorItem?.email || "",
sales_id:vendorItem?.sales_id || "",
status:vendorItem?.status || "Active"

});



const update=(key,value)=>{

setForm({

...form,

[key]:value

});

};




const enable =

form.name &&
form.category &&
form.location &&
form.phone &&
form.email &&
form.sales_id;



const createVendor=()=>{


addVendor({
  vendor_id: vendorItem?.vendor_id || `VEN${Date.now()}`,
  business_name: form.name,
  owner_name: form.name,
  category: form.category,
  mobile_number: form.phone,
  email: form.email,
  sales_id: form.sales_id,
  address: form.location,
  status: form.status
});


};





return (

<div id="create-vendor-form" className="
bg-white
rounded-lg
mt-2
p-5
">


<div className="
flex
items-center
gap-2
border-b
pb-3
">


<Store size={16}/>


<h2 className="
text-xs
font-bold
text-[#B97943]
">

{vendorItem ? "EDIT VENDOR" : "CREATE VENDOR"}

</h2>


</div>





<div className="
grid
grid-cols-2
gap-5
mt-2
">


<Input

icon={<Store size={14}/>}

label="Vendor Name"

placeholder="Enter Vendor Name"

value={form.name}

change={(v)=>update("name",v)}

/>



<Input

icon={<UserRound size={14}/>}

label="Category"

placeholder="Pharmacy"

value={form.category}

change={(v)=>update("category",v)}

/>




<Input

icon={<MapPin size={14}/>}

label="Location"

placeholder="Kadapa"

value={form.location}

change={(v)=>update("location",v)}

/>




<Input

icon={<Phone size={14}/>}

label="Phone"

placeholder="Enter Phone"

value={form.phone}

change={(v)=>update("phone",v)}

/>




<Input

icon={<Mail size={14}/>}

label="Email"

placeholder="Enter Email"

value={form.email}

change={(v)=>update("email",v)}

/>

<Input

icon={<UserRound size={14}/>}

label="Sales ID"

placeholder="Assigned Sales ID"

value={form.sales_id}

change={(v)=>update("sales_id",v)}

/>



</div>





<div className="mt-2">


<label className="text-[10px]">

Status

</label>



<div className="
flex
gap-5
text-xs
mt-2
">


<label>

<input

type="radio"

checked={form.status==="Active"}

onChange={()=>update("status","Active")}

/>

 Active

</label>



<label>

<input

type="radio"

checked={form.status==="Inactive"}

onChange={()=>update("status","Inactive")}

/>

 Inactive

</label>



</div>


</div>







<div className="
flex
justify-end
gap-3
mt-4
">


<button

onClick={close}

className="
border
px-5
py-2
rounded
text-xs
"

>

Cancel

</button>




<button

disabled={!enable}

onClick={createVendor}

className={`
px-5
py-2
rounded
text-xs
text-white
${enable
?"bg-[#172033]"
:"bg-gray-400"}
`}

>

{vendorItem ? "Save Vendor" : "Create Vendor"}

</button>


</div>



</div>

);


}







function Input({

icon,
label,
placeholder,
value,
change

}){


return (

<div>


<label className="
text-[10px]
">

{label}

</label>



<div className="
mt-1
border
border-[#172033]
rounded
h-8
flex
items-center
gap-2
px-2
">


<span className="text-gray-400">

{icon}

</span>



<input

value={value}

onChange={(e)=>change(e.target.value)}

placeholder={placeholder}

className="
outline-none
text-[10px]
w-full
"

/>



</div>



</div>


);


}
