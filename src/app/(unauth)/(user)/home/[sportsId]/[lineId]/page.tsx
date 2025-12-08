import LineDetailPage from '@/app/(auth)/(user)/sports/[sportsId]/[lineId]/lineId'
import { LineType } from '@/types'
import Link from 'next/link'
export default async function Page({ params }: { params: any }) {
  const { lineId } = await params
  const { line }: { line: LineType } = await (await fetch(`http://localhost:3000/api/line/id/${lineId}`, {
    cache: "no-store"
  })).json()
  if (!line) return <>
    Not found
    <Link href="./" className="flex gap-2 items-center cursor-pointer hover:underline">
      <svg className="w-6 h-6 fill-white"><use href="#svg-left-arrow" /></svg>
      <span className="leading-6 max-md:leading-4 select-none">Back to Home</span>
    </Link>
  </>
  return (
    <LineDetailPage line={line} oddstype="decimal" />
  )
}