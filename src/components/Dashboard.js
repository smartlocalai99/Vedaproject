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

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { supabase } from "@/lib/supabase";
import SuperAdminFooter from "@/components/SuperAdminFooter";

export default function Dashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    sales: 0,
    vendors: 0,
    members: 0,
    transactions: 0,
    benefits: 0,
  });

  const [error, setError] = useState("");

  /* =====================================================
     SALES PERFORMANCE
     ===================================================== */

  const [
    salesPerformancePeriod,
    setSalesPerformancePeriod,
  ] = useState("overall");

  const [
    salesPerformance,
    setSalesPerformance,
  ] = useState([]);

  /* =====================================================
     VENDOR PERFORMANCE
     ===================================================== */

  const [
    vendorPerformancePeriod,
    setVendorPerformancePeriod,
  ] = useState("overall");

  const [
    vendorPerformance,
    setVendorPerformance,
  ] = useState([]);

  /* =====================================================
     LOAD DASHBOARD
     ===================================================== */

  useEffect(() => {
    async function loadDashboard() {
      setError("");

      const [
        sales,
        vendors,
        members,
        transactions,
        benefits,
      ] = await Promise.all([
        supabase
          .from("sales_executives")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("vendors")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("members")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("transactions")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("transactions")
          .select("benefit_amount"),
      ]);

      const queryError =
        sales.error ||
        vendors.error ||
        members.error ||
        transactions.error ||
        benefits.error;

      if (queryError) {
        console.log(
          "DASHBOARD ERROR:",
          queryError
        );

        setError(queryError.message);
      } else {
        const totalBenefits =
          (benefits.data || []).reduce(
            (total, item) =>
              total +
              Number(
                item.benefit_amount || 0
              ),
            0
          );

        setStats({
          sales: sales.count || 0,
          vendors: vendors.count || 0,
          members: members.count || 0,
          transactions:
            transactions.count || 0,
          benefits: totalBenefits,
        });
      }
    }

    loadDashboard();
  }, []);

  /* =====================================================
     LOAD SALES PERFORMANCE
     ===================================================== */

  useEffect(() => {
    async function loadSalesPerformance() {
      try {
        const {
          data: salesExecutives,
          error: salesError,
        } = await supabase
          .from("sales_executives")
          .select(
            "id, full_name"
          )
          .order("full_name", {
            ascending: true,
          });

        if (salesError) {
          console.error(
            "SALES PERFORMANCE ERROR:",
            salesError
          );

          setSalesPerformance([]);
          return;
        }

        let memberQuery = supabase
          .from("members")
          .select(
            "id, sales_id, created_at"
          );

        if (
          salesPerformancePeriod ===
          "month"
        ) {
          const now = new Date();

          const startOfMonth =
            new Date(
              now.getFullYear(),
              now.getMonth(),
              1
            );

          const startOfNextMonth =
            new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1
            );

          memberQuery =
            memberQuery
              .gte(
                "created_at",
                startOfMonth.toISOString()
              )
              .lt(
                "created_at",
                startOfNextMonth.toISOString()
              );
        }

        const {
          data: members,
          error: membersError,
        } = await memberQuery;

        if (membersError) {
          console.error(
            "MEMBER PERFORMANCE ERROR:",
            membersError
          );

          setSalesPerformance([]);
          return;
        }

        const performance =
          (salesExecutives || []).map(
            (salesExecutive) => {
              const count =
                (members || []).filter(
                  (member) =>
                    member.sales_id ===
                    salesExecutive.id
                ).length;

              return {
                id: salesExecutive.id,
                name:
                  salesExecutive.full_name ||
                  "Unknown",
                cards: count,
              };
            }
          );

        performance.sort(
          (a, b) =>
            b.cards - a.cards
        );

        setSalesPerformance(
          performance
        );
      } catch (error) {
        console.error(
          "SALES PERFORMANCE EXCEPTION:",
          error
        );

        setSalesPerformance([]);
      }
    }

    loadSalesPerformance();
  }, [
    salesPerformancePeriod,
  ]);

  /* =====================================================
     LOAD VENDOR PERFORMANCE
     ===================================================== */

  useEffect(() => {
    async function loadVendorPerformance() {
      try {
        const {
          data: vendors,
          error: vendorsError,
        } = await supabase
          .from("vendors")
          .select(
            "id, business_name"
          )
          .order("business_name", {
            ascending: true,
          });

        if (vendorsError) {
          console.error(
            "VENDOR PERFORMANCE ERROR:",
            vendorsError
          );

          setVendorPerformance([]);
          return;
        }

        let transactionQuery =
          supabase
            .from("transactions")
            .select(
              "id, vendor_id, created_at"
            );

        if (
          vendorPerformancePeriod ===
          "month"
        ) {
          const now = new Date();

          const startOfMonth =
            new Date(
              now.getFullYear(),
              now.getMonth(),
              1
            );

          const startOfNextMonth =
            new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1
            );

          transactionQuery =
            transactionQuery
              .gte(
                "created_at",
                startOfMonth.toISOString()
              )
              .lt(
                "created_at",
                startOfNextMonth.toISOString()
              );
        }

        const {
          data: transactions,
          error: transactionsError,
        } = await transactionQuery;

        if (transactionsError) {
          console.error(
            "VENDOR TRANSACTION ERROR:",
            transactionsError
          );

          setVendorPerformance([]);
          return;
        }

        const performance =
          (vendors || []).map(
            (vendor) => {
              const count =
                (transactions || []).filter(
                  (transaction) =>
                    transaction.vendor_id ===
                    vendor.id
                ).length;

              return {
                id: vendor.id,
                name:
                  vendor.business_name ||
                  "Unknown Vendor",
                transactions: count,
              };
            }
          );

        performance.sort(
          (a, b) =>
            b.transactions -
            a.transactions
        );

        setVendorPerformance(
          performance
        );
      } catch (error) {
        console.error(
          "VENDOR PERFORMANCE EXCEPTION:",
          error
        );

        setVendorPerformance([]);
      }
    }

    loadVendorPerformance();
  }, [
    vendorPerformancePeriod,
  ]);

  /* =====================================================
     SALES TOOLTIP
     ===================================================== */

  const SalesPerformanceTooltip = ({
    active,
    payload,
  }) => {
    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    return (
      <div className="rounded-lg border border-[#E7DDD4] bg-white px-3 py-2 shadow-lg">

        <p className="text-xs text-[#8A7D72]">
          Cards Onboarded
        </p>

        <p className="mt-1 text-sm font-bold text-[#8A451A]">
          {Number(
            payload[0].value || 0
          ).toLocaleString(
            "en-IN"
          )}
        </p>

      </div>
    );
  };

  /* =====================================================
     VENDOR TOOLTIP
     ===================================================== */

  const VendorPerformanceTooltip = ({
    active,
    payload,
    label,
  }) => {
    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    return (
      <div className="rounded-lg border border-[#E7DDD4] bg-white px-3 py-2 shadow-lg">

        <p className="text-xs text-[#8A7D72]">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-[#B97943]">
          {Number(
            payload[0].value || 0
          ).toLocaleString(
            "en-IN"
          )}{" "}
          Transactions
        </p>

      </div>
    );
  };

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-24">

      {/* =================================================
          HEADER
          ================================================= */}

      <div
        className="
          h-16
          bg-[#111827]
          px-4
          flex
          items-center
          gap-3
        "
      >

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


      {/* =================================================
          STATS
          ================================================= */}

      <div className="px-3 -mt-2 pt-5">

        <div className="grid grid-cols-2 gap-2">

          {/* SALES */}

          <Stat
            icon={
              <UserRound
                size={19}
                strokeWidth={1.8}
              />
            }
            title="Total Sales Executives"
            value={stats.sales}
            onClick={() =>
              router.push(
                "/sales"
              )
            }
          />

          {/* VENDORS */}

          <Stat
            icon={
              <Store
                size={19}
                strokeWidth={1.8}
              />
            }
            title="Total Vendors"
            value={stats.vendors}
            onClick={() =>
              router.push(
                "/vendors"
              )
            }
          />

          {/* MEMBERS */}

          <Stat
            icon={
              <Users
                size={19}
                strokeWidth={1.8}
              />
            }
            title="Total Members"
            value={stats.members}
            onClick={() =>
              router.push(
                "/members"
              )
            }
          />

          {/* TRANSACTIONS */}

          <Stat
            icon={
              <FileText
                size={19}
                strokeWidth={1.8}
              />
            }
            title="Total Transactions"
            value={stats.transactions}
            onClick={() =>
              router.push(
                "/transactions"
              )
            }
          />

          {/* BENEFITS */}

          <div className="col-span-2">

            <Stat
              icon={
                <IndianRupee
                  size={19}
                  strokeWidth={1.8}
                />
              }
              title="Total Benefits Given"
              value={`₹${stats.benefits.toLocaleString(
                "en-IN"
              )}`}
              onClick={() =>
                router.push(
                  "/benefits"
                )
              }
              wide
            />

          </div>

        </div>

      </div>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="px-3 mt-3">

          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">

            <p className="text-[11px] text-red-600">
              {error}
            </p>

          </div>

        </div>
      )}


      {/* =================================================
          QUICK ACTIONS
          ================================================= */}

      <div className="px-3 mt-3">

        <h3 className="text-sm font-bold mb-2">
          Quick Actions
        </h3>

        {/* ADD SALES */}

        <button
          onClick={() =>
            router.push(
              "/sales"
            )
          }
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
            active:opacity-90
          "
        >

          <div className="flex gap-3 items-center">

            <UserPlus
              size={20}
            />

            <div className="text-left">

              <p className="text-xs font-semibold">
                Add Sales Executive
              </p>

              <span className="text-[10px] text-gray-300">
                Create new sales user
              </span>

            </div>

          </div>

          <span className="text-lg">
            ›
          </span>

        </button>


        {/* ADD VENDOR */}

        <button
          onClick={() =>
            router.push(
              "/vendors"
            )
          }
          className="
            w-full
            bg-[#B97943]
            text-white
            rounded-lg
            p-3
            flex
            justify-between
            items-center
            active:opacity-90
          "
        >

          <div className="flex gap-3 items-center">

            <Store
              size={20}
            />

            <div className="text-left">

              <p className="text-xs font-semibold">
                Add Vendor
              </p>

              <span className="text-[10px]">
                Create vendor account
              </span>

            </div>

          </div>

          <span className="text-lg">
            ›
          </span>

        </button>

      </div>


      {/* =================================================
          SALES PERFORMANCE
          ================================================= */}

      <div className="px-3 mt-4">

        <div className="rounded-2xl border border-[#E9E2DC] bg-white p-4">

          <div>

            <h3 className="text-[16px] font-bold text-[#16120e]">
              Sales Performance
            </h3>

            <p className="mt-1 text-[11px] text-[#8A7D72]">
              Member cards onboarded by sales executive
            </p>

          </div>


          {/* FILTER */}

          <div className="mt-4 flex h-10 rounded-xl bg-[#F5F1ED] p-1">

            <button
              type="button"
              onClick={() =>
                setSalesPerformancePeriod(
                  "month"
                )
              }
              className={`flex-1 rounded-lg text-xs font-semibold ${
                salesPerformancePeriod ===
                "month"
                  ? "bg-[#B97943] text-white"
                  : "text-[#756B63]"
              }`}
            >
              Month
            </button>

            <button
              type="button"
              onClick={() =>
                setSalesPerformancePeriod(
                  "overall"
                )
              }
              className={`flex-1 rounded-lg text-xs font-semibold ${
                salesPerformancePeriod ===
                "overall"
                  ? "bg-[#B97943] text-white"
                  : "text-[#756B63]"
              }`}
            >
              Overall
            </button>

          </div>


          {/* SALES GRAPH */}

          <div
            className="mt-4 w-full"
            style={{
              height: Math.max(
                180,
                salesPerformance.length *
                  42 +
                  70
              ),
            }}
          >

            {salesPerformance.length ===
              0 ? (

              <div className="flex h-full items-center justify-center">

                <p className="text-xs text-[#8A7D72]">
                  No sales executives found.
                </p>

              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    salesPerformance
                  }
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                  barCategoryGap={8}
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
                    allowDecimals={
                      false
                    }
                    tick={{
                      fontSize: 10,
                      fill: "#8A7D72",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={75}
                    tick={{
                      fontSize: 10,
                      fill: "#16120e",
                    }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />

                  <Tooltip
                    content={
                      <SalesPerformanceTooltip />
                    }
                  />

                  <Bar
                    dataKey="cards"
                    fill="#172033"
                    radius={[
                      0,
                      5,
                      5,
                      0,
                    ]}
                    barSize={22}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

      </div>


      {/* =================================================
          VENDOR PERFORMANCE
          ================================================= */}

      <div className="px-3 mt-4">

        <div className="rounded-2xl border border-[#E9E2DC] bg-white p-3">

          {/* TITLE */}

          <div>

            <h3 className="text-[16px] font-bold text-[#16120e]">
              Vendor Performance
            </h3>

            <p className="mt-1 text-[11px] text-[#8A7D72]">
              Transactions generated by each vendor
            </p>

          </div>


          {/* FILTER */}

          <div className="mt-4 flex h-10 rounded-xl bg-[#F5F1ED] p-1">

            <button
              type="button"
              onClick={() =>
                setVendorPerformancePeriod(
                  "month"
                )
              }
              className={`flex-1 rounded-lg text-xs font-semibold ${
                vendorPerformancePeriod ===
                "month"
                  ? "bg-[#B97943] text-white"
                  : "text-[#756B63]"
              }`}
            >
              Month
            </button>

            <button
              type="button"
              onClick={() =>
                setVendorPerformancePeriod(
                  "overall"
                )
              }
              className={`flex-1 rounded-lg text-xs font-semibold ${
                vendorPerformancePeriod ===
                "overall"
                  ? "bg-[#B97943] text-white"
                  : "text-[#756B63]"
              }`}
            >
              Overall
            </button>

          </div>


          {/* VENDOR GRAPH */}

          <div
            className="mt-5 w-full"
            style={{
              height: 320,
            }}
          >

            {vendorPerformance.length ===
              0 ? (

              <div className="flex h-full items-center justify-center">

                <p className="text-xs text-[#8A7D72]">
                  No vendor data available.
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
                  margin={{
                    top: 10,
                    right: 5,
                    left: 0,
                    bottom: 55,
                  }}
                  barCategoryGap="0%"
                  barGap={0}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#EEE8E2"
                    vertical={false}
                  />

                  <YAxis
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
                      fontSize: 10,
                      fill: "#8A7D72",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />

                  <XAxis
                    type="category"
                    dataKey="name"
                    interval={0}
                    tick={{
                      fontSize: 9,
                      fill: "#16120e",
                    }}
                    axisLine={false}
                    tickLine={false}
                    height={60}
                    tickMargin={5}
                    angle={
                      vendorPerformance.length >
                      6
                        ? -35
                        : 0
                    }
                    textAnchor={
                      vendorPerformance.length >
                      6
                        ? "end"
                        : "middle"
                    }
                  />

                  <Tooltip
                    content={
                      <VendorPerformanceTooltip />
                    }
                  />

                  <Bar
                    dataKey="transactions"
                    fill="#172033"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                    barSize={
                      vendorPerformance.length <=
                      5
                        ? 30
                        : vendorPerformance.length <=
                          10
                        ? 22
                        : 14
                    }
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>


          <div className="flex justify-center">

            <p className=" -mt-15 text-[10px] text-[#8A7D72]">
              Number of Transactions
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          FOOTER
          ================================================= */}

      <SuperAdminFooter />

    </main>
  );
}


/* =====================================================
   STAT CARD
   ===================================================== */

function Stat({
  icon,
  title,
  value,
  onClick,
  wide = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        text-left
        bg-white
        border
        border-[#EAE5DE]
        rounded-lg
        px-2
        py-3
        shadow-[0_1px_3px_rgba(0,0,0,0.08)]
        hover:shadow-md
        active:scale-[0.99]
        transition
        ${wide ? "py-3.5" : ""}
      `}
    >

      <div className="flex items-center">

        <div
          className="
            w-9
            h-9
            rounded-full
            bg-[#F4EADF]
            text-[#B97943]
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          {icon}
        </div>

        <div className="ml-3 min-w-0">

          <p className="text-[11px] text-[#27303D] truncate">
            {title}
          </p>

          <p className="mt-1 text-[16px] font-bold text-[#111]">
            {value}
          </p>

        </div>

      </div>

    </button>
  );
}