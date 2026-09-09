import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { readAdminToken } from "@/lib/adminAuth";

export default function AdminProfile({ initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser || null);
  useEffect(() => { fetch("/api/admin/session").then(async (response) => { if (!response.ok) return router.replace("/admin/login"); setUser((await response.json()).user); }).catch(() => router.replace("/admin/login")); }, [router]);
  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); };
  if (!user) return <main className="safe-area-top safe-area-bottom min-h-[100dvh] bg-[#F7F7F7]" />;
  return <main className="min-h-screen bg-[#F7F7F7] px-4 py-8 text-[#172033]"><section className="mx-auto max-w-2xl rounded-2xl border border-[#E9E2DC] bg-white p-6 shadow-sm"><button onClick={() => router.push("/admin/dashboard")} className="mb-6 text-sm font-semibold text-[#B97943]">← Dashboard</button><h1 className="text-2xl font-bold">Admin Profile</h1><dl className="mt-6 space-y-4"><div><dt className="text-xs uppercase text-gray-500">Name</dt><dd className="font-medium">{user.full_name}</dd></div><div><dt className="text-xs uppercase text-gray-500">Role</dt><dd className="font-medium">Admin</dd></div><div><dt className="text-xs uppercase text-gray-500">Mobile</dt><dd className="font-medium">{user.mobile}</dd></div></dl><button onClick={logout} className="mt-8 rounded-xl bg-[#172033] px-5 py-3 font-semibold text-white">Logout</button></section></main>;
}

export function getServerSideProps({ req }) {
  const session = readAdminToken(req);
  if (!session) return { redirect: { destination: "/admin/login", permanent: false } };
  return { props: { initialUser: { full_name: session.full_name, role: session.role, mobile: session.mobile } } };
}
