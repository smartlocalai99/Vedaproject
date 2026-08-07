  /* eslint-disable react-hooks/set-state-in-effect */
  import { useEffect, useState } from "react";
  import { useRouter } from "next/router";

  import SuperAdminFooter from "@/components/SuperAdminFooter";
  import { supabase } from "@/lib/supabase";

  import {
    ArrowLeft,
    Plus,
    Pencil,
    Search,
    UserRound,
    Phone,
    Mail,
    Lock,
    MapPin,
  } from "lucide-react";


  export default function Sales(){


  const router = useRouter();


  const [create,setCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const [sales,setSales] = useState([]);

  const [search,setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSales = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("sales_executives").select("*").order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setSales(data || []);
    setLoading(false);
  };

  useEffect(() => { loadSales(); }, []);

  const deleteSales = async (id) => {
    if (!window.confirm("Delete this sales executive?")) return;
    const { error: deleteError } = await supabase.from("sales_executives").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else loadSales();
  };



  const filteredSales = sales.filter((item)=>

  item.full_name
  .toLowerCase()
  .includes(search.toLowerCase())

  );



  return(

  <div
  className="
  min-h-screen
  bg-[#F8F4EE]
  text-[#1B2232]
  p-5
  pb-20
  "
  >


  {/* HEADER */}


  <div
  className="
  flex
  justify-between
  items-center
  "
  >



  <div
  className="
  flex
  items-center
  gap-2
  "
  >


  <button

  onClick={()=>router.push("/")}

  className="
  w-7
  h-7
  rounded
  flex
  items-center
  justify-center
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

  Sales Management

  </h1>


  <p className="
  text-[10px]
  text-gray-500
  ">

  Manage your sales executives and activities.

  </p>


  </div>


  </div>





  <button

  onClick={()=>{ setEditing(null); setCreate(true); setTimeout(() => document.getElementById("create-sales-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }}
  type="button"

  className="
  bg-[#172033]
  text-white
  text-xs
  px-3
  py-2
  rounded-md
  flex
  items-center
  gap-2
  "

  >


  <Plus size={14}/>

  Add Sales

  </button>


  </div>





  {/* SEARCH */}


  <div
  className="
  bg-white
  rounded-lg
  mt-2
  p-3
  flex
  items-center
  gap-2
  shadow-sm
  "
  >


  <Search
  size={15}
  className="text-gray-400"
  />


  <input

  value={search}

  onChange={(e)=>setSearch(e.target.value)}

  placeholder="Search sales executive..."

  className="
  outline-none
  text-xs
  w-full
  "

  />


  </div>
  {/* SALES LIST */}

  {loading && <p className="mt-2 text-xs text-gray-500">Loading sales executives...</p>}
  {error && <p className="mt-2 text-xs text-red-600">{error}</p>}


  <div
  className="
  mt-2
  space-y-3
  "
  >


  {
  filteredSales.map((item,index)=>(


  <div

  key={item.id}

  className="
  bg-white
  rounded-xl
  p-4
  shadow-sm
  "

  >


  <div
  className="
  flex
  justify-between
  items-start
  "
  >


  <div
  className="
  flex
  gap-3
  items-center
  "
  >


  <div
  className="
  w-10
  h-10
  rounded-full
  bg-[#172033]
  text-white
  flex
  items-center
  justify-center
  text-sm
  font-bold
  "
  >

  {item.full_name.charAt(0)}

  </div>



  <div>


  <h3
  className="
  text-xs
  font-bold
  "
  >

  {item.full_name}

  </h3>


  <p
  className="
  text-[10px]
  text-gray-500
  "
  >

  {item.assigned_area}

  </p>


  </div>


  </div>





  <button

  onClick={() => { setEditing(item); setCreate(true); setTimeout(() => document.getElementById("create-sales-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }}
  type="button"

  className="
  border
  rounded
  px-3
  py-1
  text-[10px]
  flex
  items-center
  gap-1
  "

  >

  <Pencil size={11}/>

  Edit

  </button>

  <button onClick={() => deleteSales(item.id)} className="border rounded px-3 py-1 text-[10px]">
  Delete
  </button>


  </div>





  <div
  className="
  mt-2
  grid
  grid-cols-2
  gap-3
  text-[10px]
  "
  >


  <div
  className="
  flex
  items-center
  gap-2
  "
  >

  <Phone size={12}/>

  {item.mobile_number}

  </div>



  <div
  className="
  flex
  items-center
  gap-2
  "
  >

  <Mail size={12}/>

  {item.email}

  </div>


  </div>





  <div
  className="
  mt-2
  "
  >


  <span

  className={`

  px-3
  py-1
  rounded-full
  text-[10px]

  ${
  item.status==="Active"

  ?

  "bg-green-100 text-green-700"

  :

  "bg-red-100 text-red-700"

  }

  `}

  >

  {item.status}

  </span>


  </div>



  </div>


  ))


  }


  </div>







  {/* CREATE SALES */}


  {

  create &&


  <CreateSales

  close={()=>setCreate(false)}

  salesItem={editing}


  addSales={async (data)=>{
    setError("");
    const { error: insertError } = editing
      ? await supabase.from("sales_executives").update(data).eq("id", editing.id)
      : await supabase.from("sales_executives").insert(data);
    if (insertError) { setError(insertError.message); return; }
    setCreate(false);
    loadSales();
  }}


  />


  }



  <SuperAdminFooter />


  </div>


  )

  }







  function CreateSales({close,addSales,salesItem}){


  const [form,setForm]=useState({

  id:salesItem?.employee_id || "",
  password:salesItem?.password || "",
  name:salesItem?.full_name || "",
  confirm:salesItem?.password || "",
  phone:salesItem?.mobile_number || "",
  area:salesItem?.assigned_area || "",
  email:salesItem?.email || "",
  status:salesItem?.status || "Active"

  });



  const update=(key,value)=>{


  setForm({

  ...form,

  [key]:value

  });


  };



  const enable =

  form.id &&
  form.password &&
  form.name &&
  form.confirm &&
  form.phone &&
  form.area &&
  form.email;





  const createSales=()=>{


  if (form.password !== form.confirm) return;
  addSales({
    employee_id: form.id,
    password: form.password,
    full_name: form.name,
    mobile_number: form.phone,
    assigned_area: form.area,
    email: form.email,
    status: form.status
  });


  };



  return(

  <div

  id="create-sales-form"
  className="
  bg-white
  rounded-xl
  mt-2  
  p-5
  shadow-sm
  "

  >


  <div
  className="
  flex
  items-center
  gap-2
  border-b
  pb-3
  "
  >


  <UserRound size={16}/>


  <h2
  className="
  text-xs
  font-bold
  text-[#B97943]
  "
  >

  {salesItem ? "EDIT SALES EXECUTIVE" : "CREATE SALES EXECUTIVE"}

  </h2>


  </div>





  <div
  className="
  grid
  grid-cols-2
  gap-4
  mt-2  
  "
  >
    <Input

  icon={<UserRound size={14}/>}

  label="Employee ID"

  value={form.id}

  change={(v)=>update("id",v)}

  placeholder="Enter Employee ID"

  />



  <Input

  icon={<Lock size={14}/>}

  label="Password"

  value={form.password}

  change={(v)=>update("password",v)}

  placeholder="Enter Password"

  />



  <Input

  icon={<UserRound size={14}/>}

  label="Full Name"

  value={form.name}

  change={(v)=>update("name",v)}

  placeholder="Enter Full Name"

  />



  <Input

  icon={<Lock size={14}/>}

  label="Confirm Password"

  value={form.confirm}

  change={(v)=>update("confirm",v)}

  placeholder="Confirm Password"

  />



  <Input

  icon={<Phone size={14}/>}

  label="Mobile Number"

  value={form.phone}

  change={(v)=>update("phone",v)}

  placeholder="Enter Mobile Number"

  />



  <Input

  icon={<MapPin size={14}/>}

  label="Assigned Area"

  value={form.area}

  change={(v)=>update("area",v)}

  placeholder="Enter Area"

  />



  <Input

  icon={<Mail size={14}/>}

  label="Email Address"

  value={form.email}

  change={(v)=>update("email",v)}

  placeholder="Enter Email"

  />





  {/* STATUS */}


  <div>


  <label
  className="
  text-[10px]
  "
  >

  Status

  </label>



  <div
  className="
  flex
  gap-5
  mt-2
  text-xs
  "
  >


  <label>


  <input

  type="radio"

  name="status"

  checked={form.status==="Active"}

  onChange={()=>update("status","Active")}

  />


  Active

  </label>




  <label>


  <input

  type="radio"

  name="status"

  checked={form.status==="Inactive"}

  onChange={()=>update("status","Inactive")}

  />


  Inactive

  </label>


  </div>


  </div>



  </div>






  {/* BUTTONS */}



  <div
  className="
  flex
  justify-end
  gap-3
  mt-4
  "
  >


  <button

  type="button"
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

  type="button"
  disabled={!enable}

  onClick={createSales}

  className={`

  px-4
  py-2
  rounded
  text-xs
  text-white

  ${
  enable

  ?

  "bg-[#172033]"

  :

  "bg-gray-400 cursor-not-allowed"

  }

  `}

  >

  {salesItem ? "Save Sales" : "Create Sales"}

  </button>


  </div>



  </div>


  )

  }







  function Input({

  icon,

  label,

  placeholder,

  value,

  change

  }){


  return(


  <div>


  <label
  className="
  text-[10px]
  "
  >

  {label}

  </label>




  <div
  className="
  mt-1
  border
  border-[#172033]
  rounded
  h-9
  flex
  items-center
  gap-2
  px-2
  "
  >


  <span
  className="
  text-gray-400
  "
  >

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


  )

}






  
