'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { ModeToggle } from './toggle'

export function NavigationMenuShad() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Mythic trials</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">Mythic Trials</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      En konkurranse for å se hvem som er best på å gjennomføre Mythic+ dungeons.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/" title="Lagene">
                Oversikt over alle lagene som deltar i konkurransen.
              </ListItem>
              <ListItem href="/leaderboard" title="Leaderboard">
                Se hvordan lagene ligger an i konkurransen.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Påmelding">
                Meld på ditt lag til konkurransen.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Regler">
                Finn ut hva som kreves for å delta i konkurransen.
              </ListItem>

              <ListItem href="/docs/primitives/typography" title="Info">
                Les mer om konkurransen og hvordan du kan delta.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = 'ListItem'
