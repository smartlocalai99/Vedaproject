export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/qr-printer/login",
      permanent: false,
    },
  };
}

export default function QrPrinterEntry() {
  return null;
}
