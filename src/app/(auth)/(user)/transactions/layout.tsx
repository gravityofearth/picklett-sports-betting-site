import type React from "react"
export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Transactions</h1>
          <p className="text-[#99A1AF]">You can see all transaction histories here</p>
        </div>
        {children}
      </div>
    </div>
  )
}