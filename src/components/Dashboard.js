import {
  UserRound,
  Store,
  Users,
  FileText,
  IndianRupee,
  UserPlus,
} from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SuperAdminFooter from "@/components/SuperAdminFooter";

export default function Dashboard() {

  const router = useRouter();
  const [stats, setStats] = useState({ sales: 0, vendors: 0, members: 0, transactions: 0, benefits: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const [sales, vendors, members, transactions, benefits] = await Promise.all([
        supabase.from("sales_executives").select("id", { count: "exact", head: true }),
        supabase.from("vendors").select("id", { count: "exact", head: true }),
        supabase.from("members").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("benefit_amount"),
      ]);
      const queryError = sales.error || vendors.error || members.error || transactions.error || benefits.error;
      if (queryError) setError(queryError.message);
      else setStats({ sales: sales.count || 0, vendors: vendors.count || 0, members: members.count || 0, transactions: transactions.count || 0, benefits: (benefits.data || []).reduce((total, item) => total + Number(item.benefit_amount || 0), 0) });
      setLoading(false);
    }
    loadDashboard();
  }, []);


  return (

    <main className="
    bg-[#F8F4EE]
    min-h-screen
    mx-auto
    pb-10
    ">


      {/* Header */}

      <div className="
      h-16
      bg-[#111827]
      px-4
      flex
      items-center
      gap-3
      ">


        <Image
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="object-contain"
        />


        <div>

          <h1 className="text-white text-sm font-bold">
            VEDA MINDS
          </h1>


          <p className="text-[10px] text-[#D6A15E]">
            SUPER ADMIN
          </p>

        </div>


      </div>







      {/* Title */}

      <div className="px-3 pt-3">

      </div>







{/* Stats */}

<div className="
px-3
mt-2
grid
grid-cols-2
gap-2
">


  <Stat
    icon={<UserRound size={18}/>}
    title="Total Sales
    Executives"
    value={loading ? "..." : stats.sales}
  />


  <Stat
    icon={<Store size={18}/>}
    title="Total Vendors"
    value={loading ? "..." : stats.vendors}
  />


  <Stat
    icon={<Users size={18}/>}
    title="Total Members"
    value={loading ? "..." : stats.members}
  />


  <Stat
    icon={<FileText size={18}/>}
    title="Total Transactions"
    value={loading ? "..." : stats.transactions}
  />


  <Stat
    icon={<IndianRupee size={18}/>}
    benefitValue={loading ? "..." : `₹${stats.benefits.toLocaleString("en-IN")}`}
    title="Total Benefits Given"
    value="₹45,680"
  />


</div>









      {/* Quick Actions */}

      <div className="
      px-3
      mt-5
      ">


        <h3 className="
        text-sm
        font-bold
        mb-2
        ">
          Quick Actions
        </h3>






        {/* SALES */}

        <button

        onClick={()=>router.push("/sales")}

        className="
        w-full
        bg-[#172033]
        text-white
        rounded-lg
        p-3
        flex
        justify-between
        items-center
        mb-2
        "

        >


          <div className="
          flex
          gap-3
          items-center
          ">


            <UserPlus size={20}/>



            <div className="text-left">


              <p className="
              text-xs
              font-semibold
              ">
                Add Sales Executive
              </p>


              <span className="
              text-[10px]
              text-gray-300
              ">
                Create new sales user
              </span>


            </div>


          </div>



          <span>
            ›
          </span>


        </button>









        {/* VENDOR */}


        <button

        onClick={()=>router.push("/vendors")}

        className="
        w-full
        bg-[#B97943]
        text-white
        rounded-lg
        p-3
        flex
        justify-between
        items-center
        "

        >


          <div className="
          flex
          gap-3
          items-center
          ">


            <Store size={20}/>



            <div className="text-left">


              <p className="
              text-xs
              font-semibold
              ">
                Add Vendor
              </p>



              <span className="
              text-[10px]
              ">
                Create vendor account
              </span>


            </div>


          </div>



          <span>
            ›
          </span>


        </button>



      </div>



    </main>

  );
}









function Stat({icon,title,value,benefitValue}){


return(

<div
className="
bg-white
rounded-lg
p-3
flex
items-center
justify-between
shadow-sm
"
>


<div className="
flex
items-center
gap-3
">


<div
className="
w-8
h-8
rounded-full
bg-[#F3E8DA]
flex
items-center
justify-center
text-[#B97943]
"
>

{icon}

</div>



<p className="
text-xs
text-[#1B2232]
">
{title}
</p>


</div>





<p className="
font-bold
text-sm
">
{benefitValue || value}
</p>


<SuperAdminFooter />
</div>

)

}
