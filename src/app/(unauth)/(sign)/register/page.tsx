import RegisterPage from "./components";

export default async function Page({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  const ref = Array.isArray(params.ref) ? params.ref[0] : params.ref ?? "";
  return (
    <RegisterPage params={{ ref }} />
  )
}