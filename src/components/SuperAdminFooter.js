import Link from "next/link";
import { useRouter } from "next/router";
import {
  House,
  Users,
  Store,
  CircleUserRound,
} from "lucide-react";

export default function SuperAdminFooter() {
  const router = useRouter();

  const menus = [
    {
      title: "Dashboard",
      icon: House,
      href: "/",
    },
    {
      title: "Sales",
      icon: Users,
      href: "/sales",
    },
    {
      title: "Vendor",
      icon: Store,
      href: "/vendors",
    },
    {
      title: "Profile",
      icon: CircleUserRound,
      href: "/profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white  z-50">
      <div className="grid grid-cols-4 h-16">
        {menus.map((item) => {
          const Icon = item.icon;

          const active =
            router.pathname === item.href ||
            (item.href === "/sales" &&
              router.pathname.startsWith("/sales"));

          return (
            <Link
              key={item.title}
              href={item.href}
              className="flex flex-col items-center justify-center"
            >
              <Icon
                size={22}
                className={
                  active
                    ? "text-[#B56A38]"
                    : "text-gray-400"
                }
              />

              <span
                className={`text-[11px] mt-1 ${
                  active
                    ? "text-[#B56A38] font-semibold"
                    : "text-gray-500"
                }`}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}