import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import {
  Bell,
  Users,
  Store,
  Gift,
  ClipboardList,
  Plus,
} from "lucide-react";


export default function Dashboard() {
  const router = useRouter();
 
  // Greeting based on current time
  const [greeting, setGreeting] = useState("Welcome 👋");

useEffect(() => {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    setGreeting("Good Morning 🌅");
  } else if (currentHour >= 12 && currentHour < 17) {
    setGreeting("Good Afternoon ☀️");
  } else if (currentHour >= 17 && currentHour < 21) {
    setGreeting("Good Evening 🌇");
  } else {
    setGreeting("Good Night 🌙");
  }
}, []);

  const stats = [
    {
      title: "Total Vendors Added",
      value: "06",
      subtitle: "Today",
      icon: Store,
      color: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Total Members Added",
      value: "18",
      subtitle: "Today",
      icon: Users,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Transactions",
      value: "24",
      subtitle: "This Month",
      icon: ClipboardList,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Benefits Given",
      value: "₹12,450",
      subtitle: "This Month",
      icon: Gift,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fb]">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>

          </div>

          <div className="relative cursor-pointer">

            <Bell className="w-7 h-7 text-gray-700" />

            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
              3
            </span>

          </div>

        </div>
      </header>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Greeting */}
        <div className="mb-8">

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
  {greeting}
</h2>



        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">

                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${item.color}`}
                  >
                    <Icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>

                  <div>

                    <p className="text-gray-500 text-sm">
                      {item.title}
                    </p>

                    <h3 className="text-2xl font-bold">
                      {item.value}
                    </h3>

                    <p className="text-xs text-gray-400">
                      {item.subtitle}
                    </p>

                  </div>

                </div>
              </div>
            );
          })}

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

          <div className="bg-[#13273c] rounded-2xl p-4 text-white">

            <div
    onClick={() => router.push("/salesexecutive/vendor")}
  className="bg-[#13273c] rounded-2xl p-4 text-white cursor-pointer hover:scale-[1.02] transition-all duration-300"
>
  <div className="flex items-center gap-5">

    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
      <Plus className="w-8 h-8 text-white" />
    </div>

    <div>
      <h2 className="text-2xl font-semibold">
        Add Vendor
      </h2>

      <p className="text-gray-300 mt-1 text-sm">
        Register a new vendor into the system.
      </p>
    </div>

  </div>
</div>
</div>

         <div
  onClick={() => router.push("/salesexecutive/member")}
  className="bg-[#b56a38]  rounded-2xl p-6 text-white cursor-pointer hover:scale-[1.02] transition duration-300"
>

            <div className="flex items-center gap-5">

              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>

              <div>

                <h2 className="text-2xl font-semibold">
                  Add Member
                </h2>

                <p className="text-orange-100 mt-2">
                  Register a new member quickly.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
<Footer />
    </div>
    
  );
}