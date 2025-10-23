export default function ClansPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-medium">Pending Members</div>
        <div className="leading-11 flex gap-2 px-4 rounded-lg border border-white/10 bg-[#1C2534]">
          <div className="flex gap-1 items-center">
            <svg className="w-4 h-4"><use href="#svg-tip" /></svg>
            <span className="font-medium">Tip</span>
          </div>
          <span>Review member stats and win rates before approving. You can also check their social profiles to verify authenticity.</span>
        </div>
      </div>
      <div className="w-full bg-[#0E1B2F] p-4 rounded-3xl">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-white/10 text-lg">
              <th className="pl-4 py-6 pr-2 text-left font-normal rounded-l-2xl">Applicant</th>
              <th className="pl-4 py-6 pr-2 text-left font-normal">Win Rate</th>
              <th className="pl-4 py-6 pr-2 text-left font-normal">Total Bets</th>
              <th className="pl-4 py-6 pr-2 text-left font-normal">Earnings</th>
              <th className="pl-4 py-6 pr-2 text-left font-normal">Request Time</th>
              <th className="pl-4 py-6 pr-2 text-left font-normal rounded-r-2xl">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="">
              <td className="pl-4 py-6 pr-2">
                Win striker
              </td>
              <td className="pl-4 py-6 pr-2">
                58.3%
              </td>
              <td className="pl-4 py-6 pr-2">
                245
              </td>
              <td className="pl-4 py-6 pr-2 font-bold">
                $1,850
              </td>
              <td className="pl-4 py-6 pr-2 font-bold">
                2025-10-20 10:30
              </td>
              <td className="w-fit pl-4 py-6 pr-2 flex gap-2 text-sm">
                <button className="py-3 px-6 bg-[#1475E1] rounded-lg cursor-pointer hover:bg-[#3e87da]">Approve</button>
                <button className="py-3 px-6 bg-[#FEE2E2] rounded-lg cursor-pointer hover:bg-[#f8c7c7] text-[#EF4444]">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

