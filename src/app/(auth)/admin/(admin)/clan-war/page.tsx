"use client"

export default function ClanWarCreation() {
    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <span>Select War Type</span>
                <select name="war type" id="war-type" className="border border-white/20 p-2">
                    <option value="24hr-war">
                        24 Hours War
                    </option>
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <span>Prize Pool</span>
                <input type="number" className="border border-white/20 p-2" />
            </div>
            <div className="flex flex-col gap-2">
                <span>Clan Stake</span>
                <input type="number" className="border border-white/20 p-2" />
            </div>
            <div className="flex flex-col gap-2">
                <span>Number of Clans</span>
                <input type="number" className="border border-white/20 p-2" />
            </div>
            <div className="flex flex-col gap-2">
                <span>Number of members minimum per clan</span>
                <input type="number" className="border border-white/20 p-2" />
            </div>
            <div className="flex justify-center"><button className="w-40 bg-[#1475E1] rounded-lg px-2 py-3 cursor-pointer hover:bg-[#448ee2]">Create War</button></div>
        </div>
    )
}
