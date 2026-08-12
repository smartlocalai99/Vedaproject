import {
  ChevronDown,
  ArrowLeft,
  Search,
  UserRound,
  Phone,
  BadgeCheck,
  ReceiptText,
  IndianRupee,
  CalendarDays,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import SuperAdminFooter from "@/components/SuperAdminFooter";
import { supabase } from "@/lib/supabase";

export default function Members() {
  const router = useRouter();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sales Executives
  const [salesExecutives, setSalesExecutives] = useState([]);

  // Selected member
  const [selectedMember, setSelectedMember] = useState(null);

  // Member statistics
  const [memberStats, setMemberStats] = useState({
    transactions: 0,
    benefits: 0,
  });

  const [statsLoading, setStatsLoading] = useState(false);

  /* =========================================================
     LOAD MEMBERS
  ========================================================= */

  const loadMembers = async () => {
    setLoading(true);

    const { data, error: loadError } = await supabase
      .from("members")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (loadError) {
      console.log("MEMBERS LOAD ERROR:", loadError);

      setError(loadError.message);
      setMembers([]);
    } else {
      setError("");
      setMembers(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  /* =========================================================
     LOAD SALES EXECUTIVES
  ========================================================= */

  useEffect(() => {
    const loadSalesExecutives = async () => {
      const { data, error: salesError } = await supabase
        .from("sales_executives")
        .select("id, employee_id, full_name")
        .order("full_name");

      if (salesError) {
        console.log(
          "SALES EXECUTIVES LOAD ERROR:",
          salesError
        );

        setSalesExecutives([]);
      } else {
        setSalesExecutives(data || []);
      }
    };

    loadSalesExecutives();
  }, []);

  /* =========================================================
     GET SALES EXECUTIVE NAME
  ========================================================= */

  const getSalesExecutiveName = (salesId) => {
    if (!salesId) return "-";

    const sales = salesExecutives.find(
      (item) => String(item.id) === String(salesId)
    );

    if (!sales) return "-";

    return sales.full_name || "-";
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     OPEN MEMBER DETAILS
  ========================================================= */

  const openMemberDetails = async (member) => {
    setSelectedMember(member);

    setStatsLoading(true);

    let transactionCount = 0;
    let benefitTotal = 0;

    try {
      const { data, error: transactionError } = await supabase
        .from("transactions")
        .select("id, benefit_amount")
        .eq("member_id", member.id);

      if (!transactionError && data) {
        transactionCount = data.length;

        benefitTotal = data.reduce(
          (total, transaction) =>
            total +
            Number(transaction.benefit_amount || 0),
          0
        );
      }

      setMemberStats({
        transactions: transactionCount,
        benefits: benefitTotal,
      });
    } catch (err) {
      console.log(
        "MEMBER DETAILS ERROR:",
        err
      );

      setMemberStats({
        transactions: 0,
        benefits: 0,
      });
    }

    setStatsLoading(false);
  };

  /* =========================================================
     CLOSE MEMBER DETAILS
  ========================================================= */

  const closeMemberDetails = () => {
    setSelectedMember(null);

    setMemberStats({
      transactions: 0,
      benefits: 0,
    });
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredMembers = members.filter((member) => {
    const searchText = [
      member.full_name,
      member.name,
      member.member_id,
      member.card_number,
      member.mobile_number,
      member.phone,
      member.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(
      search.toLowerCase()
    );
  });

  /* =========================================================
     MEMBER DETAILS VIEW
  ========================================================= */

  if (selectedMember) {
    return (
      <div className="min-h-screen bg-[#F8F4EE] pb-20">

        {/* HEADER */}

        <div className="flex items-center px-5 pt-5">

          <button
            type="button"
            onClick={closeMemberDetails}
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
              Member
            </h1>

            <p className="text-xs text-gray-500">
              Member Details
            </p>

          </div>

        </div>

        {/* MEMBER PROFILE */}

        <div className="mx-5 mt-5 bg-white rounded-xl p-5 shadow-sm">

          <div className="flex items-center">

            {/* PROFILE CIRCLE */}

            <div
              className="
                w-16
                h-16
                rounded-full
                bg-[#172033]
                text-white
                flex
                items-center
                justify-center
                text-lg
                font-bold
              "
            >
              {(
                selectedMember.full_name ||
                selectedMember.name ||
                "M"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            {/* MEMBER NAME */}

            <div className="ml-4">

              <h2 className="text-lg font-bold text-[#172033]">
                {selectedMember.full_name ||
                  selectedMember.name ||
                  "Member"}
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                {selectedMember.member_id || "-"}
              </p>

            </div>

          </div>

          {/* MEMBER BASIC DETAILS */}

          <div className="mt-5 space-y-3">

            {/* CARD NUMBER */}

            <DetailRow
              icon={<BadgeCheck size={15} />}
              label="Card Number"
              value={
                selectedMember.card_number || "-"
              }
            />

            {/* MOBILE */}

            <DetailRow
              icon={<Phone size={15} />}
              label="Mobile"
              value={
                selectedMember.mobile_number ||
                selectedMember.phone ||
                "-"
              }
            />

            {/* CREATE DATE */}

            <DetailRow
              icon={<CalendarDays size={15} />}
              label="Create Date"
              value={formatDate(
                selectedMember.created_at
              )}
            />

            {/* VALID TILL */}

            <DetailRow
              icon={<CalendarDays size={15} />}
              label="Valid Till"
              value={formatDate(
                selectedMember.valid_till
              )}
            />

            {/* SALES EXECUTIVE */}

            <DetailRow
              icon={<UserRound size={15} />}
              label="Sales Executive"
              value={getSalesExecutiveName(
                selectedMember.sales_id
              )}
            />


          </div>

        </div>

        {/* MEMBER ACTIVITY */}

        <div className="mx-5 mt-4">

          <h2 className="text-sm font-bold text-[#172033] mb-2">
            Activity Summary
          </h2>

          <div className="space-y-2">

            {/* TRANSACTIONS */}

            <MemberStat
              icon={<ReceiptText size={18} />}
              title="Transactions"
              value={
                statsLoading
                  ? "..."
                  : memberStats.transactions
              }
            />

            {/* BENEFITS */}

            <MemberStat
              icon={<IndianRupee size={18} />}
              title="Benefits Received"
              value={
                statsLoading
                  ? "..."
                  : `₹${Number(
                      memberStats.benefits
                    ).toLocaleString("en-IN")}`
              }
            />

          </div>

        </div>

        <SuperAdminFooter />

      </div>
    );
  }

  /* =========================================================
     MAIN MEMBERS LIST
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F8F4EE] pb-20">

      {/* HEADER */}

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
            Members
          </h1>

          <p className="text-xs text-gray-500">
            Manage all members
          </p>

        </div>

      </div>

      {/* SEARCH */}

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
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search members..."
          className="
            outline-none
            text-xs
            w-full
          "
        />

      </div>

      {/* LOADING */}

      {loading && (
        <p className="text-xs text-gray-500 px-5 mt-4">
          Loading members...
        </p>
      )}

      {/* ERROR */}

      {error && (
        <p className="text-xs text-red-500 px-5 mt-4">
          {error}
        </p>
      )}

      {/* MEMBERS LIST */}

      <div className="px-5 mt-3 space-y-3">

        {filteredMembers.map((member) => {

          const memberName =
            member.full_name ||
            member.name ||
            "Member";

          const memberId =
            member.member_id ||
            "-";

          const memberStatus =
            member.status ||
            "Active";

          return (
            <div
              key={member.id}
              className="
                bg-white
                rounded-xl
                p-4
                shadow-sm
              "
            >

              <div className="flex items-center justify-between">

                {/* CLICKABLE MEMBER */}

                <button
                  type="button"
                  onClick={() =>
                    openMemberDetails(member)
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    text-left
                    flex-1
                  "
                >

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
                    "
                  >
                    {memberName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  {/* NAME + ID */}

                  <div>

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
                      {memberId}
                    </p>

                    <p
                      className="
                        text-[10px]
                        text-gray-500
                        mt-1
                      "
                    >
                      Card Number:{" "}
                      {member.card_number || "-"}
                    </p>

                    {/* CREATE DATE */}

                    <p
                      className="
                        text-[10px]
                        text-gray-500
                        mt-1
                      "
                    >
                      Create Date:{" "}
                      {formatDate(
                        member.created_at
                      )}
                    </p>

                    {/* VALID TILL */}

                    <p
                      className="
                        text-[10px]
                        text-gray-500
                        mt-1
                      "
                    >
                      Valid Till:{" "}
                      {formatDate(
                        member.valid_till
                      )}
                    </p>

                  </div>

                </button>

                {/* STATUS + DOWN ARROW */}

                <div className="flex items-center gap-3">

                  {/* STATUS */}

                  <span
                    className={`
                      text-[10px]
                      font-medium
                      ${
                        memberStatus === "Active"
                          ? "text-green-700"
                          : "text-red-600"
                      }
                    `}
                  >
                    {memberStatus}
                  </span>

                  {/* DOWN ARROW */}

                  <button
                    type="button"
                    onClick={() =>
                      openMemberDetails(member)
                    }
                    className="
                      w-8
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-[#F8F4EE]
                      text-[#172033]
                    "
                  >
                    <ChevronDown
                      size={16}
                      strokeWidth={2}
                    />
                  </button>

                </div>

              </div>

            </div>
          );
        })}

        {/* NO MEMBERS */}

        {!loading &&
          filteredMembers.length === 0 && (
            <div
              className="
                bg-white
                rounded-xl
                p-5
                text-center
                shadow-sm
              "
            >
              <p className="text-xs text-gray-500">
                No members found.
              </p>
            </div>
          )}

      </div>

      <SuperAdminFooter />

    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className="
          w-7
          h-7
          rounded-full
          bg-[#F8F4EE]
          flex
          items-center
          justify-center
          text-[#172033]
        "
      >
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-[10px] text-gray-500">
          {label}
        </p>

        <p className="text-xs font-semibold text-[#172033] mt-0.5">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   MEMBER STAT
========================================================= */

function MemberStat({
  icon,
  title,
  value,
}) {
  return (
    <div
      className="
        bg-white
        rounded-xl
        px-4
        py-3
        shadow-sm
        flex
        items-center
        justify-between
      "
    >

      <div className="flex items-center gap-3">

        <div
          className="
            w-9
            h-9
            rounded-full
            bg-[#F8F4EE]
            flex
            items-center
            justify-center
            text-[#B97943]
          "
        >
          {icon}
        </div>

        <p className="text-xs font-semibold text-[#172033]">
          {title}
        </p>

      </div>

      <p className="text-sm font-bold text-[#172033]">
        {value}
      </p>

    </div>
  );
}