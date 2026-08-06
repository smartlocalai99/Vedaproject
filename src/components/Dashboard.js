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


export default function Dashboard() {

  const router = useRouter();


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

        <h2 className="
        text-sm
        font-bold
        text-[#1B2232]
        ">
          Dashboard
        </h2>

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
    title="Total Sales Executives"
    value="12"
  />


  <Stat
    icon={<Store size={18}/>}
    title="Total Vendors"
    value="145"
  />


  <Stat
    icon={<Users size={18}/>}
    title="Total Members"
    value="1,286"
  />


  <Stat
    icon={<FileText size={18}/>}
    title="Total Transactions"
    value="3,562"
  />


  <Stat
    icon={<IndianRupee size={18}/>}
    title="Total Turnover"
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









function Stat({icon,title,value}){


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
{value}
</p>



</div>

)

}