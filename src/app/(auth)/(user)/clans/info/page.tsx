import Link from "next/link";

export default function ClanInfo() {
  return (
    <div className="flex justify-center">
      <div className="w-full flex flex-col gap-8">
        <Link href="./" className="flex gap-2 items-center cursor-pointer hover:underline">
          <svg className="w-4 h-4 fill-white"><use href="#svg-left-arrow" /></svg>
          <span className="select-none">Back to Clan</span>
        </Link>
        <p className="text-2xl text-center">Global Perks</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/10">
                <th className="pl-6 py-4 pr-2 text-left text-sm font-normal rounded-l-2xl">Clan Level</th>
                <th className="py-4 px-2 text-left text-sm font-normal">Name</th>
                <th className="py-4 px-2 text-left text-sm font-normal">Requirements (XP/Activity)</th>
                <th className="pl-2 py-6 pr-6 text-left text-sm text-[#D1D5DC] rounded-r-2xl">Perks Unlocked</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pl-6 py-4 pr-2 text-center align-text-top">1</td>
                <td className="py-4 px-2 align-text-top">Formed</td>
                <td className="py-4 px-2 align-text-top">Create / join a clan</td>
                <td className="pl-2 py-4 pr-6"><span className="font-bold">-</span> Eligible for Clan Leaderboard</td>
              </tr>
              <tr>
                <td className="pl-6 py-4 pr-2 text-center align-text-top">2</td>
                <td className="py-4 px-2 align-text-top">United</td>
                <td className="py-4 px-2 align-text-top">5,000 Clan XP</td>
                <td className="pl-2 py-4 pr-6 flex flex-col gap-2">
                  <div><span className="font-bold">- Clan coffer</span> (deposit + weekly distribution)</div>
                  <div><span className="font-bold">-</span> Clan Banner customization</div>
                </td>
              </tr>
              <tr>
                <td className="pl-6 py-4 pr-2 text-center align-text-top">3</td>
                <td className="py-4 px-2 align-text-top">Rising</td>
                <td className="py-4 px-2 align-text-top">20,000 Clan XP</td>
                <td className="pl-2 py-4 pr-6 flex flex-col gap-2">
                  <div><span className="font-bold">- Boosted Odds +0.01</span> (bets &#8804; $20)</div>
                  <div><span className="font-bold">-</span> Access to <span className="font-bold">Tier I Clan Tournaments</span> (small pools)</div>
                </td>
              </tr>
              <tr>
                <td className="pl-6 py-4 pr-2 text-center align-text-top">4</td>
                <td className="py-4 px-2 align-text-top">Elite</td>
                <td className="py-4 px-2 align-text-top">50,000 Clan XP</td>
                <td className="pl-2 py-4 pr-6 flex flex-col gap-2">
                  <div><span className="font-bold">- Boosted Odds +0.02</span> (capped per bet)</div>
                  <div><span className="font-bold">-</span> Clan-wide <span className="font-bold">Weekly Reload Bonus</span></div>
                </td>
              </tr>
              <tr>
                <td className="pl-6 py-4 pr-2 text-center align-text-top">5</td>
                <td className="py-4 px-2 align-text-top">Legendary</td>
                <td className="py-4 px-2 align-text-top">100,000 Clan XP</td>
                <td className="pl-2 py-4 pr-6 flex flex-col gap-2">
                  <div><span className="font-bold">-</span> Access to <span className="font-bold">Exclusive Blaze Tournaments</span> (jackpot pools)</div>
                  <div><span className="font-bold">- Monthly Clan Buff</span> (random bonus: e.g. free bet, reduced withdrawal fees)</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}