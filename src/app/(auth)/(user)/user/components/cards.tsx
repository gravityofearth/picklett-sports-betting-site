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