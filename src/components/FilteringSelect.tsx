"use client"
import { Children, cloneElement, isValidElement, MouseEventHandler, ReactElement, ReactNode, useState } from "react"

export const FilteringOption = ({ value, dismissHandler, onClick }: { value: ReactNode, dismissHandler?: () => void, onClick?: () => void }) => {
    return (
        <div className="cursor-pointer" onClick={() => {
            dismissHandler?.()
            onClick?.()
        }}>
            <div className="text-[13px] font-semibold p-2 gap-2 hover:bg-[#343C4C] rounded-[6px]">
                {value}
            </div>
        </div>
    )
}
export const FilteringSelect = ({ children, value }: { children: ReactNode, value: ReactNode }) => {
    const [showDropdown, setShowDropdown] = useState(false)
    return (
        <div className="relative cursor-pointer">
            {showDropdown && <div onClick={() => setShowDropdown(false)} className="absolute left-0 right-0 top-0 bottom-0 z-10"></div>}
            <div className="relative">
                <div onClick={() => setShowDropdown(prev => !prev)} className="relative border border-[#E5E5E566] rounded-[10px] flex justify-between gap-2 px-3 py-2 z-20">
                    <div>
                        {value}
                    </div>
                    <div>&gt;</div>
                </div>
                {showDropdown &&
                    <div className="absolute left-0 right-0 top-0 flex flex-col p-1 rounded-[10px] bg-[#242C3C] z-20">
                        {
                            Children.map(children, child =>
                                // Ensure child is a valid React element before cloning
                                isValidElement(child)
                                    ? cloneElement(child as ReactElement<{ dismissHandler?: () => void }>, {
                                        dismissHandler: () => setShowDropdown(false),
                                    })
                                    : child
                            )
                        }
                    </div>
                }
            </div>
        </div>
    )
}
