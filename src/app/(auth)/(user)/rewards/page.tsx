export default function Rewards() {
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-7xl flex flex-col gap-13">
                <div className="flex flex-col gap-2">
                    <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Picklett Rewards</h1>
                    <p className="text-[#99A1AF]">Loyalty rewards that grow as you play. Unlock bigger milestones the more you wager.</p>
                </div>
                {/* <div className="flex flex-col gap-5 bg-linear-to-r from-[#733E0A33] to-[#7E2A0C33] rounded-lg border border-[#894B004D] p-6">
                    <div className="flex gap-3 items-center">
                        <svg className="w-5 h-5"><use href="#svg-star" /></svg>
                        <h1 className="text-[18px]">Next Reward</h1>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-[#D1D5DC]">Progress to Blaze</p>
                        <div className="w-full rounded-full h-3 bg-[#FFFFFF1A]">
                            <div className="w-2/5 h-3 rounded-full bg-linear-to-r from-[#F0B100] to-[#FF6900]"></div>
                        </div>
                        <p className="text-xs text-[#99A1AF]">$2,500 more wagers to unlock <span className="text-[#FDC700]">Blaze</span> tier</p>
                    </div>

                </div>
                <div className="grid grid-cols-3 max-2xl:grid-cols-2 max-md:grid-cols-1 gap-8">
                    <TierCard status="pass" tierName="Spark" msgs={["5% Monthly Bonus", "2% Rakeback", "Basic Support", "Weekly Rewards"]} />
                    <TierCard status="current" tierName="Flame" msgs={["10% Monthly Bonus", "5% Rakeback", "Priority Support", "Daily Rewards", "Exclusive Tournaments"]} />
                    <TierCard status="goal" tierName="Blaze" msgs={["15% Monthly Bonus", "8% Rakeback", "VIP Support", "Hourly Rewards", "Private Tournaments", "Reload Bonuses"]} />
                    <TierCard status="goal" tierName="Inferno" msgs={["20% Monthly Bonus", "12% Rakeback", "Dedicated Support", "Real-time Rewards", "Exclusive Events", "Premium Reload Bonuses", "Custom Limits"]} />
                    <TierCard status="goal" tierName="Radiant" msgs={["25% Monthly Bonus", "15% Rakeback", "Personal Account Manager", "Instant Rewards", "VIP-Only Events", "Maximum Reload Bonuses", "No Limits", "Early Access Features"]} />
                </div>
                <div className="grid grid-cols-3 max-md:grid-cols-1 gap-8">
                    <TierRankCard tier="Gold" />
                    <TierRankCard tier="Silver" />
                    <TierRankCard tier="Bronze" />
                </div> */}
                <div>Page under construction</div>
            </div>
        </div>
    )
}

const TierRankCard = ({ tier }: { tier: "Gold" | "Silver" | "Bronze" }) => {
    return (
        <div className={`w-full p-6 rounded-2xl bg-linear-to-r border flex flex-col gap-4 ${tier === "Gold" ? "border-[#A65F004D] from-[#733E0A4D] to-[#894B0033]" : tier === "Silver" ? "border-[#4A55654D] from-[#3641534D] to-[#4A556533]" : "border-[#CA35004D] from-[#7E2A0C4D] to-[#9F2D0033]"}`}>
            <div className="flex gap-3 items-center">
                <svg className="w-8 h-8"><use href={`#svg-${tier}-tier`} /></svg>
                <div className="flex flex-col">
                    <h1 className="text-[18px] leading-[28px]">{tier} Tier</h1>
                    <p className={`text-sm ${tier === "Gold" ? "text-[#FDC700]" : tier === "Silver" ? "text-[#99A1AF]" : "text-[#FF8904]"}`}>{tier === "Gold" ? "Elite Status" : tier === "Silver" ? "Advanced Status" : "Rising Star"}</p>
                </div>
            </div>
            <p className="text-sm text-[#D1D5DC]">{tier === "Gold" ? "Unlock exclusive bonuses and premium features" : tier === "Silver" ? "Enhanced rewards and priority support" : "Your journey to greatness begins here"}</p>
        </div>
    )
}
const TierCard = ({ status, tierName, msgs }: { status: "pass" | "current" | "goal", tierName: "Spark" | "Flame" | "Blaze" | "Inferno" | "Radiant", msgs: string[] }) => {
    return (
        <div className={`w-full h-full flex flex-col gap-6 items-center p-8 rounded-3xl ${status === "current" ? "bg-linear-to-r from-[#10182880] to-[#1E29394D] border-2 border-[#00BFFF66] shadow-2xl shadow-[#00BFFF33]" : "bg-[#242C3C]"}`}>
            <div className={`w-20 h-20 flex items-center justify-center rounded-2xl ${tierName === "Radiant" ? "shadow-lg shadow-[#C27AFF] bg-linear-to-r from-[#C27AFF] via-[#00BFFF] to-[#9810FA]" : status === "pass" ? "bg-[#9098A6] shadow-sm shadow-[#99A1AF40]" : status === "current" ? "bg-[#01A3DB] shadow-lg shadow-[#FDC70040]" : "bg-[#FFFFFF01] shadow-md shadow-[#00BFFF4D]"}`}>
                <svg className="w-9 h-9"><use href={`#svg-${tierName}-tier`}/></svg>
            </div>
            <div className="flex flex-col gap-3 items-center">
                <h1 className="text-2xl">{tierName}</h1>
                <p>${tierName === "Spark" ? "2,000" : tierName === "Flame" ? "25,000" : tierName === "Blaze" ? "250,000" : tierName === "Inferno" ? "2,500,000" : "25,000,000"} total wager</p>
            </div>
            <div className="w-full flex flex-col gap-3">
                {msgs.map((item, index) =>
                    <div key={index} className="w-full flex gap-3 items-center justify-start">
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full ${status === "goal" ? "bg-[#676767]" : "bg-[#00BC7D]"}`}>
                            {status === "goal" ?
                                <div className="w-2 h-2 bg-[#FFFFFF] rounded-full" /> :
                                <svg className="w-[9px] h-[6px]"><use href="#svg-check" /></svg>
                            }
                        </div>
                        <p className="text-sm">{item}</p>
                    </div>)}
            </div>
        </div>
    )
}
