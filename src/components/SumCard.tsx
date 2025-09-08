const SumCard = ({ icon, amount, heading, description, color }: { icon: string, amount: string, heading: string, description: string, color: string }) => {
    return (
        <div className="w-full flex flex-col gap-4 justify-between p-6 bg-linear-0 from-[#1018284D] to-[#1E293933] border border-[#36415380] rounded-2xl">
            <div className="flex justify-between items-center">
                <div className="w-12 h-12 flex justify-center items-center rounded-xl" style={{ backgroundColor: `${color}1A` }}>
                    <svg className="w-5 h-5"><use href={`#svg-${icon}`} /></svg>
                </div>
                <div className="text-2xl" style={{ color: `${color}` }}>{amount}</div>
            </div>
            <div>
                {heading}<br />
                <span className="text-sm text-[#99A1AF]">{description}</span>
            </div>
        </div>
    )
}
export default SumCard