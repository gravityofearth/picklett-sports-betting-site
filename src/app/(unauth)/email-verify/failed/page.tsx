import Link from "next/link";

export default async function Page() {
  return (
    <div className="w-full flex flex-col items-center gap-4 pt-[100px]">
      <svg className="w-14 h-14"><use href="#svg-expired" /></svg>
      <span className="text-[18px]">Email Verification Failed</span>
      <span className="text-xs">Your email address was not verified</span>
    </div>
  )
}