import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const classColors = {
  DeathKnight: '#C41F3B',
  DemonHunter: '#A330C9',
  Druid: '#FF7D0A',
  Hunter: '#ABD473',
  Mage: '#40C7EB',
  Monk: '#00FF96',
  Paladin: '#F58CBA',
  Priest: '#FFFFFF',
  Rogue: '#FFF569',
  Shaman: '#0070DE',
  Warlock: '#8787ED',
  Warrior: '#C79C6E',
  Evoker: '#69CCF0',
}
