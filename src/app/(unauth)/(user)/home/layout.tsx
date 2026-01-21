import { SportsLayout } from "@/app/(auth)/(user)/sports/components/sportsLayout";
export default function Page({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <SportsLayout oddstype="decimal">
      {children}
    </SportsLayout>
  )
} 