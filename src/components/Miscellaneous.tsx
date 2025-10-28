import Image from "next/image"

export const CoinDisplay = ({ coin, src }: { coin: string, src: string }) => {
  return (
    <div className="flex items-center gap-2">
      <CoinImage src={src} />
      <span>{coin}</span>
    </div>
  )
}
export const CoinImage = ({ src }: { src: string }) => <Image alt="coin-image" src={src} width={20} height={16} className="shrink-0" />