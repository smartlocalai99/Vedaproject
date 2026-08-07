
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

import {
  Users,
  Store,
  Gift,
  ClipboardList,
  Plus,
} from "lucide-react";


export default function Dashboard() {

  const router = useRouter();
  const [statsData, setStatsData] = useState({ vendors: 0, members: 0 });
  const [name, setName] = useState("Sales Executive");

  useEffect(() => {
    const saved = localStorage.getItem("salesExecutiveSession");
    if (!saved) { router.replace("/salesexecutive/login"); return; }
    const session = JSON.parse(saved);
    setName(session.full_name || "Sales Executive");
    async function loadStats() {
      const [vendors, members] = await Promise.all([
        supabase.from("vendors").select("id", { count: "exact", head: true }).eq("sales_id", session.id),
        supabase.from("members").select("id", { count: "exact", head: true }).eq("sales_id", session.id),
      ]);
      setStatsData({ vendors: vendors.count || 0, members: members.count || 0 });
    }
    loadStats();
  }, [router]);


  const stats = [

    {
      title:"Total Vendors Added",
      value:String(statsData.vendors).padStart(2, "0"),
      subtitle:"Today",
      icon:Store,
      color:"bg-orange-100",
      iconColor:"text-orange-600",
    },


    {
      title:"Total Members Added",
      value:String(statsData.members).padStart(2, "0"),
      subtitle:"Today",
      icon:Users,
      color:"bg-blue-100",
      iconColor:"text-blue-600",
    },


    {
      title:"Vendor Count",
      value:String(statsData.vendors).padStart(2, "0"),
      subtitle:"All time",
      icon:ClipboardList,
      color:"bg-green-100",
      iconColor:"text-green-600",
    },


    {
      title:"Member Count",
      value:"₹12,450",
      subtitle:"This Month",
      icon:Gift,
      color:"bg-purple-100",
      iconColor:"text-purple-600",
    },


  ];



return (

<div
className="
min-h-screen
bg-[#F8F4EE]
pb-20
"
>


{/* HEADER */}

<header
className="
bg-white
px-5
py-4
flex
justify-between
items-center

"
>


<div>

<h1
className="
text-m
font-bold
text-[#172033]
"
>

Dashboard

</h1>


{/* <p
className="
text-xs
text-gray-500
"
>

Welcome {name}

</p> */}


</div>




</header>





{/* CONTENT */}

<p
className="
text-lg
text-black
font-bold
ml-5 mt-3
"
>

Welcome {name}

</p>
<div
className="
p-4
"
>



{/* STATS */}


<div
className="
grid
grid-cols-2
gap-3
"
>


{
stats.map((item,index)=>{


const Icon=item.icon;


return(

<div

key={index}

className="
bg-white
rounded-m
p-2
"

>


<div
className="
flex
items-center
gap-3
"
>


<div>


<Icon
size={20}
className={item.iconColor}
/>


</div>




<div>


<p
className="
text-xs
text-gray-500
"
>

{item.title}

</p>


<h2
className="
text-xs
font-bold
"
>

{item.title === "Member Count" ? String(statsData.members).padStart(2, "0") : item.value}

</h2>


<p
className="
text-[9px]
text-gray-400
"
>

{item.subtitle}

</p>


</div>


</div>


</div>


)


})

}


</div>






{/* QUICK ACTIONS */}


<div
className="
mt-5
space-y-4
"
>





{/* ADD VENDOR */}


<div

onClick={()=>router.push("/salesexecutive/vendor")}

className="
bg-[#172033]
rounded-xl
p-5
text-white
cursor-pointer
"

>


<div
className="
flex
items-center
gap-4
"
>


<div
className="
w-8
h-8
rounded-full
bg-white/10
flex
items-center
justify-center
"
>


<Plus size={22}/>


</div>




<div>


<h2
className="
font-bold
text-sm
"
>

Add Vendor

</h2>


<p
className="
text-xs
text-gray-300
mt-1
"
>

Register new vendor

</p>


</div>


</div>


</div>






{/* ADD MEMBER */}



<div

onClick={()=>router.push("/salesexecutive/member")}

className="
bg-[#B97943]
rounded-xl
p-5
text-white
cursor-pointer
"

>


<div
className="
flex
items-center
gap-4
"
>


<div
className="
w-8
h-8
rounded-full
bg-white/10
flex
items-center
justify-center
"
>


<Plus size={26}/>


</div>




<div>


<h2
className="
font-bold
text-sm
"
>

Add Member

</h2>


<p
className="
text-xs
text-orange-100
mt-1
"
>

Register new member

</p>


</div>


</div>


</div>



</div>



</div>




<Footer />


</div>


)

}
