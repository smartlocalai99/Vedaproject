import Members from "@/pages/members";
import { requireAdminPage } from "@/lib/withAdminPage";

export default Members;
export const getServerSideProps = requireAdminPage();
