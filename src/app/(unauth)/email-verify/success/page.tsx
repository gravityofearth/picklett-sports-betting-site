import Link from "next/link";

export default async function Page() {
  return (
    <div className="w-full flex flex-col items-center gap-4 pt-[100px]">
      <svg className="w-14 h-14"><use href="#svg-success" /></svg>
      <span className="text-[18px]">Email Verified</span>
      <span className="text-xs">Your email address was successfully verified</span>
      <Link href="/login" className="px-4 py-2 bg-blue-600 rounded-md">Back to login</Link>
    </div>
  )
}