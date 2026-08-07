import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Test() {

  useEffect(() => {

    async function loadSales() {

      const { data, error } = await supabase
        .from("sales_executives")
        .select("*");

      console.log(data);
      console.log(error);

    }

    loadSales();

  }, []);

  return (
    <div className="p-10">
      Supabase Connected Successfully
    </div>
  );
}