import { useState } from "react";

import { useRouter } from "next/router";
import SuperAdminFooter from "@/components/SuperAdminFooter";
import {
  ArrowLeft,
  Plus,
  Pencil,
  UserRound,
  Phone,
  Mail,
  Lock,
  MapPin,
} from "lucide-react";


const initialSales = [
  {
    name:"Rahul Kumar",
    phone:"9876543210",
    area:"Hyderabad",
    status:"Active"
  },
  {
    name:"Priya Reddy",
    phone:"9988776655",
    area:"Kadapa",
    status:"Active"
  },
  {
    name:"Arjun Sharma",
    phone:"9123456789",
    area:"Vijayawada",
    status:"Active"
  }
];


export default function Sales(){
    const router = useRouter();

const [create,setCreate] = useState(false);

const [sales,setSales] = useState(initialSales);


return(

<div className="
min-h-screen
bg-[#F8F4EE]
text-[#1B2232]
p-5
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

<h1 className="font-bold text-sm">
Sales Management
</h1>


<p className="text-[10px] text-gray-500">
Manage your sales executives and their activities.
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
gap-2
items-center
"

>

<Plus size={14}/>

Add Sales Executive

</button>


</div>





{/* SALES TABLE */}


<div
className="
bg-white
rounded-lg
mt-5
p-3
shadow-sm
"
>


<table className="w-full text-xs">


<thead>

<tr className="border-b text-gray-500">


<th className="text-left p-3">
Name
</th>

<th>
Phone
</th>

<th>
Area
</th>

<th>
Status
</th>

<th>
Action
</th>


</tr>


</thead>



<tbody>


{
sales.map((item,index)=>(


<tr
key={index}
className="border-b last:border-0"
>


<td className="
p-3
flex
items-center
gap-2
">


<div
className="
w-7
h-7
rounded-full
bg-[#172033]
text-white
flex
items-center
justify-center
text-[10px]
"
>

{item.name[0]}

</div>


{item.name}


</td>



<td>
{item.phone}
</td>


<td>
{item.area}
</td>



<td>

<span
className={`
px-2
py-1
rounded
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

</td>



<td>


<button
className="
border
rounded
px-3
py-1
text-[10px]
flex
gap-1
items-center
"
>

<Pencil size={11}/>

Edit

</button>


</td>


</tr>


))

}


</tbody>


</table>


</div>






{/* CREATE FORM */}

{

create &&

<CreateSales

close={()=>setCreate(false)}

addSales={(data)=>{

setSales([...sales,data]);

setCreate(false);

}}

/>

}



</div>

)

}









function CreateSales({close,addSales}){


const [form,setForm]=useState({

id:"",
password:"",
name:"",
confirm:"",
phone:"",
area:"",
email:"",
status:"Active"

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


addSales({

name:form.name,

phone:form.phone,

area:form.area,

status:form.status

});


};



return(

<div
className="
bg-white
rounded-lg
mt-5
p-5
"
>



<div className="
flex
items-center
gap-2
border-b
pb-3
">


<UserRound size={16}/>


<h2 className="
text-xs
font-bold
text-[#B97943]
">

CREATE SALES EXECUTIVE

</h2>


</div>





<div className="
grid
grid-cols-2
gap-5
mt-6
">


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
placeholder="Hyderabad"
/>



<Input
icon={<Mail size={14}/>}
label="Email Address"
value={form.email}
change={(v)=>update("email",v)}
placeholder="Enter Email Address"
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
"

>

Cancel

</button>



<button

disabled={!enable}

onClick={createSales}

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

Create Sales

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