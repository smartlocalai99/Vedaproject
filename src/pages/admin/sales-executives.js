import Sales from "@/pages/sales";
import { requireAdminPage } from "@/lib/withAdminPage";

export default Sales;
export const getServerSideProps = requireAdminPage();
