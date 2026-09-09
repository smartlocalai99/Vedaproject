import Transactions from "@/pages/transactions";
import { requireAdminPage } from "@/lib/withAdminPage";

export default Transactions;
export const getServerSideProps = requireAdminPage();
