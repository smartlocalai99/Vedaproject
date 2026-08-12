import {
  ArrowLeft,
  Search,
  ReceiptText,
  IndianRupee,
  UserRound,
  CalendarDays,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import SuperAdminFooter from "@/components/SuperAdminFooter";
import { supabase } from "@/lib/supabase";

export default function Transactions() {
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD TRANSACTIONS + MEMBERS
  ========================================================= */

  const loadTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      /* =====================================================
         LOAD TRANSACTIONS
      ===================================================== */

      const {
        data: transactionData,
        error: transactionError,
      } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (transactionError) {
        console.log(
          "TRANSACTIONS LOAD ERROR:",
          transactionError
        );

        setError(transactionError.message);
        setTransactions([]);
        setLoading(false);
        return;
      }

      /* =====================================================
         LOAD MEMBERS

         IMPORTANT:
         We use full_name.
         We DO NOT use members.name.
      ===================================================== */

      const {
        data: memberData,
        error: memberError,
      } = await supabase
        .from("members")
        .select("id, full_name, member_id");

      if (memberError) {
        console.log(
          "MEMBERS LOAD ERROR:",
          memberError
        );

        /*
         * Transactions can still be displayed
         * even if member loading fails.
         */
        setMembers([]);
      } else {
        setMembers(memberData || []);
      }

      setTransactions(transactionData || []);
    } catch (err) {
      console.log(
        "TRANSACTIONS PAGE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load transactions."
      );

      setTransactions([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  /* =========================================================
     GET MEMBER DETAILS
  ========================================================= */

  const getMember = (memberId) => {
    if (!memberId) return null;

    return members.find(
      (member) =>
        String(member.id) === String(memberId)
    );
  };

  /* =========================================================
     GET MEMBER NAME

     Uses full_name only.
  ========================================================= */

  const getMemberName = (transaction) => {
    const member = getMember(
      transaction.member_id
    );

    if (member?.full_name) {
      return member.full_name;
    }

    return "Unknown Member";
  };

  /* =========================================================
     GET MEMBER ID

     Displays VEDA000001 etc.
  ========================================================= */

  const getMemberCode = (transaction) => {
    const member = getMember(
      transaction.member_id
    );

    if (member?.member_id) {
      return member.member_id;
    }

    /*
     * If member_id is directly stored in transaction
     * as a display ID, use it as fallback.
     */

    if (
      transaction.member_code &&
      typeof transaction.member_code === "string"
    ) {
      return transaction.member_code;
    }

    return "-";
  };

  /* =========================================================
     BILL AMOUNT
  ========================================================= */

  const getBillAmount = (transaction) => {
    return Number(
      transaction.bill_amount || 0
    );
  };

  /* =========================================================
     BENEFIT
  ========================================================= */

  const getBenefitAmount = (transaction) => {
    return Number(
      transaction.benefit_amount || 0
    );
  };

  /* =========================================================
     FINAL AMOUNT
  ========================================================= */

  const getFinalAmount = (transaction) => {
    /*
     * Use final_amount from database.
     */

    if (
      transaction.final_amount !== null &&
      transaction.final_amount !== undefined &&
      transaction.final_amount !== ""
    ) {
      return Number(
        transaction.final_amount
      );
    }

    /*
     * Fallback calculation
     */

    return (
      getBillAmount(transaction) -
      getBenefitAmount(transaction)
    );
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  const formatTime = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredTransactions =
    transactions.filter((transaction) => {
      const memberName =
        getMemberName(transaction);

      const memberCode =
        getMemberCode(transaction);

      const billAmount =
        getBillAmount(transaction);

      const benefitAmount =
        getBenefitAmount(transaction);

      const finalAmount =
        getFinalAmount(transaction);

      const searchText = [
        memberName,
        memberCode,
        billAmount,
        benefitAmount,
        finalAmount,
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined
        )
        .join(" ")
        .toLowerCase();

      return searchText.includes(
        search.toLowerCase()
      );
    });

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F8F4EE] pb-20">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center px-5 pt-5">

        <button
          type="button"
          onClick={() => router.push("/")}
          className="
            w-7
            h-7
            rounded
            flex
            items-center
            justify-center
            bg-[#F8F4EE]
          "
        >
          <ArrowLeft size={18} />
        </button>

        <div className="ml-3">

          <h1 className="text-lg font-bold text-[#172033]">
            Transactions
          </h1>

          <p className="text-xs text-gray-500">
            Transaction History
          </p>

        </div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div
        className="
          mx-5
          mt-4
          bg-white
          rounded-xl
          px-4
          py-3
          flex
          items-center
          gap-3
          shadow-sm
        "
      >

        <Search
          size={16}
          className="text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search transactions..."
          className="
            outline-none
            text-xs
            w-full
            text-[#172033]
          "
        />

      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <p className="text-xs text-gray-500 px-5 mt-4">
          Loading transactions...
        </p>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mx-5 mt-4 bg-white rounded-xl p-4 shadow-sm">

          <p className="text-xs text-red-600">
            {error}
          </p>

        </div>
      )}

      {/* =====================================================
          TRANSACTION LIST
      ===================================================== */}

      {!loading && !error && (
        <div className="px-5 mt-4 space-y-3">

          {filteredTransactions.map(
            (transaction) => {

              const memberName =
                getMemberName(
                  transaction
                );

              const memberCode =
                getMemberCode(
                  transaction
                );

              const billAmount =
                getBillAmount(
                  transaction
                );

              const benefitAmount =
                getBenefitAmount(
                  transaction
                );

              const finalAmount =
                getFinalAmount(
                  transaction
                );

              return (
                <div
                  key={transaction.id}
                  className="
                    bg-white
                    rounded-xl
                    p-4
                    shadow-sm
                  "
                >

                  {/* =================================================
                      TOP
                  ================================================= */}

                  <div className="flex items-center">

                    {/* PROFILE */}

                    <div
                      className="
                        w-10
                        h-10
                        rounded-full
                        bg-[#172033]
                        text-white
                        flex
                        items-center
                        justify-center
                        text-xs
                        font-bold
                        flex-shrink-0
                      "
                    >
                      {memberName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* MEMBER */}

                    <div className="ml-3">

                      <p
                        className="
                          text-sm
                          font-bold
                          text-[#172033]
                        "
                      >
                        {memberName}
                      </p>

                      <p
                        className="
                          text-[10px]
                          text-gray-500
                          mt-1
                        "
                      >
                        {memberCode}
                      </p>

                    </div>

                  </div>

                  {/* =================================================
                      AMOUNTS
                  ================================================= */}

                  <div className="mt-3">

                    <div className="flex items-center gap-2">

                      <p
                        className="
                          text-xs
                          font-semibold
                          text-[#172033]
                        "
                      >
                        ₹
                        {billAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <span className="text-gray-300">
                        |
                      </span>

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        Benefit ₹
                        {benefitAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                    {/* FINAL */}

                    <div className="flex items-center justify-between mt-2">

                      <p
                        className="
                          text-xs
                          font-bold
                          text-[#172033]
                        "
                      >
                        Final ₹
                        {finalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <p
                        className="
                          text-[10px]
                          text-gray-500
                        "
                      >
                        {formatTime(
                          transaction.created_at
                        )}
                      </p>

                    </div>

                  </div>

                  {/* =================================================
                      DATE
                  ================================================= */}

                  <div className="flex items-center gap-1 mt-2">

                    <CalendarDays
                      size={11}
                      className="text-gray-400"
                    />

                    <p className="text-[9px] text-gray-400">
                      {formatDate(
                        transaction.created_at
                      )}
                    </p>

                  </div>

                </div>
              );
            }
          )}

          {/* =====================================================
              NO TRANSACTIONS
          ===================================================== */}

          {filteredTransactions.length ===
            0 && (
            <div
              className="
                bg-white
                rounded-xl
                p-6
                text-center
                shadow-sm
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-[#F8F4EE]
                  flex
                  items-center
                  justify-center
                  mx-auto
                "
              >
                <ReceiptText
                  size={18}
                  className="text-[#172033]"
                />
              </div>

              <p
                className="
                  text-xs
                  font-semibold
                  text-[#172033]
                  mt-3
                "
              >
                No transactions found
              </p>

              <p
                className="
                  text-[10px]
                  text-gray-500
                  mt-1
                "
              >
                No transaction records are
                available.
              </p>

            </div>
          )}

        </div>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <SuperAdminFooter />

    </div>
  );
}