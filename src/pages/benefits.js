import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";

import SuperAdminFooter from "@/components/SuperAdminFooter";
import { supabase } from "@/lib/supabase";

export default function Benefit() {
  const router = useRouter();

  const [period, setPeriod] = useState("week");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * =====================================================
   * LOAD TRANSACTIONS
   * =====================================================
   */

  useEffect(() => {
    loadBenefits();
  }, [period]);

  const loadBenefits = async () => {
    setLoading(true);

    try {
      const now = new Date();

      let startDate;
      let endDate;

      /*
       * ===================================================
       * TODAY
       * ===================================================
       */

      if (period === "today") {
        startDate = new Date(now);

        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);

        endDate.setDate(
          endDate.getDate() + 1
        );
      }

      /*
       * ===================================================
       * WEEK
       * ===================================================
       */

      if (period === "week") {
        startDate = new Date(now);

        const day = startDate.getDay();

        const difference =
          day === 0 ? 6 : day - 1;

        startDate.setDate(
          startDate.getDate() - difference
        );

        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);

        endDate.setDate(
          endDate.getDate() + 7
        );
      }

      /*
       * ===================================================
       * MONTH
       * ===================================================
       */

      if (period === "month") {
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1
        );
      }

      /*
       * ===================================================
       * SUPABASE
       * ===================================================
       */

      const {
        data,
        error,
      } = await supabase
        .from("transactions")
        .select(
          "benefit_amount, created_at"
        )
        .gte(
          "created_at",
          startDate.toISOString()
        )
        .lt(
          "created_at",
          endDate.toISOString()
        )
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "BENEFIT PAGE ERROR:",
          error
        );

        setTransactions([]);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error(
        "BENEFIT PAGE EXCEPTION:",
        error
      );

      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * TOTAL BENEFIT
   * =====================================================
   */

  const totalBenefit = useMemo(() => {
    return transactions.reduce(
      (total, item) =>
        total +
        Number(
          item.benefit_amount || 0
        ),
      0
    );
  }, [transactions]);

  /*
   * =====================================================
   * CHART DATA
   * =====================================================
   */

  const chartData = useMemo(() => {
    /*
     * ===================================================
     * TODAY
     *
     * ONE BAR
     * ===================================================
     */

    if (period === "today") {
      return [
        {
          name: "Today",
          benefit: totalBenefit,
        },
      ];
    }

    /*
     * ===================================================
     * WEEK
     *
     * MONDAY - SUNDAY
     * ===================================================
     */

    if (period === "week") {
      const days = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ];

      const now = new Date();

      const currentDay =
        now.getDay();

      const monday =
        new Date(now);

      monday.setDate(
        now.getDate() -
          (currentDay === 0
            ? 6
            : currentDay - 1)
      );

      monday.setHours(
        0,
        0,
        0,
        0
      );

      return days.map(
        (name, index) => {
          const target =
            new Date(monday);

          target.setDate(
            monday.getDate() +
              index
          );

          const value =
            transactions.reduce(
              (total, item) => {
                const date =
                  new Date(
                    item.created_at
                  );

                if (
                  date.getDate() ===
                    target.getDate() &&
                  date.getMonth() ===
                    target.getMonth() &&
                  date.getFullYear() ===
                    target.getFullYear()
                ) {
                  return (
                    total +
                    Number(
                      item.benefit_amount ||
                        0
                    )
                  );
                }

                return total;
              },
              0
            );

          return {
            name,
            benefit: value,
          };
        }
      );
    }

    if (period === "month") {
      return [
        {
          name: "Month",
          benefit: totalBenefit,
        },
      ];
    }

    return [];
  }, [
    transactions,
    period,
    totalBenefit,
  ]);


  const yAxisStep = 200;

  const yAxisMax = useMemo(() => {
    const values =
      chartData.map(
        (item) =>
          Number(
            item.benefit || 0
          )
      );

    const maxValue =
      Math.max(
        ...values,
        0
      );

    if (maxValue <= 1000) {
      return 1000;
    }

    return (
      Math.ceil(
        maxValue /
          yAxisStep
      ) * yAxisStep
    );
  }, [chartData]);

  /*
   * =====================================================
   * Y-AXIS TICKS
   * =====================================================
   */

  const yAxisTicks = useMemo(() => {
    const ticks = [];

    for (
      let value = 0;
      value <= yAxisMax;
      value += yAxisStep
    ) {
      ticks.push(value);
    }

    return ticks;
  }, [yAxisMax]);

  /*
   * =====================================================
   * CURRENCY
   * =====================================================
   */

  const formatCurrency = (
    amount
  ) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0,
      }
    )}`;
  };

  /*
   * =====================================================
   * TOOLTIP
   * =====================================================
   */

  const CustomTooltip = ({
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

        <p className="mt-1 text-sm font-bold text-[#8A451A]">
          {formatCurrency(
            payload[0].value
          )}
        </p>

      </div>
    );
  };

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-24">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="flex h-[70px] items-center border-b border-[#EAE5E0] bg-white px-5">

        <button
          onClick={() =>
            router.back()
          }
          className="mr-3 flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F5F1ED]"
        >
          <ArrowLeft
            size={23}
            color="#16120e"
          />
        </button>

        <div>

          <h1 className="text-[21px] font-bold text-[#16120e]">
            Benefits
          </h1>

          <p className="text-[12px] text-[#8A7D72]">
            Overall benefit overview
          </p>

        </div>

      </div>

      {/* =================================================
          MAIN
          ================================================= */}

      <div className="mx-auto w-full px-5 pt-4">

        {/* =================================================
            SUMMARY CARD
            ================================================= */}

        <div className="rounded-2xl bg-[#B97943] p-2">

          <p className="ml-2 text-[13px] text-white/80">

            {period === "today"
              ? "Today's Overall Benefit"
              : period === "week"
              ? "This Week's Overall Benefit"
              : "This Month's Overall Benefit"}

          </p>

          <p className="mt-2 ml-2 text-[32px] font-bold text-white">

            {formatCurrency(
              totalBenefit
            )}

          </p>

          <p className="mt-1 ml-2 text-[12px] text-white/70">

            {transactions.length}{" "}
            transaction
            {transactions.length ===
            1
              ? ""
              : "s"}

          </p>

        </div>

        {/* =================================================
            GRAPH CARD
            ================================================= */}

        <div className="mt-5 rounded-2xl border border-[#E9E2DC] bg-white p-5">

          {/* TITLE */}

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-[18px] font-bold text-[#16120e]">
                Overall Benefits
              </h2>

              <p className="mt-1 text-[12px] text-[#8A7D72]">

                {period === "today"
                  ? "Today's benefits"
                  : period === "week"
                  ? "Daily benefits"
                  : "Monthly benefits"}

              </p>

            </div>

            <p className="text-[18px] font-bold text-[#8A451A]">

              {formatCurrency(
                totalBenefit
              )}

            </p>

          </div>

          {/* =================================================
              FILTER
              ================================================= */}

          <div className="mt-5 flex h-11 rounded-xl bg-[#F5F1ED] p-1">

            <button
              onClick={() =>
                setPeriod(
                  "today"
                )
              }
              className={`flex-1 rounded-lg text-sm font-semibold ${
                period ===
                "today"
                  ? "bg-[#B97943] text-white"
                  : "text-[#756B63]"
              }`}
            >
              Today
            </button>

            <button
              onClick={() =>
                setPeriod(
                  "week"
                )
              }
              className={`flex-1 rounded-lg text-sm font-semibold ${
                period ===
                "week"
                  ? "bg-[#B97943] text-white"
                  : "text-[#756B63]"
              }`}
            >
              Week
            </button>

            <button
              onClick={() =>
                setPeriod(
                  "month"
                )
              }
              className={`flex-1 rounded-lg text-sm font-semibold ${
                period ===
                "month"
                  ? "bg-[#B97943] text-white"
                  : "text-[#756B63]"
              }`}
            >
              Month
            </button>

          </div>

          {/* =================================================
              CHART
              ================================================= */}

          <div className="mt-6 h-[330px] w-full">

            {loading ? (

              <div className="flex h-full items-center justify-center">

                <p className="text-sm text-[#8A7D72]">
                  Loading benefits...
                </p>

              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    chartData
                  }
                  margin={{
                    top: 10,
                    right: 5,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  {/* GRID */}

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#EEE8E2"
                    vertical={false}
                  />

                  {/* X AXIS */}

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                      fill: "#8A7D72",
                    }}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />

                  {/* Y AXIS */}

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#8A7D72",
                    }}
                    domain={[
                      0,
                      yAxisMax,
                    ]}
                    ticks={
                      yAxisTicks
                    }
                    tickFormatter={(
                      value
                    ) =>
                      `₹${Number(
                        value
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    }
                    allowDecimals={
                      false
                    }
                    axisLine={false}
                    tickLine={false}
                  />

                  {/* TOOLTIP */}

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  {/* BAR */}

                  <Bar
                    dataKey="benefit"
                    fill="#172033"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                    maxBarSize={
                      period ===
                        "today" ||
                      period ===
                        "month"
                        ? 30
                        : 40
                    }
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

        {/* =================================================
            DETAILS
            ================================================= */}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* TOTAL BENEFIT */}

          <div className="-mt-2 rounded-2xl border border-[#E9E2DC] bg-white p-4">

            <p className="text-xs text-[#8A7D72]">
              Total Benefit
            </p>

            <p className="mt-1 text-xl font-bold text-[#8A451A]">

              {formatCurrency(
                totalBenefit
              )}

            </p>

          </div>

          {/* TRANSACTIONS */}

          <div className="-mt-2 rounded-2xl border border-[#E9E2DC] bg-white p-4">

            <p className="text-xs text-[#8A7D72]">
              Transactions
            </p>

            <p className="mt-1 text-xl font-bold text-[#16120e]">

              {
                transactions.length
              }

            </p>

          </div>

          {/* AVERAGE */}

          <div className="-mt-2 rounded-2xl border border-[#E9E2DC] bg-white p-4">

            <p className="text-xs text-[#8A7D72]">
              Average Benefit
            </p>

            <p className="mt-1 text-xl font-bold text-[#16120e]">

              {formatCurrency(
                transactions.length
                  ? totalBenefit /
                      transactions.length
                  : 0
              )}

            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          FOOTER
          ================================================= */}

      <SuperAdminFooter />

    </div>
  );
}









