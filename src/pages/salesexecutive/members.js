import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Plus,
  UserPlus,
  User,
  Phone,
  Search,
  Trash2,
} from "lucide-react";

import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

import {
  friendlyError,
  showError,
  showSuccess,
  confirmDelete,
} from "@/lib/alerts";

export default function Members() {
  const router = useRouter();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("salesExecutiveSession");

    if (!saved) {
      router.replace("/salesexecutive/login");
      return;
    }

    let session;

    try {
      session = JSON.parse(saved);
    } catch (error) {
      console.error("SESSION PARSE ERROR:", error);
      localStorage.removeItem("salesExecutiveSession");
      router.replace("/salesexecutive/login");
      return;
    }

    if (!session?.id) {
      localStorage.removeItem("salesExecutiveSession");
      router.replace("/salesexecutive/login");
      return;
    }

    loadMembers(session.id);
  }, [router]);

  const loadMembers = async (salesId) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("sales_id", salesId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("LOAD MEMBERS ERROR:", error);

        showError(
          "Could not load members",
          friendlyError(error, "Please try again.")
        );

        setMembers([]);
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.error("LOAD MEMBERS EXCEPTION:", error);

      showError(
        "Could not load members",
        "Something went wrong while loading members."
      );

      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (member) => {
    const confirmation = await confirmDelete(
      "Delete member?",
      `Are you sure you want to delete ${
        member.full_name || "this member"
      }?`
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", member.id);

      if (error) {
        console.error("DELETE MEMBER ERROR:", error);

        showError(
          "Member deletion failed",
          friendlyError(
            error,
            "The member could not be deleted."
          )
        );

        return;
      }

      setMembers((previous) =>
        previous.filter((item) => item.id !== member.id)
      );

      await showSuccess("Member deleted successfully");
    } catch (error) {
      console.error("DELETE MEMBER EXCEPTION:", error);

      showError(
        "Member deletion failed",
        "Something went wrong while deleting the member."
      );
    }
  };

  const filteredMembers = members.filter((member) => {
    const searchText = [
      member.full_name,
      member.member_id,
      member.card_number,
      member.card_id,
      member.mobile_number,
      member.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const formatDate = (date) => {
    if (!date) {
      return "--";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "--";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-24">
      {/* HEADER */}

      <div className="flex items-center justify-between px-5 pt-5">
        <div>
          <h1 className="text-lg font-bold text-[#172033]">
            Members
          </h1>

          <p className="text-xs text-gray-500">
            Manage your registered members
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/salesexecutive/member")}
          className="
            flex
            items-center
            gap-1.5
            rounded-xl
            bg-[#B97943]
            px-3
            py-2
            text-xs
            font-semibold
            text-white
          "
        >
          <Plus size={14} />
          Add Member
        </button>
      </div>

      {/* SEARCH */}

      {members.length > 0 && (
        <div
          className="
            mx-5
            mt-4
            flex
            items-center
            rounded-xl
            bg-white
            px-3
            shadow-sm
          "
        >
          <Search
            size={16}
            className="text-gray-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search members"
            className="
              w-full
              bg-transparent
              px-2
              py-3
              text-sm
              outline-none
            "
          />
        </div>
      )}

      {/* MEMBERS */}

      <div className="mt-4 px-5">
        {loading ? (
          <p className="py-12 text-center text-xs text-gray-500">
            Loading members...
          </p>
        ) : members.length === 0 ? (
          <EmptyState />
        ) : filteredMembers.length === 0 ? (
          <div
            className="
              rounded-xl
              bg-white
              p-5
              text-center
              shadow-sm
            "
          >
            <p className="text-xs text-gray-500">
              No members match your search.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="
                  rounded-xl
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <div className="flex items-center gap-3">
                  {/* PROFILE */}

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      flex-shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#172033]
                      text-white
                    "
                  >
                    <User size={18} />
                  </div>

                  {/* DETAILS */}

                  <div className="min-w-0 flex-1">
                    {/* NAME */}

                    <p
                      className="
                        truncate
                        text-sm
                        font-bold
                        text-[#172033]
                      "
                    >
                      {member.full_name || "Member"}
                    </p>

                    {/* MEMBER ID */}

                    <p className="mt-1 text-[10px] text-gray-500">
                      Member ID:{" "}
                      {member.member_id || "--"}
                    </p>

                    {/* CARD NUMBER */}

                    <p className="mt-1 text-[10px] text-gray-500">
                      Card Number:{" "}
                      {member.card_number ||
                        member.card_id ||
                        "--"}
                    </p>

                    {/* MOBILE */}

                    {member.mobile_number && (
                      <div className="mt-1 flex items-center gap-1">
                        <Phone
                          size={11}
                          className="text-gray-400"
                        />

                        <p className="text-[10px] text-gray-500">
                          {member.mobile_number}
                        </p>
                      </div>
                    )}

                    {/* CREATE DATE */}

                   <p className="mt-1 text-[10px] text-gray-500">
  Create Date:{" "}
  {formatDate(
    member.create_date ||
      member.created_at
  )}
</p>

{/* VALID TILL */}

<p className="mt-1 text-[10px] text-gray-500">
  Valid Till:{" "}
  {formatDate(
    member.valid_till ||
      member.valid_until ||
      (() => {
        const createDate = new Date(
          member.create_date ||
            member.created_at
        );

        createDate.setFullYear(
          createDate.getFullYear() + 1
        );

        return createDate;
      })()
  )}
</p>
</div>

                  {/* DELETE */}

                  <button
                    type="button"
                    aria-label={`Delete ${
                      member.full_name || "member"
                    }`}
                    onClick={() => deleteMember(member)}
                    className="
                      flex
                      h-8
                      w-8
                      flex-shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      text-red-500
                      hover:bg-red-50
                    "
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}

      <Footer />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div
        className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-[#F8F4EE]
          text-[#B97943]
        "
      >
        <UserPlus size={22} />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#172033]">
        No members added yet
      </p>

      <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
        Use the Add Member button above to create the first
        Veda membership card.
      </p>
    </div>
  );
}

