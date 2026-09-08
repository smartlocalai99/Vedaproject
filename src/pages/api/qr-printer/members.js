import { createClient } from "@supabase/supabase-js";
import { QR_PRINTER_PARTNER_ROLE } from "@/lib/qrPrinterPartner";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PAGE_SIZE = 25;

function getAccessToken(req) {
  const authorization = String(req.headers.authorization || "");
  return authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed." });
  }

  try {
    const token = getAccessToken(req);
    if (!token) {
      return res.status(401).json({ message: "Please log in again." });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(token);
    const user = authData?.user;

    if (authError || user?.app_metadata?.role !== QR_PRINTER_PARTNER_ROLE) {
      return res.status(403).json({ message: "You are not authorized to view members." });
    }

    const requestedPage = Number.parseInt(req.query.page, 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const search = String(req.query.search || "").trim().slice(0, 100);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabaseAdmin
      .from("members")
      .select("id, full_name, card_number, created_at", { count: "exact" })
      .not("card_number", "is", null)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      const safeSearch = search.replace(/[%_,()]/g, " ");
      query = query.or(
        `full_name.ilike.%${safeSearch}%,card_number.ilike.%${safeSearch}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("QR PRINTER MEMBER LOAD ERROR:", error);
      return res.status(500).json({ message: "Unable to load members right now." });
    }

    return res.status(200).json({
      members: data || [],
      page,
      pageSize: PAGE_SIZE,
      total: count || 0,
    });
  } catch (error) {
    console.error("QR PRINTER MEMBERS API ERROR:", error);
    return res.status(500).json({ message: "Unable to load members right now." });
  }
}
