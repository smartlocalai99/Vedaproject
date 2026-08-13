import { useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/lib/alerts";

export default function ChangePassword() {
  const router = useRouter();

  const [form, setForm] = useState({
    next: "",
    confirm: "",
  });

  const [visible, setVisible] = useState({});
  const [saving, setSaving] = useState(false);

  const change = async (event) => {
    event.preventDefault();

    if (form.next.length < 8) {
      return showError(
        "Invalid password",
        "New password must be at least 8 characters."
      );
    }

    if (form.next !== form.confirm) {
      return showError(
        "Password mismatch",
        "New passwords do not match."
      );
    }

    const session = JSON.parse(
      localStorage.getItem("salesExecutiveSession") || "{}"
    );

    if (!session.id) {
      return showError(
        "Session expired",
        "Please login again."
      );
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("sales_executives")
      .update({
        password: form.next,
      })
      .eq("id", session.id)
      .select("id")
      .maybeSingle();

    setSaving(false);

    if (error || !data) {
      return showError(
        "Password Change Failed",
        "Unable to change password. Please try again."
      );
    }

    await showSuccess(
      "Password Changed",
      "Your password has been changed successfully."
    );

    router.push("/salesexecutive/profile");
  };

  return (
    <main className="min-h-screen bg-[#F5F6F8]">
      <header className="bg-white  px-4 py-5 flex items-center gap-4">
        <button
          onClick={() => router.push("/salesexecutive/profile")}
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-xl font-bold text-[#0F1F35]">
          Change Password
        </h1>
      </header>

      <form
        onSubmit={change}
        className="p-5 space-y-5"
      >
        <p className="text-gray-600">
          Use a secure password with at least 8 characters.
        </p>

        {[
          ["next", "New Password"],
          ["confirm", "Confirm New Password"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block mb-2 font-semibold text-[#0F1F35]">
              {label}
            </label>

            <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-white">
              <Lock
                size={20}
                className="text-[#B67A43]"
              />

              <input
                type={visible[key] ? "text" : "password"}
                value={form[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: e.target.value,
                  })
                }
                placeholder={label}
                className="w-full px-3 py-3 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setVisible({
                    ...visible,
                    [key]: !visible[key],
                  })
                }
              >
                {visible[key] ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>
        ))}

        <button
          disabled={saving}
          className="w-full rounded-xl bg-[#B67A43] py-3 font-semibold text-white"
        >
          {saving ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </main>
  );
}




