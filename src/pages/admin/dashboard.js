



// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import {
//   LayoutDashboard,
//   Store,
//   Users,
//   UserCog,
//   Receipt,
//   LogOut,
//   Menu,
//   X,
//   UserCircle,
//   ShieldCheck,
//   TrendingUp,
//   ChevronRight,
// } from "lucide-react";

// export default function AdminDashboard() {
//   const router = useRouter();

//   const [admin, setAdmin] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     if (!router.isReady) return;

//     // Read Admin session
//     const session = localStorage.getItem("adminSession");

//     if (!session) {
//       router.replace("/admin/login");
//       return;
//     }

//     try {
//       const parsedSession = JSON.parse(session);

//       // Only Admin can access this dashboard
//       if (
//         !parsedSession ||
//         parsedSession.id !== "admin" ||
//         parsedSession.role !== "admin"
//       ) {
//         localStorage.removeItem("adminSession");
//         router.replace("/admin/login");
//         return;
//       }

//       setAdmin(parsedSession);
//       setLoading(false);
//     } catch (error) {
//       console.error("Invalid admin session");

//       localStorage.removeItem("adminSession");
//       router.replace("/admin/login");
//     }
//   }, [router.isReady]);

//   const handleLogout = () => {
//     localStorage.removeItem("adminSession");
//     setAdmin(null);
//     router.replace("/admin/login");
//   };

//   const closeSidebar = () => {
//     setSidebarOpen(false);
//   };

//   if (loading) {
//     return (
//       <main className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
//         <div className="text-center">
//           <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#172033]" />
//           <p className="mt-4 text-sm text-gray-500">
//             Loading Admin Dashboard...
//           </p>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F7F7F7]">
//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/40 lg:hidden"
//           onClick={closeSidebar}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-[#E9E2DC] bg-white transition-transform duration-300 lg:translate-x-0 ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         {/* Logo */}
//         <div className="flex h-20 items-center justify-between border-b border-[#E9E2DC] px-5">
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033]">
//               <ShieldCheck size={24} className="text-white" />
//             </div>

//             <div>
//               <h1 className="font-bold text-[#172033]">VEDA MINDS</h1>
//               <p className="text-xs text-gray-500">Admin Panel</p>
//             </div>
//           </div>

//           <button
//             onClick={closeSidebar}
//             className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="p-4">
//           <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
//             Main Menu
//           </p>

//           <div className="space-y-1">
//             <button
//               className="flex w-full items-center gap-3 rounded-xl bg-[#172033] px-4 py-3 text-left font-medium text-white"
//               onClick={closeSidebar}
//             >
//               <LayoutDashboard size={20} />
//               <span>Dashboard</span>
//             </button>

//             <button
//               className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100"
//               onClick={() => {
//                 closeSidebar();
//                 router.push("/admin/vendors");
//               }}
//             >
//               <Store size={20} />
//               <span>Vendors</span>
//               <ChevronRight className="ml-auto" size={17} />
//             </button>

//             <button
//               className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100"
//               onClick={() => {
//                 closeSidebar();
//                 router.push("/admin/members");
//               }}
//             >
//               <Users size={20} />
//               <span>Members</span>
//               <ChevronRight className="ml-auto" size={17} />
//             </button>

//             <button
//               className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100"
//               onClick={() => {
//                 closeSidebar();
//                 router.push("/admin/sales-executives");
//               }}
//             >
//               <UserCog size={20} />
//               <span>Sales Executives</span>
//               <ChevronRight className="ml-auto" size={17} />
//             </button>

//             <button
//               className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100"
//               onClick={() => {
//                 closeSidebar();
//                 router.push("/admin/transactions");
//               }}
//             >
//               <Receipt size={20} />
//               <span>Transactions</span>
//               <ChevronRight className="ml-auto" size={17} />
//             </button>
//           </div>

//           <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
//             Account
//           </p>

//           <button
//             className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100"
//             onClick={() => {
//               closeSidebar();
//               router.push("/admin/profile");
//             }}
//           >
//             <UserCircle size={20} />
//             <span>Profile</span>
//             <ChevronRight className="ml-auto" size={17} />
//           </button>

//           <button
//             onClick={handleLogout}
//             className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-red-600 transition hover:bg-red-50"
//           >
//             <LogOut size={20} />
//             <span>Logout</span>
//           </button>
//         </nav>

