import {
  Download,
  LoaderCircle,
  LogOut,
  QrCode,
  Search,
  User,
  X,
} from "lucide-react";

import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { getQrPrinterPartnerUser } from "@/lib/qrPrinterPartner";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

function safeFilename(member) {
  const card = String(
    member.card_number || "member"
  ).replace(/[^a-zA-Z0-9_-]/g, "");

  const name = String(
    member.full_name || "member"
  )
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${card}-${name || "member"}-QR.png`;
}

async function createQrDataUrl(cardNumber) {
  if (!cardNumber) {
    throw new Error("Missing card number");
  }

  const QRCode = await import("qrcode");

  return QRCode.toDataURL(String(cardNumber), {
    width: 1400,
    margin: 6,
    errorCorrectionLevel: "H",
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  });
}

export default function QrPrinterDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMember, setSelectedMember] =
    useState(null);

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);

  /* =====================================================
     LOAD MEMBERS
     ===================================================== */

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const token =
        sessionData.session?.access_token;

      /* =================================================
         LOCAL LOGIN
         ================================================= */

      if (!token) {
        if (
          localStorage.getItem(
            "qr_printer_logged_in"
          ) === "true"
        ) {
          let localQuery = supabase
            .from("members")
            .select(
              "id, full_name, card_number, created_at"
            )
            .not("card_number", "is", null)
            .order("created_at", {
              ascending: false,
            });

          if (search) {
            const safeSearch = search.replace(
              /[%,()]/g,
              " "
            );

            localQuery = localQuery.or(
              `full_name.ilike.%${safeSearch}%,card_number.ilike.%${safeSearch}%`
            );
          }

          const {
            data: localMembers,
            error: localError,
          } = await localQuery;

          if (localError) {
            console.error(
              "QR PRINTER MEMBER LOAD ERROR:",
              localError
            );

            setError(
              "Members are not readable with the current Supabase access settings. Please review the members SELECT policy."
            );

            setMembers([]);
          } else {
            setError("");
            setMembers(
              localMembers || []
            );
          }

          return;
        }

        throw new Error("SESSION_EXPIRED");
      }

      /* =================================================
         API LOGIN
         ================================================= */

      const params = new URLSearchParams({
        search,
      });

      const response = await fetch(
        `/api/qr-printer/members?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json().catch(
          () => ({})
        );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        await supabase.auth.signOut();

        await router.replace(
          "/qr-printer/login"
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "MEMBERS_LOAD_FAILED"
        );
      }

      setMembers(result.members || []);
    } catch (loadError) {
      console.error(
        "QR PRINTER MEMBERS LOAD ERROR:",
        loadError
      );

      if (
        loadError.message ===
        "SESSION_EXPIRED"
      ) {
        if (
          router.pathname !==
          "/qr-printer/login"
        ) {
          await router.replace(
            "/qr-printer/login"
          );
        }

        return;
      }

      setMembers([]);

      setError(
        "Unable to load members. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [router, search]);

  /* =====================================================
     CHECK USER
     ===================================================== */

  useEffect(() => {
    let cancelled = false;

    getQrPrinterPartnerUser().then(
      async (partnerUser) => {
        if (cancelled) return;

        if (!partnerUser) {
          if (
            localStorage.getItem(
              "qr_printer_logged_in"
            ) === "true"
          ) {
            setUser({
              local: true,
              user_metadata: {
                full_name: "annad",
              },
            });

            return;
          }

          await supabase.auth.signOut();

          if (
            router.pathname !==
            "/qr-printer/login"
          ) {
            router.replace(
              "/qr-printer/login"
            );
          }

          return;
        }

        setUser(partnerUser);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [router]);

  /* =====================================================
     LOAD MEMBERS AFTER LOGIN
     ===================================================== */

  useEffect(() => {
    if (!user) return undefined;

    const loadTimer =
      window.setTimeout(() => {
        loadMembers();
      }, 0);

    return () =>
      window.clearTimeout(loadTimer);
  }, [user, loadMembers]);

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  /* =====================================================
     QR PREVIEW
     ===================================================== */

  const openPreview = async (member) => {
    setSelectedMember(member);
    setQrDataUrl("");
    setActionError("");
    setQrLoading(true);

    try {
      setQrDataUrl(
        await createQrDataUrl(
          member.card_number
        )
      );
    } catch (qrError) {
      console.error(
        "QR GENERATION ERROR:",
        qrError
      );

      setActionError(
        "Unable to generate this QR code. Please try again."
      );
    } finally {
      setQrLoading(false);
    }
  };

  /* =====================================================
     DOWNLOAD QR
     ===================================================== */

  const downloadQr = async (member) => {
    setActionError("");

    try {
      const dataUrl =
        selectedMember?.id === member.id &&
        qrDataUrl
          ? qrDataUrl
          : await createQrDataUrl(
              member.card_number
            );

      const link =
        document.createElement("a");

      link.href = dataUrl;
      link.download =
        safeFilename(member);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (downloadError) {
      console.error(
        "QR DOWNLOAD ERROR:",
        downloadError
      );

      setActionError(
        "Unable to download the QR code. Please try again."
      );
    }
  };

  /* =====================================================
     LOGOUT
     ===================================================== */

  const logout = async () => {
    localStorage.removeItem(
      "qr_printer_logged_in"
    );

    await supabase.auth.signOut();

    if (
      router.pathname !==
      "/qr-printer/login"
    ) {
      router.replace(
        "/qr-printer/login"
      );
    }
  };

  return (
    <main className="qr-printer-safe-bottom min-h-screen w-full overflow-x-hidden bg-[#F7F7F7] pb-10 text-[#172033]">

      {/* HEADER */}

      <header className="qr-printer-safe-top sticky top-0 z-20 border-b border-[#E9E2DC] bg-[#172033] text-white shadow-sm">

        <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4">

          <div>
            <p className="truncate text-base font-bold tracking-wide sm:text-lg">
              VEDA MINDS
            </p>

            <p className="truncate text-[10px] font-medium text-[#E9C2A1] sm:text-xs">
              QR PRINTER PARTNER
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">

            <span className="hidden text-sm text-gray-300 sm:inline">
              Dashboard
            </span>

            <button
              onClick={() =>
                router.push(
                  "/qr-printer/profile"
                )
              }
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-white/10 sm:px-3"
              aria-label="Profile"
            >
              <User size={17} />

              <span className="hidden sm:inline">
                Profile
              </span>
            </button>

            <button
              onClick={logout}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-[#B97943] px-2 py-2 text-sm font-semibold hover:bg-[#B97943] sm:px-3"
              aria-label="Logout"
            >
              <LogOut size={17} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6">

        <h1 className="text-2xl font-bold">
          QR Printer Partner
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          View and download print-ready QR
          codes for registered members.
        </p>

        {installPrompt && (
          <button
            type="button"
            onClick={installApp}
            className="mt-4 min-h-11 w-full rounded-xl border border-[#B97943] bg-white px-4 py-3 text-sm font-semibold text-[#8a5028] hover:bg-[#fff8f3]"
          >
            Install vedaqrprinter
          </button>
        )}

        {/* SEARCH */}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(
              searchInput.trim()
            );
          }}
          className="mt-6 flex w-full flex-col gap-2 sm:flex-row"
        >

          <label className="relative block min-w-0 flex-1">

            <Search
              size={19}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-[#E9E2DC] bg-white py-3 pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-[#B97943]"
              placeholder="Search by name or card number"
            />

          </label>

          <button
            type="submit"
            className="min-h-11 w-full rounded-xl bg-[#B97943] px-4 py-3 font-semibold text-white hover:bg-[#9f6234] sm:w-auto"
          >
            Search
          </button>

        </form>

        {/* ERRORS */}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        {/* MEMBERS */}

        {loading ? (
          <div className="flex justify-center py-20 text-gray-600">

            <LoaderCircle className="mr-2 animate-spin" />

            Loading members...

          </div>
        ) : members.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#E9E2DC] bg-white p-12 text-center text-gray-600">
            No members found.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {members.map((member) => (
              <article
                key={member.id}
                className="rounded-2xl border border-[#E9E2DC] bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <h2
                      className="truncate text-lg font-bold"
                      title={
                        member.full_name || "-"
                      }
                    >
                      {member.full_name || "-"}
                    </h2>

                    <p className="mt-1 break-all font-mono text-sm text-[#B97943]">
                      {member.card_number || "-"}
                    </p>

                  </div>

                  <QrCode
                    className="shrink-0 text-[#B97943]"
                  />

                </div>

                <dl className="mt-5 space-y-2 text-sm">

                  <div className="flex justify-between gap-3">

                    <dt className="text-gray-500">
                      Start Date
                    </dt>

                    <dd className="text-right font-medium">
                      {formatDate(
                        member.created_at
                      )}
                    </dd>

                  </div>

                  <div className="flex justify-between gap-3">

                    <dt className="text-gray-500">
                      QR Status
                    </dt>

                    <dd className="font-medium text-emerald-700">
                      Ready to print
                    </dd>

                  </div>

                </dl>

                <div className="mt-5 grid grid-cols-2 gap-2">

                  <button
                    onClick={() =>
                      openPreview(member)
                    }
                    className="rounded-lg border border-[#B97943] px-3 py-2.5 text-sm font-semibold text-[#8a5028] hover:bg-[#fff8f3]"
                  >
                    View QR
                  </button>

                  <button
                    onClick={() =>
                      downloadQr(member)
                    }
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#172033] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#111827]"
                  >
                    <Download size={16} />
                    Download
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      {/* QR PREVIEW */}

      {selectedMember && (
        <div
          className="fixed inset-0 z-30 flex items-end overflow-y-auto bg-black/50 p-0 sm:items-center sm:justify-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="QR code preview"
        >

          <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-4 sm:rounded-3xl sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-bold tracking-wider text-[#B97943]">
                  VEDA MINDS
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  QR Code Preview
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedMember(null)
                }
                className="min-h-11 min-w-11 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close preview"
              >
                <X />
              </button>

            </div>

            <div className="mt-5 text-center">

              <p className="break-words font-bold">
                {selectedMember.full_name ||
                  "-"}
              </p>

              <p className="mt-1 break-all font-mono text-sm text-[#B97943]">
                {selectedMember.card_number}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Start Date:{" "}
                {formatDate(
                  selectedMember.created_at
                )}
              </p>

              <div className="mx-auto mt-5 w-full max-w-sm rounded-xl border border-[#E9E2DC] bg-white p-3 sm:p-4">

                {qrLoading ? (
                  <div className="flex aspect-square items-center justify-center">

                    <LoaderCircle className="animate-spin text-[#B97943]" />

                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${selectedMember.card_number}`}
                    className="block h-auto max-w-full w-full"
                  />
                ) : (
                  <p className="py-10 text-sm text-red-700">
                    Unable to generate QR code.
                  </p>
                )}

              </div>

              <button
                disabled={!qrDataUrl}
                onClick={() =>
                  downloadQr(selectedMember)
                }
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#172033] px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                <Download size={18} />
                Download QR
              </button>

            </div>

          </section>

        </div>
      )}

    </main>
  );
}
