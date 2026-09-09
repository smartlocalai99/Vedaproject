import { readAdminToken } from "@/lib/adminAuth";

export function requireAdminPage(getProps) {
  return async function getServerSideProps(context) {
    const session = readAdminToken(context.req);
    if (!session) {
      return {
        redirect: { destination: "/admin/login", permanent: false },
      };
    }

    const props = getProps ? await getProps(context, session) : {};
    return { props: props || {} };
  };
}
