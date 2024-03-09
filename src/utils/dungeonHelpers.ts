import { LeaderboardData } from '@/app/api/leaderboard/tyrannical'

export function getDungeonInfo(leaderboard: LeaderboardData, idForRef: string | undefined) {
  const darkheart_thicket = leaderboard.find((dungeon) => dungeon.dungeon.toLowerCase() === 'darkheart thicket')
  const galakronds_fall = leaderboard.find(
    (dungeon) => dungeon.dungeon.toLowerCase() === "dawn of the infinites: galakrond's fall",
  )
  const murozonds_rise = leaderboard.find(
    (dungeon) => dungeon.dungeon.toLowerCase() === "dawn of the infinites: murozond's rise",
  )
  const waycrest_manor = leaderboard.find((dungeon) => dungeon.dungeon.toLowerCase() === 'waycrest manor')
  const atal_dazar = leaderboard.find((dungeon) => dungeon.dungeon.toLowerCase() === "atal'dazar")
  const black_rook_hold = leaderboard.find((dungeon) => dungeon.dungeon.toLowerCase() === 'black rook hold')
  const everbloom = leaderboard.find((dungeon) => dungeon.dungeon.toLowerCase() === 'everbloom')
  const throne_of_the_tides = leaderboard.find((dungeon) => dungeon.dungeon.toLowerCase() === 'throne of the tides')

  //times
  const time_darkheart = darkheart_thicket?.teams?.find((e) => e.team._ref === idForRef)
  const time_galakrond = galakronds_fall?.teams?.find((e) => e.team._ref === idForRef)
  const time_murozond = murozonds_rise?.teams?.find((e) => e.team._ref === idForRef)
  const time_waycrest = waycrest_manor?.teams?.find((e) => e.team._ref === idForRef)
  const time_atal = atal_dazar?.teams?.find((e) => e.team._ref === idForRef)
  const time_black_rook = black_rook_hold?.teams?.find((e) => e.team._ref === idForRef)
  const time_everbloom = everbloom?.teams?.find((e) => e.team._ref === idForRef)
  const time_throne = throne_of_the_tides?.teams?.find((e) => e.team._ref === idForRef)

  const dungeons = {
    darkheart_thicket,
    galakronds_fall,
    waycrest_manor,
    atal_dazar,
    black_rook_hold,
    everbloom,
    throne_of_the_tides,
    murozonds_rise,
  }

  const timeForTeam = {
    darkheart_thicket: time_darkheart,
    galakronds_fall: time_galakrond,
    murozonds_rise: time_murozond,
    waycrest_manor: time_waycrest,
    atal_dazar: time_atal,
    black_rook_hold: time_black_rook,
    everbloom: time_everbloom,
    throne_of_the_tides: time_throne,
  }

  return {
    dungeons: dungeons as {
      [key: string]: {
        dungeon: string
        teams: { _key: string; seconds: number; minutes: number; team: { _key: string; _ref: string } }[]
      }
    },
    timeForTeam: timeForTeam as { [key: string]: { minutes: number; seconds: number } },
  }
}

export const dungeonConfig = [
  {
    name: "Dawn of the Infinites: Galakrond's Fall",
    id: 'galakronds_fall',
    timer: {
      minutes: 30,
      seconds: 0,
    },
  },
  {
    name: "Dawn of the Infinites: Murozond's Rise",
    id: 'murozonds_rise',
    timer: {
      minutes: 30,
      seconds: 0,
    },
  },
  {
    name: 'Waycrest Manor',
    id: 'waycrest_manor',
    timer: {
      minutes: 30,
      seconds: 0,
    },
  },
  {
    name: "Atal'Dazar",
    id: 'atal_dazar',
    timer: {
      minutes: 30,
      seconds: 0,
    },
  },
  {
    name: 'Darkheart Thicket',
    id: 'darkheart_thicket',
    timer: {
      minutes: 30,
      seconds: 0,
    },
  },
  {
    name: 'Black Rook Hold ',
    id: 'black_rook_hold',
    timer: {
      minutes: 30,
      seconds: 0,
    },
  },
  {
    name: 'Everbloom',
    id: 'everbloom',
    timer: {
      minutes: 30,
      seconds: 0,
    },
  },
  {
    name: 'Throne of the Tides',
    id: 'throne_of_the_tides',
    timer: {
      minutes: 30,
      seconds: 0,
    },
  },
]