//         {/* Admin identity */}
//         <div className="absolute bottom-0 left-0 right-0 border-t border-[#E9E2DC] bg-white p-4">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#172033] text-sm font-bold text-white">
//               {admin?.full_name?.charAt(0) || "A"}
//             </div>

//             <div className="min-w-0">
//               <p className="truncate font-semibold text-[#172033]">
//                 {admin?.full_name || "Admin"}
//               </p>

//               <p className="truncate text-xs text-gray-500">
//                 {admin?.mobile || "9959015364"}
//               </p>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* Main content */}
//       <div className="lg:pl-72">
//         {/* Header */}
//         <header className="sticky top-0 z-30 border-b border-[#E9E2DC] bg-white/95 backdrop-blur">
//           <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setSidebarOpen(true)}
//                 className="rounded-xl p-2.5 text-gray-600 hover:bg-gray-100 lg:hidden"
//               >
//                 <Menu size={24} />
//               </button>

//               <div>
//                 <h2 className="text-xl font-bold text-[#172033] sm:text-2xl">
//                   Admin Dashboard
//                 </h2>

//                 <p className="hidden text-sm text-gray-500 sm:block">
//                   System-wide overview and management
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="hidden text-right sm:block">
//                 <p className="text-sm font-semibold text-[#172033]">
//                   {admin?.full_name}
//                 </p>
//                 <p className="text-xs text-gray-500">Administrator</p>
//               </div>

//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#172033] font-bold text-white">
//                 {admin?.full_name?.charAt(0) || "A"}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Content */}
//         <main className="p-4 sm:p-6 lg:p-8">
//           <div className="mx-auto max-w-7xl">
//             {/* Welcome */}
//             <div className="mb-8 rounded-2xl bg-[#172033] p-6 text-white shadow-sm sm:p-8">
//               <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
//                 <div>
//                   <p className="mb-2 text-sm text-gray-300">
//                     Welcome back
//                   </p>

//                   <h3 className="text-2xl font-bold sm:text-3xl">
//                     {admin?.full_name || "Shiva"}
//                   </h3>

//                   <p className="mt-2 text-sm text-gray-300">
//                     Manage your entire VEDA MINDS system from here.
//                   </p>
//                 </div>

//                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
//                   <ShieldCheck size={34} />
//                 </div>
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
//               {/* Vendors */}
//               <div className="rounded-2xl border border-[#E9E2DC] bg-white p-6 shadow-sm transition hover:shadow-md">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">
//                       Total Vendors
//                     </p>

//                     <p className="mt-2 text-3xl font-bold text-[#172033]">
//                       —
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-orange-50 p-3 text-[#B97943]">
//                     <Store size={24} />
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => router.push("/admin/vendors")}
//                   className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#B97943] hover:underline"
//                 >
//                   Manage Vendors
//                   <ChevronRight size={16} />
//                 </button>
//               </div>

//               {/* Members */}
//               <div className="rounded-2xl border border-[#E9E2DC] bg-white p-6 shadow-sm transition hover:shadow-md">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">
//                       Total Members
//                     </p>

//                     <p className="mt-2 text-3xl font-bold text-[#172033]">
//                       —
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
//                     <Users size={24} />
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => router.push("/admin/members")}
//                   className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
//                 >
//                   Manage Members
//                   <ChevronRight size={16} />
//                 </button>
//               </div>

//               {/* Sales Executives */}
//               <div className="rounded-2xl border border-[#E9E2DC] bg-white p-6 shadow-sm transition hover:shadow-md">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">
//                       Sales Executives
//                     </p>

//                     <p className="mt-2 text-3xl font-bold text-[#172033]">
//                       —
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
//                     <UserCog size={24} />
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => router.push("/admin/sales-executives")}
//                   className="mt-5 flex items-center gap-1 text-sm font-semibold text-purple-600 hover:underline"
//                 >
//                   Manage Sales Team
//                   <ChevronRight size={16} />
//                 </button>
//               </div>

//               {/* Transactions */}
//               <div className="rounded-2xl border border-[#E9E2DC] bg-white p-6 shadow-sm transition hover:shadow-md">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">
//                       Transactions
//                     </p>

