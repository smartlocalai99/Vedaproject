import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Users, Store, Plus } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const router = useRouter();

  const [statsData, setStatsData] = useState({
    vendors: 0,
    members: 0,
  });

  const [name, setName] =
    useState("Sales Executive");

  const [vendorFilter, setVendorFilter] =
    useState("overall");

  const [memberFilter, setMemberFilter] =
    useState("overall");

  const [vendorPerformance, setVendorPerformance] =
    useState([]);

  const [memberPerformance, setMemberPerformance] =
    useState([]);

  const [
    loadingVendorPerformance,
    setLoadingVendorPerformance,
  ] = useState(true);

  const [
    loadingMemberPerformance,
    setLoadingMemberPerformance,
  ] = useState(true);

  /* =====================================================
     GET SESSION
     ===================================================== */

  const getSalesSession = () => {
    const saved =
      localStorage.getItem(
        "salesExecutiveSession"
      );

    if (!saved) {
      return null;
    }

    try {
      const session =
        JSON.parse(saved);

      if (!session?.id) {
        console.error(
          "SALES SESSION DOES NOT HAVE ID:",
          session
        );

        return null;
      }

      return session;
    } catch (error) {
      console.error(
        "SESSION PARSE ERROR:",
        error
      );

      return null;
    }
  };

  /* =====================================================
     BASIC SESSION
     ===================================================== */

  useEffect(() => {
    if (!router.isReady) return;

    const session =
      getSalesSession();

    if (!session) {
      localStorage.removeItem(
        "salesExecutiveSession"
      );

      router.replace(
        "/salesexecutive/login"
      );

      return;
    }

    setName(
      session.full_name ||
        "Sales Executive"
    );
  }, [router.isReady, router]);

  /* =====================================================
     LOAD BASIC STATS
     ===================================================== */

  useEffect(() => {
    if (!router.isReady) return;

    const session =
      getSalesSession();

    if (!session) return;

    async function loadStats() {
      try {
        const [
          vendorsResult,
          membersResult,
        ] = await Promise.all([
          supabase
            .from("vendors")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "sales_id",
              session.id
            ),

          supabase
            .from("members")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "sales_id",
              session.id
            ),
        ]);

        if (vendorsResult.error) {
          console.error(
            "TOTAL VENDORS ERROR:",
            vendorsResult.error
          );
        }

        if (membersResult.error) {
          console.error(
            "TOTAL MEMBERS ERROR:",
            membersResult.error
          );
        }

        setStatsData({
          vendors:
            vendorsResult.error
              ? 0
              : vendorsResult.count || 0,

          members:
            membersResult.error
              ? 0
              : membersResult.count || 0,
        });
      } catch (error) {
        console.error(
          "STATS ERROR:",
          error
        );
      }
    }

    loadStats();
  }, [router.isReady]);

  /* =====================================================
     VENDOR PERFORMANCE
     ===================================================== */

  useEffect(() => {
    if (!router.isReady) return;

    async function loadVendorPerformance() {
      const session =
        getSalesSession();

      if (!session) {
        setLoadingVendorPerformance(
          false
        );
        return;
      }

      try {
        setLoadingVendorPerformance(
          true
        );

        const {
          data: vendorsData,
          error: vendorError,
        } = await supabase
          .from("vendors")
          .select(
            "id, business_name"
          )
          .eq(
            "sales_id",
            session.id
          )
          .order(
            "business_name",
            {
              ascending: true,
            }
          );

        if (vendorError) {
          console.error(
            "VENDOR PERFORMANCE VENDOR ERROR:",
            vendorError
          );

          setVendorPerformance([]);
          return;
        }

        const vendorIds =
          (vendorsData || []).map(
            (vendor) => vendor.id
          );

        if (
          vendorIds.length === 0
        ) {
          setVendorPerformance([]);
          return;
        }

        let query = supabase
          .from("transactions")
          .select(
            "vendor_id, created_at"
          )
          .in(
            "vendor_id",
            vendorIds
          );

        if (
          vendorFilter === "month"
        ) {
          const now = new Date();

          const start =
            new Date(
              now.getFullYear(),
              now.getMonth(),
              1
            );

          const end =
            new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1
            );

          query = query
            .gte(
              "created_at",
              start.toISOString()
            )
            .lt(
              "created_at",
              end.toISOString()
            );
        }

        const {
          data: transactions,
          error:
            transactionError,
        } = await query;

        if (transactionError) {
          console.error(
            "VENDOR PERFORMANCE TRANSACTION ERROR:",
            transactionError
          );

          setVendorPerformance([]);
          return;
        }

        const result =
          (vendorsData || [])
            .map((vendor) => {
              const count =
                (
                  transactions || []
                ).filter(
                  (transaction) =>
                    transaction.vendor_id ===
                    vendor.id
                ).length;

              return {
                name:
                  vendor.business_name ||
                  "Vendor",
                transactions:
                  count,
              };
            })
            .sort(
              (a, b) =>
                b.transactions -
                a.transactions
            );

        setVendorPerformance(
          result
        );
      } catch (error) {
        console.error(
          "VENDOR PERFORMANCE ERROR:",
          error
        );

        setVendorPerformance([]);
      } finally {
        setLoadingVendorPerformance(
          false
        );
      }
    }

    loadVendorPerformance();
  }, [
    router.isReady,
    vendorFilter,
  ]);

  /* =====================================================
     MEMBER PERFORMANCE
     ===================================================== */

  useEffect(() => {
    if (!router.isReady) return;

    async function loadMemberPerformance() {
      const session =
        getSalesSession();

      if (!session) {
        setLoadingMemberPerformance(
          false
        );
        return;
      }

      try {
        setLoadingMemberPerformance(
          true
        );

        const {
          data,
          error,
        } = await supabase
          .from("members")
          .select(
            "id, created_at"
          )
          .eq(
            "sales_id",
            session.id
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

        if (error) {
          console.error(
            "MEMBER PERFORMANCE ERROR:",
            error
          );

          setMemberPerformance([]);
          return;
        }

        /* CURRENT MONTH */

        if (
          memberFilter === "month"
        ) {
          const now = new Date();

          const start =
            new Date(
              now.getFullYear(),
              now.getMonth(),
              1
            );

          const end =
            new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1
            );

          const filtered =
            (data || []).filter(
              (member) => {
                if (
                  !member.created_at
                ) {
                  return false;
                }

                const date =
                  new Date(
                    member.created_at
                  );

                return (
                  date >= start &&
                  date < end
                );
              }
            );

          const daysInMonth =
            new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0
            ).getDate();

          const days =
            Array.from(
              {
                length:
                  daysInMonth,
              },
              (_, index) => ({
                name: String(
                  index + 1
                ),
                members: 0,
              })
            );

          filtered.forEach(
            (member) => {
              const day =
                new Date(
                  member.created_at
                ).getDate();

              if (
                days[day - 1]
              ) {
                days[
                  day - 1
                ].members += 1;
              }
            }
          );

          setMemberPerformance(
            days
          );

          return;
        }

        /* OVERALL - LAST 6 MONTHS */

        const now = new Date();

        const months = [];

        for (
          let i = 5;
          i >= 0;
          i--
        ) {
          const date =
            new Date(
              now.getFullYear(),
              now.getMonth() - i,
              1
            );

          months.push({
            name:
              date.toLocaleString(
                "en-IN",
                {
                  month: "short",
                }
              ),

            year:
              date.getFullYear(),

            monthIndex:
              date.getMonth(),

            members: 0,
          });
        }

        (data || []).forEach(
          (member) => {
            if (
              !member.created_at
            ) {
              return;
            }

            const date =
              new Date(
                member.created_at
              );

            const matching =
              months.find(
                (item) =>
                  item.year ===
                    date.getFullYear() &&
                  item.monthIndex ===
                    date.getMonth()
              );

            if (matching) {
              matching.members += 1;
            }
          }
        );

        setMemberPerformance(
          months.map(
            (item) => ({
              name: item.name,
              members:
                item.members,
            })
          )
        );
      } catch (error) {
        console.error(
          "MEMBER PERFORMANCE ERROR:",
          error
        );

        setMemberPerformance([]);
      } finally {
        setLoadingMemberPerformance(
          false
        );
      }
    }

    loadMemberPerformance();
  }, [
    router.isReady,
    memberFilter,
  ]);

  /* =====================================================
     STATS
     ===================================================== */

  const stats = [
    {
      title: "Total Vendors",
      value: statsData.vendors,
      icon: Store,
      iconColor:
        "text-orange-600",
      iconBg:
        "bg-orange-50",
    },
    {
      title: "Total Members",
      value: statsData.members,
      icon: Users,
      iconColor:
        "text-blue-600",
      iconBg:
        "bg-blue-50",
    },
  ];

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* HEADER */}

      <header className="bg-[#111827] px-4 py-4">

        <div className="text-sm font-bold text-white">
          Welcome {name}
        </div>

      </header>

      {/* MAIN */}

      <div className="p-4 -mt-1 pb-24">

        {/* STATS */}

        <div className="grid grid-cols-2 gap-2">

          {stats.map((item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={item.title}
                className="
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  px-3
                  py-3
                  shadow-sm
                "
              >

                <div className="flex items-center gap-2.5">

                  <div
                    className={`
                      flex
                      h-8
                      w-8
                      flex-shrink-0
                      items-center
                      justify-center
                      rounded-full
                      ${item.iconBg}
                    `}
                  >
                    <Icon
                      size={16}
                      className={
                        item.iconColor
                      }
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[11px] leading-tight text-gray-500">
                      {item.title}
                    </p>

                    <h2 className="mt-1 text-sm font-bold text-[#172033]">
                      {item.value}
                    </h2>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

        {/* QUICK ACTIONS */}

        <div className="mt-2 space-y-4">

          {/* ADD VENDOR */}

          <div
            onClick={() =>
              router.push(
                "/salesexecutive/vendor"
              )
            }
            className="
              cursor-pointer
              rounded-xl
              bg-[#172033]
              p-5
              text-white
            "
          >

            <div className="-mt-1 flex items-center gap-4">

              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                "
              >
                <Plus size={22} />
              </div>

              <div>

                <h2 className="text-sm font-bold">
                  Add Vendor
                </h2>

                <p className="mt-1 text-xs text-gray-300">
                  Register new vendor
                </p>

              </div>

            </div>

          </div>

          {/* ADD MEMBER */}

          <div
            onClick={() =>
              router.push(
                "/salesexecutive/member"
              )
            }
            className="
              cursor-pointer
              rounded-xl
              bg-[#B97943]
              p-5
              text-white
            "
          >

            <div className="-mt-1 flex items-center gap-4">

              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                "
              >
                <Plus size={26} />
              </div>

              <div>

                <h2 className="text-sm font-bold">
                  Add Member
                </h2>

                <p className="mt-1 text-xs text-orange-100">
                  Register new member
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* VENDOR PERFORMANCE */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-[#E9E2DC]
            bg-white
            p-3
          "
        >

          <div>

            <h3 className="text-[15px] font-bold text-[#16120e]">
              Vendor Performance
            </h3>

            <p className="mt-1 text-[10px] text-[#8A7D72]">
              Transactions by vendor
            </p>

          </div>

          <div
            className="
              mt-3
              flex
              h-9
              rounded-lg
              bg-[#F5F1ED]
              p-1
            "
          >

            <button
              type="button"
              onClick={() =>
                setVendorFilter(
                  "month"
                )
              }
              className={`
                flex-1
                rounded-md
                text-[11px]
                font-semibold
                ${
                  vendorFilter ===
                  "month"
                    ? "bg-[#B97943] text-white"
                    : "text-[#756B63]"
                }
              `}
            >
              Month
            </button>

            <button
              type="button"
              onClick={() =>
                setVendorFilter(
                  "overall"
                )
              }
              className={`
                flex-1
                rounded-md
                text-[11px]
                font-semibold
                ${
                  vendorFilter ===
                  "overall"
                    ? "bg-[#B97943] text-white"
                    : "text-[#756B63]"
                }
              `}
            >
              Overall
            </button>

          </div>

          <div
            className="mt-3 w-full"
            style={{
              height: Math.max(
                220,
                vendorPerformance.length *
                  40
              ),
            }}
          >

            {loadingVendorPerformance ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-[10px] text-[#8A7D72]">
                  Loading...
                </p>
              </div>
            ) : vendorPerformance.length ===
              0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-[10px] text-[#8A7D72]">
                  No vendor data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    vendorPerformance
                  }
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 10,
                    left: 5,
                    bottom: 5,
                  }}
                  barCategoryGap="8%"
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#EEE8E2"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    domain={[
                      0,
                      1000,
                    ]}
                    ticks={[
                      0,
                      200,
                      400,
                      600,
                      800,
                      1000,
                    ]}
                    allowDecimals={false}
                    tick={{
                      fontSize: 8,
                      fill: "#8A7D72",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    interval={0}
                    tick={{
                      fontSize: 8,
                      fill: "#16120e",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="transactions"
                    fill="#172033"
                    radius={[
                      0,
                      5,
                      5,
                      0,
                    ]}
                    barSize={16}
                  />

                </BarChart>

              </ResponsiveContainer>
            )}

          </div>

        </div>

        {/* MEMBER PERFORMANCE */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-[#E9E2DC]
            bg-white
            p-3
          "
        >

          <div>

            <h3 className="text-[15px] font-bold text-[#16120e]">
              Member Performance
            </h3>

            <p className="mt-1 text-[10px] text-[#8A7D72]">
              Members onboarded
            </p>

          </div>

          <div
            className="
              mt-3
              flex
              h-9
              rounded-lg
              bg-[#F5F1ED]
              p-1
            "
          >

            <button
              type="button"
              onClick={() =>
                setMemberFilter(
                  "month"
                )
              }
              className={`
                flex-1
                rounded-md
                text-[11px]
                font-semibold
                ${
                  memberFilter ===
                  "month"
                    ? "bg-[#B97943] text-white"
                    : "text-[#756B63]"
                }
              `}
            >
              Month
            </button>

            <button
              type="button"
              onClick={() =>
                setMemberFilter(
                  "overall"
                )
              }
              className={`
                flex-1
                rounded-md
                text-[11px]
                font-semibold
                ${
                  memberFilter ===
                  "overall"
                    ? "bg-[#B97943] text-white"
                    : "text-[#756B63]"
                }
              `}
            >
              Overall
            </button>

          </div>

          <div
            className="mt-4 w-full"
            style={{
              height: 280,
            }}
          >

            {loadingMemberPerformance ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-[10px] text-[#8A7D72]">
                  Loading...
                </p>
              </div>
            ) : memberPerformance.length ===
              0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-[10px] text-[#8A7D72]">
                  No member data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    memberPerformance
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                  barCategoryGap="20%"
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#EEE8E2"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    interval={
                      memberFilter ===
                      "month"
                        ? 1
                        : 0
                    }
                    tick={{
                      fontSize: 8,
                      fill: "#8A7D72",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="number"
                    domain={[
                      0,
                      500,
                    ]}
                    ticks={[
                      0,
                      50,
                      100,
                      150,
                      200,
                      250,
                      300,
                      350,
                      400,
                      450,
                      500,
                    ]}
                    allowDecimals={false}
                    tick={{
                      fontSize: 8,
                      fill: "#8A7D72",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="members"
                    fill="#172033"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                    barSize={
                      memberFilter ===
                      "month"
                        ? 10
                        : 28
                    }
                  />

                </BarChart>

              </ResponsiveContainer>
            )}

          </div>

        </div>

      </div>

      <Footer />

    </div>
  );
}