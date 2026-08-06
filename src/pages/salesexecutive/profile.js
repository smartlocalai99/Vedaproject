import {
  ArrowLeft,
  Pencil,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Camera,
} from "lucide-react";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";

export default function Profile() {

  const router = useRouter();

  const defaultProfile = {
    name: "Rahul Kumar",
    designation: "Sales Executive",
    employeeId: "VEDA001",
    mobile: "+91 9876543210",
    email: "rahul@vedaminds.com",
    joiningDate: "01 Jan 2025",
    address: "Madhapur,\nHyderabad,\nTelangana - 500081",
    image: "",
  };


  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);


  useEffect(() => {

    const saved = localStorage.getItem("employeeProfile");

    if(saved){
      setProfile(JSON.parse(saved));
    }

  }, []);



  const updateField = (field,value)=>{

    setProfile({
      ...profile,
      [field]:value
    });

  };


  const saveProfile = ()=>{

    localStorage.setItem(
      "employeeProfile",
      JSON.stringify(profile)
    );

    setEditMode(false);

  };



  const uploadImage=(e)=>{

    const file=e.target.files[0];

    if(file){

      const reader=new FileReader();

      reader.onload=()=>{

        updateField(
          "image",
          reader.result
        );

      };

      reader.readAsDataURL(file);

    }

  };



  const logout=()=>{

    localStorage.removeItem("employeeProfile");

    router.push("/login");

  };




return (

<div className="min-h-screen bg-[#F7F7F7]">


{/* Header */}

<div className="bg-[#121826] rounded-b-[35px] px-6 pt-4 pb-6">


<div className="flex justify-between">

<button
onClick={()=>router.back()}
className="text-white"
>
<ArrowLeft size={28}/>
</button>


<button
onClick={()=>setEditMode(!editMode)}
className="text-white"
>
<Pencil size={24}/>
</button>


</div>



<div className="flex items-center mt-10">


<div className="relative">


<div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden">


{
profile.image ?

<img
src={profile.image}
className="w-full h-full object-cover"
/>

:

<User
size={50}
className="text-[#9A6236]"
/>

}



</div>



{
editMode &&

<label className="absolute bottom-0 right-0 bg-[#9A6236] p-2 rounded-full cursor-pointer">

<Camera
size={18}
className="text-white"
/>


<input
type="file"
accept="image/*"
className="hidden"
onChange={uploadImage}
/>

</label>

}



</div>



<div className="ml-5">


{
editMode ?

<input
value={profile.name}
onChange={(e)=>updateField("name",e.target.value)}
className="text-2xl font-bold bg-transparent text-white border-b"
/>

:

<h1 className="text-white text-3xl font-bold">
{profile.name}
</h1>

}


{
editMode ?

<input
value={profile.designation}
onChange={(e)=>updateField("designation",e.target.value)}
className="text-gray-300 mt-2 bg-transparent border-b"
/>

:

<p className="text-gray-300 text-lg mt-1">
{profile.designation}
</p>

}



</div>


</div>

</div>





<div className="px-6 py-8">


<h2 className="text-3xl font-bold mb-5">
Employee Details
</h2>




<Detail
icon={<ShieldCheck/>}
title="Employee ID"
value={profile.employeeId}
editMode={false}
/>



<Detail
icon={<Briefcase/>}
title="Designation"
value={profile.designation}
editMode={editMode}
change={(v)=>updateField("designation",v)}
/>




<Detail
icon={<Phone/>}
title="Mobile Number"
value={profile.mobile}
editMode={editMode}
change={(v)=>updateField("mobile",v)}
/>




<Detail
icon={<Mail/>}
title="Email"
value={profile.email}
editMode={editMode}
change={(v)=>updateField("email",v)}
/>




<Detail
icon={<Calendar/>}
title="Joining Date"
value={profile.joiningDate}
editMode={editMode}
change={(v)=>updateField("joiningDate",v)}
/>




<div className="flex justify-between mb-5">

<div className="flex gap-4">

<MapPin className="text-[#9A6236]"/>

<span className="text-xl text-gray-600">
Address
</span>

</div>



{
editMode ?

<textarea
value={profile.address}
onChange={(e)=>updateField("address",e.target.value)}
className="border rounded-lg p-2 w-52"
/>

:

<span className="text-xl font-bold text-right whitespace-pre-line">
{profile.address}
</span>

}



</div>




<hr className="my-6"/>




<button className="w-full bg-white border rounded-2xl px-5 py-5 flex justify-between items-center shadow-sm">


<div className="flex gap-4 items-center">

<Phone
className="text-[#9A6236]"
size={30}
/>

<span className="text-xl font-bold">
Contact Admin
</span>

</div>


<ChevronRight/>

</button>




{
editMode &&

<button
onClick={saveProfile}
className="w-full mt-5 bg-green-600 text-white rounded-2xl py-4 text-lg font-semibold"
>
Save Changes
</button>

}




<button
onClick={logout}
className="w-full mt-5 bg-red-600 text-white rounded-2xl py-4 text-lg font-semibold"
>

Logout

</button>



</div>


<Footer/>


</div>

);

}





function Detail({
icon,
title,
value,
editMode,
change
}){


return (

<div className="flex justify-between items-center mb-5">


<div className="flex items-center gap-4">

<span className="text-[#9A6236]">
{icon}
</span>

<span className="text-xl text-gray-600">
{title}
</span>


</div>



{

editMode ?

<input
value={value}
onChange={(e)=>change(e.target.value)}
className="border rounded-lg px-2 py-1 w-52"
/>


:

<span className="text-xl font-bold">
{value}
</span>

}


</div>


)

}