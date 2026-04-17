'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard') || pathname === '/login' || pathname === '/signup'

  // If we are on the dashboard, the dashboard/layout.tsx handles its own padding and sidebar.
  // We hide the global desktop header and footer.
  // We keep the mobile bottom nav on the dashboard, or dashboard layout can handle it.
  // The user requested the mobile menu to slide over, let's keep the global Bottom Nav!
  // BUT the desktop Navbar gets in the way of the sidebar. Let's hide the global Navbar and Footer on Desktop for the dashboard.
  
  if (isDashboard) {
    if (pathname === '/login' || pathname === '/signup') {
       return <main className="flex-1">{children}</main>
    }

    return (
      <>
         {/* Top desktop nav hidden. Bottom mobile nav kept. */}
         <div className="hidden md:block">
            {/* No Top Navbar for Dashboard Desktop */}
         </div>
         <div className="md:hidden">
            {/* We still need the bottom mobile nav */}
            <Navbar />
         </div>
         
         <main className="flex-1">{children}</main>
         {/* No footer on dashboard */}
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
    </>
  )
}
