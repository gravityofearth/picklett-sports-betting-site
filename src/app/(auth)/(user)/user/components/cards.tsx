export const SideInfoCard = ({ winstreak }: { winstreak: number }) => {
    return (
        <div className="w-[320px] max-xl:w-[200px] shrink-0 flex flex-col gap-5 max-lg:hidden">
            <div className="flex flex-col p-4 bg-[#10182880] border border-[#1E2939] gap-2 rounded-[14px]">
                <div className="flex gap-3 items-center">
                    <svg className="w-[20px] h-[19px]"><use href="#svg-fire" /></svg>
                    <p className="font-semibold">Win Streak Progress</p>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="w-full h-2 rounded-full bg-[#1E2939]">
                        <div className="h-2 rounded-full bg-[#F08105]" style={{ width: `${Math.ceil(winstreak * 100 / (winstreak >= 7 ? 10 : winstreak >= 5 ? 7 : 5))}%` }}></div>
                    </div>
                    <p className="text-[#99A1AF] text-xs">{winstreak}/{winstreak >= 7 ? 10 : winstreak >= 5 ? 7 : 5}  wins to unlock {winstreak >= 7 ? "Gold" : winstreak >= 5 ? "Silver" : "Bronze"} reward</p>
                </div>
            </div>
            <div className="p-4 flex flex-col gap-[18px]">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <svg className="w-4 h-4"><use href="#svg-crown" /></svg>
                        <span className="text-sm font-semibold">Top Bettors</span>
                    </div>
                    <svg className="w-3 h-3"><use href="#svg-refresh" /></svg>
                </div>
                {/* <div className="flex flex-col gap-3">
            <div className="p-2 flex gap-3 items-center">
              <div className="relative flex justify-center items-center w-8">
                <Image alt="top-bettor-avatar-1" width={32} height={32} src="/avatar1.png" />
                <div className="absolute top-[-8px] right-[-8px] w-4 h-4 bg-[#F0B100] rounded-full text-black text-xs text-center">1</div>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex text-sm font-semibold items-center gap-2">
                  CryptoKing
                  <svg className="w-4 h-4"><use href="#svg-crown" /></svg>
                </div>
                <div className="w-full flex justify-between">
                  <p className="text-xs text-[#05DF72] font-semibold">+$2,847</p>
                  <p className="text-xs text-[#99A1AF]">12 streak</p>
                </div>
              </div>
            </div>
            <div className="p-2 flex gap-3 items-center">
              <div className="relative flex justify-center items-center w-8">
                <Image alt="top-bettor-avatar-2" width={32} height={32} src="/avatar2.png" />
                <div className="absolute top-[-8px] right-[-8px] w-4 h-4 bg-[#99A1AF] rounded-full text-black text-xs text-center">2</div>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex text-sm font-semibold items-center gap-2">
                  BetMaster
                  <svg className="w-4 h-4"><use href="#svg-silver" /></svg>
                </div>
                <div className="w-full flex justify-between">
                  <p className="text-xs text-[#05DF72] font-semibold">+$1,923</p>
                  <p className="text-xs text-[#99A1AF]">8 streak</p>
                </div>
              </div>
            </div>
            <div className="p-2 flex gap-3 items-center">
              <div className="relative flex justify-center items-center w-8">
                <Image alt="top-bettor-avatar-3" width={32} height={32} src="/avatar3.png" />
                <div className="absolute top-[-8px] right-[-8px] w-4 h-4 bg-[#F54900] rounded-full text-white text-xs text-center">3</div>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex text-sm font-semibold items-center gap-2">
                  LuckyStrike
                  <svg className="w-4 h-4"><use href="#svg-bronze" /></svg>
                </div>
                <div className="w-full flex justify-between">
                  <p className="text-xs text-[#05DF72] font-semibold">+$1,456</p>
                  <p className="text-xs text-[#99A1AF]">6 streak</p>
                </div>
              </div>
            </div>
          </div> */}
            </div>
            <div className="flex flex-col">
                <div className="flex justify-between items-center p-4">
                    <div className="flex gap-2 items-center">
                        <svg className="w-4 h-4"><use href="#svg-chart" /></svg>
                        <span className="text-sm font-semibold">Live Activity</span>
                    </div>
                    <svg className="w-3 h-3"><use href="#svg-refresh" /></svg>
                </div>
                {/* <div className="p-4 flex gap-3">
            <div className="W-8">
              <Image alt="top-bettor-avatar-1" width={32} height={32} src="/avatar1.png" />
            </div>
            <div className="w-full flex-col gap-1">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">ProGamer99</p>
                <p className="text-xs text-[#6A7282]">2m ago</p>
              </div>
              <p className="text-xs text-[#D1D5DC] font-semibold">Won big <span className="text-[#05DF72]">+$450</span></p>
              <p className="text-xs text-[#D1D5DC] font-semibold">Lakers vs Warriors Over 220.5</p>
              <div className="py-1 px-2 text-xs text-[#05DF72] bg-[#0D542B4D] w-fit rounded-sm mt-1">
                🎉 Big Win!
              </div>
            </div>
          </div>
          <div className="p-4 flex gap-3">
            <div className="W-8">
              <Image alt="top-bettor-avatar-2" width={32} height={32} src="/avatar2.png" />
            </div>
            <div className="w-full flex-col gap-1">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">SportsFan</p>
                <p className="text-xs text-[#6A7282]">5m ago</p>
              </div>
              <p className="text-xs text-[#D1D5DC] font-semibold">placed bet <span className="text-[#00BFFF]">$25</span></p>
              <p className="text-xs text-[#D1D5DC] font-semibold">Chiefs -3.5 vs Bills</p>
            </div>
          </div>
          <div className="p-4 flex gap-3">
            <div className="W-8">
              <Image alt="top-bettor-avatar-3" width={32} height={32} src="/avatar3.png" />
            </div>
            <div className="w-full flex-col gap-1">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">BetWizard</p>
                <p className="text-xs text-[#6A7282]">8m ago</p>
              </div>
              <p className="text-xs text-[#D1D5DC] font-semibold">hit streak <span className="text-[#FDC700]">7 wins</span></p>
              <p className="text-xs text-[#D1D5DC] font-semibold">Unlocked Silver tier</p>
              <div className="py-1 px-2 text-xs text-[#FDC700] bg-[#733E0A4D] w-fit rounded-sm mt-1">
                🏆 Milestone!
              </div>
            </div>
          </div>
          <div className="p-4 flex gap-3">
            <div className="W-8">
              <Image alt="top-bettor-avatar-4" width={32} height={32} src="/avatar1.png" />
            </div>
            <div className="w-full flex-col gap-1">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">RiskyBiz</p>
                <p className="text-xs text-[#6A7282]">12m ago</p>
              </div>
              <p className="text-xs text-[#D1D5DC] font-semibold">lost bet <span className="text-[#FF6467]">-$100</span></p>
              <p className="text-xs text-[#D1D5DC] font-semibold">Cowboys +7 vs Eagles</p>
            </div>
          </div> */}
            </div>
        </div>
    )
}
export const PromoCard = ({ sport, event, icon }: { sport: string, event: string, icon: string }) => {
    return (
        <div className="w-full rounded-[10px] p-3 bg-[#1E2939B2]/70 flex gap-3">
            <div className="w-[25%] shrink-0 ">
                <div className="aspect-square bg-[#283343] rounded-2xl flex justify-center items-center">
                    <svg className="w-[30px] h-[30px] fill-[#01A3DB] stroke-[#01A3DB]"><use href={`#svg-${icon}`} /></svg>
                </div>
            </div>
            <div className="flex flex-col justify-between items-start gap-1">
                <div>
                    <div className="font-semibold text-sm">{sport}</div>
                    <div className="font-normal text-[15px] max-md:text-xs text-[#99A1AF]">{event}</div>
                </div>
                <button className="px-3 text-sm max-md:text-xs max-md:py-2 py-[10px] border-[#00BFFF] border rounded-[10px] font-semibold">Place Bet</button>
            </div>
        </div>
    )
}
export const SportsTab = ({ selected, icon, category, count, onClick }: { selected?: boolean, icon: string, category: string, count?: number, onClick?: () => void }) => {
    return (
        <button onClick={onClick} className={`flex gap-3 items-center ${selected ? "bg-[#004b64]" : "bg-[#1E2939B2]"} border border-[#1E2939B2] px-3 py-[10px] rounded-[10px] whitespace-nowrap select-none cursor-pointer hover:border hover:border-[#01A3DB] disabled:hover:border-[#1E2939B2] disabled:cursor-not-allowed`} disabled={!count || count === 0}>
            <div className="flex items-center gap-[7px]">
                <svg className="w-[14px] h-[14px] fill-white stroke-white"><use href={`#svg-${icon}`} /></svg>
                <div className="text-sm font-semibold">{category}</div>
            </div>
            {count !== undefined && count > 0 && <div className="text-xs font-semibold leading-4 py-[2px] px-2 rounded-full bg-[#4A5565]">{count}</div>}
        </button>
    )
}