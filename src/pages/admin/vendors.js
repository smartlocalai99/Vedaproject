import Vendors from "@/pages/vendors";
import { requireAdminPage } from "@/lib/withAdminPage";

export default Vendors;
export const getServerSideProps = requireAdminPage();