//                     <p className="mt-2 text-3xl font-bold text-[#172033]">
//                       —
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-green-50 p-3 text-green-600">
//                     <Receipt size={24} />
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => router.push("/admin/transactions")}
//                   className="mt-5 flex items-center gap-1 text-sm font-semibold text-green-600 hover:underline"
//                 >
//                   View Transactions
//                   <ChevronRight size={16} />
//                 </button>
//               </div>
//             </div>

//             {/* Management */}
//             <div className="mt-8">
//               <div className="mb-5">
//                 <h3 className="text-xl font-bold text-[#172033]">
//                   Management
//                 </h3>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Quickly access system-wide management sections.
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                 {/* Vendor Management */}
//                 <button
//                   onClick={() => router.push("/admin/vendors")}
//                   className="group rounded-2xl border border-[#E9E2DC] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#B97943]">
//                       <Store size={25} />
//                     </div>

//                     <ChevronRight
//                       size={20}
//                       className="text-gray-400 transition group-hover:translate-x-1"
//                     />
//                   </div>

//                   <h4 className="mt-5 text-lg font-bold text-[#172033]">
//                     Vendor Management
//                   </h4>

//                   <p className="mt-2 text-sm leading-6 text-gray-500">
//                     View, create, edit and delete vendors across the entire
//                     system.
//                   </p>
//                 </button>

//                 {/* Member Management */}
//                 <button
//                   onClick={() => router.push("/admin/members")}
//                   className="group rounded-2xl border border-[#E9E2DC] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                       <Users size={25} />
//                     </div>

//                     <ChevronRight
//                       size={20}
//                       className="text-gray-400 transition group-hover:translate-x-1"
//                     />
//                   </div>

//                   <h4 className="mt-5 text-lg font-bold text-[#172033]">
//                     Member Management
//                   </h4>

//                   <p className="mt-2 text-sm leading-6 text-gray-500">
//                     View, create, edit and delete members across the entire
//                     system.
//                   </p>
//                 </button>

//                 {/* Sales Management */}
//                 <button
//                   onClick={() => router.push("/admin/sales-executives")}
//                   className="group rounded-2xl border border-[#E9E2DC] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
//                       <UserCog size={25} />
//                     </div>

//                     <ChevronRight
//                       size={20}
//                       className="text-gray-400 transition group-hover:translate-x-1"
//                     />
//                   </div>

//                   <h4 className="mt-5 text-lg font-bold text-[#172033]">
//                     Sales Executive Management
//                   </h4>

//                   <p className="mt-2 text-sm leading-6 text-gray-500">
//                     Manage Sales Executives and their system-wide operational
//                     access.
//                   </p>
//                 </button>

//                 {/* Transaction Management */}
//                 <button
//                   onClick={() => router.push("/admin/transactions")}
//                   className="group rounded-2xl border border-[#E9E2DC] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
//                       <Receipt size={25} />
//                     </div>

//                     <ChevronRight
//                       size={20}
//                       className="text-gray-400 transition group-hover:translate-x-1"
//                     />
//                   </div>

//                   <h4 className="mt-5 text-lg font-bold text-[#172033]">
//                     Transaction Management
//                   </h4>

//                   <p className="mt-2 text-sm leading-6 text-gray-500">
//                     View and manage transactions across the entire system.
//                   </p>
//                 </button>
//               </div>
//             </div>

//             {/* Admin access notice */}
        

            
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }








import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireAdminPage } from "@/lib/withAdminPage";

