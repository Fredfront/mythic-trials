'use client'

import React, { useState } from 'react'
import { Calendar, List, Scroll, Users, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignupPage } from '@/app/api/signup/getSignupInfo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { TracingBeam } from '@/components/ui/tracing-beam'

const TournamentNavbar = ({ signupData, children }: { signupData: SignupPage; children: React.ReactNode }) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { href: '/turnering', icon: Calendar, label: 'Kamper' },
    { href: '/turnering/tabell', icon: List, label: 'Tabell' },
    { href: '/turnering/rules', icon: Scroll, label: 'Regler' },
    { href: '/turnering/teams', icon: Users, label: 'Lag' },
  ]

  const NavList = () => (
    <ul className="space-y-4 text-[1.2rem]">
      {menuItems.map((item) => (
        <li key={item.href}>
          <Link href={item.href}>
            <span
              className={`flex items-center gap-4 hover:font-bold cursor-pointer ${
                pathname === item.href ? 'text-[#FDB202] font-bold' : 'text-white'
              }`}
            >
              <item.icon className="h-6 w-6" />
              {item.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="max-w-[1400px] mx-auto mt-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/5 lg:max-w-[250px] mb-4 lg:mb-0">
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button size="icon" className="ml-12 bg-[#011624]">
                  <div className="  flex gap-2 items-center">
                    <Menu className="h-12 w-12" color="white" />
                    <span className="text-white">Turnernings meny </span>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[280px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <SheetTitle className="text-white">Turnering</SheetTitle>
                  </div>
                  <NavList />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden lg:block sticky top-4">
            <NavList />
          </div>
        </div>
        <div className="lg:w-4/5 lg:pl-8">
          <TracingBeam className="w-full">
            <div className="w-full mb-4">
              <div className="mt-4">{children}</div>
            </div>
          </TracingBeam>
        </div>
      </div>
    </div>
  )
}

export default TournamentNavbar
