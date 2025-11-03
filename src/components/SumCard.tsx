const SumCard = ({ icon, amount, heading, description, color }: { icon: string, amount: string, heading: string, description: string, color: string }) => {
    return (
        <div className="w-full flex flex-col gap-4 justify-between p-6 bg-[#0E1B2F] rounded-2xl">
            <div className="flex justify-between items-center">
                <div className="w-12 h-12 flex justify-center items-center rounded-xl" style={{ backgroundColor: `${color}1A` }}>
                    <svg className="w-8 h-8"><use href={`#svg-${icon}`} /></svg>
                </div>
                <div className="text-3xl font-semibold" style={{ color: `${color}` }}>{amount}</div>
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-medium">{heading}</span>
                <span className="text-white/70">{description}</span>
            </div>
        </div>
    )
}
export default SumCard