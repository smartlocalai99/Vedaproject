import { supabase } from "@/lib/supabase";

export const QR_PRINTER_PARTNER_ROLE = "QR_PRINTER_PARTNER";

export function isQrPrinterPartner(user) {
  return user?.app_metadata?.role === QR_PRINTER_PARTNER_ROLE;
}

export async function getQrPrinterPartnerUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !isQrPrinterPartner(data?.user)) {
    return null;
  }

  return data.user;
}
