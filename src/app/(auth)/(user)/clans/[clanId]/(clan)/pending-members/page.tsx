export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="md:text-2xl">Pending Members</div>
        <div className="p-2 flex max-md:flex-col gap-2 px-4 rounded-lg border border-white/10 bg-[#1C2534]">
          <div className="flex gap-1 items-center">
            <svg className="w-4 h-4"><use href="#svg-tip" /></svg>
            <span className="">Tip</span>
          </div>
          <span>Review member stats and win rates before approving. You can also check their social profiles to verify authenticity.</span>
        </div>
      </div>
      <div className="max-md:hidden w-full bg-[#0E1B2F] p-4 rounded-3xl">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10 text-lg">
              <th className="pl-3 py-6 pr-2 text-left font-normal rounded-l-2xl">Applicant</th>
              <th className="pl-3 py-6 pr-2 text-left font-normal">Win Rate</th>
              <th className="pl-3 py-6 pr-2 text-left font-normal">Total Bets</th>
              <th className="pl-3 py-6 pr-2 text-left font-normal">Earnings</th>
              <th className="pl-3 py-6 pr-2 text-left font-normal">Request Time</th>
              <th className="pl-1 py-6 pr-2 text-left font-normal rounded-r-2xl">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="">
              <td className="pl-3 py-6 pr-2"> Win striker </td>
              <td className="pl-3 py-6 pr-2"> 58.3% </td>
              <td className="pl-3 py-6 pr-2"> 245 </td>
              <td className="pl-3 py-6 pr-2 font-bold"> $1,850 </td>
              <td className="pl-3 py-6 pr-2 font-bold"> 2025-10-20 10:30 </td>
              <td className="w-[200px]">
                <div className="flex gap-2">
                  <button className="py-3 px-6 bg-[#1475E1] rounded-lg cursor-pointer hover:bg-[#3e87da]">Approve</button>
                  <button className="py-3 px-6 bg-[#FEE2E2] rounded-lg cursor-pointer hover:bg-[#f8c7c7] text-[#EF4444]">Reject</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="md:hidden p-6 max-md:p-3 rounded-2xl max-md:rounded-lg w-full bg-[#1475E1]/10 flex flex-col gap-4">
        <div className="text-[32px] leading-12 max-md:text-[18px] max-md:leading-4">Elite Bettors</div>
        <div className="flex justify-between">
          <div className="text-sm flex gap-1"><span className="text-white/70">Total Bets </span><span>245</span></div>
          <div className="text-sm flex gap-1"><span className="text-white/70">Earning </span><span>$1,850</span></div>
          <div className="text-sm flex gap-1"><span className="text-white/70">Win rate </span><span>64.2%</span></div>
        </div>
        <div className="text-sm text-center w-full"><span className="text-white/70">Requested Time </span><span>2025-10-20 10:30</span></div>
        <div className="flex gap-2 w-full">
          <button className="py-3 px-6 max-md:p-2 max-md:text-sm bg-[#1475E1] rounded-lg w-full cursor-pointer hover:bg-[#3e87da]">Approve</button>
          <button className="py-3 px-6 max-md:p-2 max-md:text-sm bg-[#FEE2E2] rounded-lg w-full cursor-pointer hover:bg-[#f8c7c7] text-[#EF4444]">Reject</button>
        </div>
      </div>
    </div>
  )
}

