export const dungeonNames = [
  "Dawn of the Infinites: Galakrond's Fall",
  "Dawn of the Infinites: Murozond's Rise",
  'Waycrest Manor',
  "Atal'Dazar",
  'Darkheart Thicket',
  'Black Rook Hold ',
  'Everbloom',
  'Throne of the Tides',
]

export function generateDungeonFields(dungeonNames: any) {
  const dungeonFields: any = []
  dungeonNames.forEach((name: any) => {
    dungeonFields.push({
      type: 'object',
      name: name.replace(/[^a-zA-Z0-9]/g, ''),
      title: name,
      fields: [{ type: 'array', name: 'teams', title: 'Teams', of: [{ type: 'TeamScore' }] }],
    })
  })
  return dungeonFields
}

export function generateWeeksFields() {
  const weeksFields = []
  for (let i = 1; i <= 3; i++) {
    weeksFields.push({
      type: 'object',
      name: `week_${i}`,
      title: `Week ${i}`,
      fields: generateDungeonFields(dungeonNames),
    })
  }
  return weeksFields
}

// Usage:
export const dungeonFields = generateDungeonFields(dungeonNames)
