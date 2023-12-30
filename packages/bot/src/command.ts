export function parseCommand(str: string) {
  if (!str.startsWith('/')) return false
  return str.replace('/', '').toLowerCase()
}
