import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
const QRCodeImg = ({ value, className }: { value: string, className?: string }) => {
    const [base64QR, setBase64QR] = useState("")
    const ref_canvas = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        if (ref_canvas.current) {
            setTimeout(() => {
                if (ref_canvas.current) setBase64QR(ref_canvas.current.toDataURL('image/png'))
            }, 100);
        }
    }, [ref_canvas])
    return (
        <div className={`bg-white ${className}`}>
            <div className='hidden'>
                <QRCodeCanvas
                    ref={ref_canvas}
                    value={value}
                    title={"Guess2Gain"}
                    size={512}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"M"}
                    marginSize={2}
                    imageSettings={{
                        src: "data:image/png;base64,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",
                        x: undefined,
                        y: undefined,
                        height: 98,
                        width: 98,
                        opacity: 1,
                        excavate: true,
                    }}
                />
            </div>
            {base64QR && <img className="w-full h-full" src={base64QR} />}
        </div>
    )
}
export default QRCodeImg