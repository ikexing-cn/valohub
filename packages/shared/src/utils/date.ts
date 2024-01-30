export function calcDailyTime() {
  const today = new Date()
  const eightTenAM = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    8,
    0,
    0,
    1,
  )

  const yesterday = new Date(today.setDate(today.getDate() - 1))

  today.setHours(8, 0, 0, 0)
  yesterday.setHours(8, 0, 0, 0)

  return today >= eightTenAM ? today : yesterday
}

export function calcWeeklyTime() {
  const now = new Date()
  const eightTenAM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8,
    0,
    0,
    1,
  )

  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 3)
  const lastWednesday = new Date(now.setDate(diff))

  now.setHours(8, 0, 0, 0)
  lastWednesday.setHours(8, 0, 0, 0)

  return now >= eightTenAM ? now : lastWednesday
}
