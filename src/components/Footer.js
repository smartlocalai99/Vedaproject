
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Store,
  Users,
  User,
} from "lucide-react";

export default function Footer() {
  const router = useRouter();

  const menus = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/salesexecutive/dashboard",
    },
    {
      title: "Vendor",
      icon: Store,
      path: "/salesexecutive/vendors",
    },
    {
      title: "Members",
      icon: Users,
      path: "/salesexecutive/members",
    },
    {
      title: "Profile",
      icon: User,
      path: "/salesexecutive/profile",
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white  z-50">
      <div className="grid grid-cols-4 h-16">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = router.pathname === menu.path;

          return (
            <button
              key={menu.title}
              onClick={() => router.push(menu.path)}
              className="flex flex-col items-center justify-center"
            >
              <Icon
                size={22}
                className={active ? "text-[#B56A38]" : "text-gray-500"}
              />

              <span
                className={`text-xs mt-1 ${
                  active
                    ? "text-[#B56A38] font-semibold"
                    : "text-gray-500"
                }`}
              >
                {menu.title}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
