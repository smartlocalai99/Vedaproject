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

import { useState } from "react";
import { useRouter } from "next/router";
import SuperAdminFooter from "@/components/SuperAdminFooter";


const initialVendors=[

{
name:"Apollo Medical Store",
category:"Pharmacy",
location:"Kadapa",
phone:"9876543210",
status:"Active"
},

{
name:"Sri Lakshmi Restaurant",
category:"Restaurant",
location:"Kadapa",
phone:"9988776655",
status:"Active"
},

{
name:"Fashion Hub",
category:"Clothing",
location:"Kadapa",
phone:"9123456789",
status:"Inactive"
}

];



export default function Vendors(){


const router = useRouter();


const [vendors,setVendors]=useState(initialVendors);

const [create,setCreate]=useState(false);



return(

<main className="
bg-[#F8F4EE]
min-h-screen
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

<h1 className="font-bold text-sm">
Vendors
</h1>


<p className="text-[10px] text-gray-500">
Manage all vendors
</p>


</div>


</div>




<button

onClick={()=>setCreate(true)}

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
mt-5
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

className="
outline-none
text-xs
w-full
"

/>


</div>







{/* VENDOR LIST */}


<div className="
mt-4
space-y-3
">


{
vendors.map((vendor,index)=>(


<div

key={index}

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

{vendor.name}

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

{vendor.location}

</p>


</div>


</div>






<span className="
text-[10px]
flex
items-center
gap-1
">


<span className={`
w-2
h-2
rounded-full
${
vendor.status==="Active"
?
"bg-green-500"
:
"bg-red-500"
}
`}/>


<span className={

vendor.status==="Active"
?
"text-green-700"
:
"text-red-600"

}>

{vendor.status}

</span>


</span>



</div>


</div>



))

}



</div>







{/* CREATE FORM */}

{

create &&


<CreateVendor

close={()=>setCreate(false)}

addVendor={(data)=>{

setVendors([...vendors,data]);

setCreate(false);

}}

/>


}



</main>


)

}








function CreateVendor({close,addVendor}){


const [form,setForm]=useState({

name:"",
category:"",
location:"",
phone:"",
email:"",
status:"Active"

});



const update=(key,value)=>{

setForm({

...form,

[key]:value

})

}



const enable=

form.name &&
form.category &&
form.location &&
form.phone &&
form.email;



const createVendor=()=>{


addVendor({

name:form.name,

category:form.category,

location:form.location,

phone:form.phone,

status:form.status

})


};




return(

<div className="
bg-white
rounded-lg
mt-5
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

CREATE VENDOR

</h2>


</div>






<div className="
grid
grid-cols-2
gap-5
mt-6
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




<div>

<label className="text-[10px]">
Status
</label>


<div className="flex gap-5 mt-2 text-xs">


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







<div className="
flex
justify-end
gap-3
mt-6
">


<button

onClick={close}

className="
border
px-5
py-2
rounded
text-xs
">

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
${
enable
?
"bg-[#172033]"
:
"bg-gray-400 cursor-not-allowed"
}
`}

>

Create Vendor

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

<label className="text-[10px]">
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

 <SuperAdminFooter />
</div>

)

}