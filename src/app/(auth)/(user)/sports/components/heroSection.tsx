export default function HeroSection() {
    return (
        <>
            <div className="flex max-md:flex-col gap-4">
                <div className="relative w-1/3 md:min-w-xs max-md:w-full h-72 max-md:h-44 shrink-0 bg-[url(/noshow-hero-main.png)] bg-center bg-cover rounded-xl">
                    <div className="absolute flex flex-col items-center p-4 bottom-0 w-full">
                        <span className="md:text-2xl font-bold">Welcome to Picklett!</span>
                        <div className="text-[#D1D5DC] text-center max-md:text-xs">The only unique <span className="font-bold">sports dueling experience</span> where you wage with your <span className="font-bold">clan</span>, win bigger and receive bonus payouts on winstreaks.</div>
                    </div>
                </div>
                <div className={`w-full h-72 max-md:h-34 overflow-x-auto`}>
                    <div className="flex gap-10 max-md:gap-4 h-full">
                        <div className="w-[368px] max-md:w-[215px] bg-white/10 shrink-0 h-full rounded-xl border bg-[url(/noshow-hero-1.png)] bg-center bg-cover">
                        </div>
                        <div className="w-[368px] max-md:w-[215px] bg-white/10 shrink-0 h-full rounded-xl border bg-[url(/noshow-hero-2.png)] bg-center bg-cover">
                        </div>
                        <div className="w-[368px] max-md:w-[215px] bg-white/10 shrink-0 h-full rounded-xl border bg-[url(/noshow-hero-3.png)] bg-center bg-cover">
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}