export const getServerSideProps = requireAdminPage();
import {
  LayoutDashboard,
  Store,
  Users,
  UserCog,
  Receipt,
  UserCircle,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState(null);

  const [stats, setStats] = useState({
    salesExecutives: 0,
    vendors: 0,
    members: 0,
    transactions: 0,
  });
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const sessionResponse = await fetch("/api/admin/session");
        if (!sessionResponse.ok) {
          router.replace("/admin/login");
          return;
        }

        const sessionPayload = await sessionResponse.json();
        if (!sessionPayload?.user || sessionPayload.user.role !== "admin") {
          router.replace("/admin/login");
          return;
        }

        const tables = [
          ["salesExecutives", "sales_executives"],
          ["vendors", "vendors"],
          ["members", "members"],
          ["transactions", "transactions"],
        ];
        const results = await Promise.all(
          tables.map(async ([key, table]) => {
            const { count, error } = await supabase
              .from(table)
              .select("*", { count: "exact", head: true });
            if (error) throw error;
            return [key, count || 0];
          }),
        );

        if (!cancelled) {
          setSession(sessionPayload.user);
          setStats(Object.fromEntries(results));
          setStatsError("");
          setLoading(false);
        }
      } catch (error) {
        console.error("Admin dashboard load failed", error);
        if (!cancelled) {
          setStats({
            salesExecutives: 0,
            vendors: 0,
            members: 0,
            transactions: 0,
          });
          setStatsError("Could not load the latest totals.");
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = () => {
    fetch("/api/admin/logout", { method: "POST" }).finally(() => {
      router.replace("/admin/login");
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Vendors",
      href: "/admin/vendors",
      icon: Store,
    },
    {
      name: "Members",
      href: "/admin/members",
      icon: Users,
    },
    {
      name: "Sales Executives",
      href: "/admin/sales-executives",
      icon: UserCog,
    },
    {
      name: "Transactions",
      href: "/admin/transactions",
      icon: Receipt,
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: UserCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin</h1>
            <p className="text-xs text-gray-500">Management Panel</p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = router.pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="safe-area-x lg:pl-64">
        {/* Header */}
        <header className="safe-area-header sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Dashboard
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {session?.full_name || "Shiva"}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>

           
          </div>
        </header>

        {/* Content */}
        <main className="safe-area-bottom p-4 sm:p-6 lg:p-8">
          {/* Welcome */}
          <div className="mb-6 rounded-2xl bg-gray-900 p-6 text-white sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm text-gray-300">
                  Welcome back
                </p>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  {session?.full_name || "Shiva"}
                </h1>

                <p className="mt-2 text-sm text-gray-300">
                  Manage your entire system from the Admin dashboard.
                </p>
              </div>

              <div className="hidden rounded-xl bg-white/10 p-3 sm:block">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* =====================================================
              TOTAL STATS
              EXACT ORDER:
              1. Sales Executives
              2. Vendors
              3. Members
              4. Transactions
              ===================================================== */}

          <div className="mb-4">
            {statsError && (
              <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {statsError}
              </p>
            )}

            {/* 2 COLUMNS */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {/* 1. SALES EXECUTIVES */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 sm:text-sm">
                        Total Sales Executives
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                      {statsError ? "—" : stats.salesExecutives}
                    </h3>

                   
                  </div>

                  <div className="hidden rounded-xl bg-gray-100 p-3 sm:block">
                    <UserCog size={22} className="text-gray-700" />
                  </div>
                </div>
              </div>

              {/* 2. VENDORS */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 sm:text-sm">
                      Total vendors
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                      {statsError ? "—" : stats.vendors}
                    </h3>

                    
                  </div>

                  <div className="hidden rounded-xl bg-gray-100 p-3 sm:block">
                    <Store size={22} className="text-gray-700" />
                  </div>
                </div>
              </div>

              {/* 3. MEMBERS */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 sm:text-sm">
                       Total members
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                      {statsError ? "—" : stats.members}
                    </h3>

                    
                  </div>

                  <div className="hidden rounded-xl bg-gray-100 p-3 sm:block">
                    <Users size={22} className="text-gray-700" />
                  </div>
                </div>
              </div>

              {/* 4. TRANSACTIONS */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 sm:text-sm">
                       Total transactions
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                      {statsError ? "—" : stats.transactions}
                    </h3>

                   
                  </div>

                  <div className="hidden rounded-xl bg-gray-100 p-3 sm:block">
                    <Receipt size={22} className="text-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Management Grid */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Management
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Vendors */}
              <Link
                href="/admin/vendors"
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gray-100 p-3">
                    <Store size={24} className="text-gray-700" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Manage Vendors
                    </h3>

                 
                  </div>
                </div>
              </Link>

              {/* Members */}
              <Link
                href="/admin/members"
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gray-100 p-3">
                    <Users size={24} className="text-gray-700" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Manage Members
                    </h3>

                   
                  </div>
                </div>
              </Link>

              {/* Sales Executives */}
              <Link
                href="/admin/sales-executives"
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gray-100 p-3">
                    <UserCog size={24} className="text-gray-700" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Manage Sales Executives
                    </h3>

                  
                  </div>
                </div>
              </Link>

              {/* Transactions */}
              <Link
                href="/admin/transactions"
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gray-100 p-3">
                    <Receipt size={24} className="text-gray-700" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Manage Transactions
                    </h3>

                    
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
