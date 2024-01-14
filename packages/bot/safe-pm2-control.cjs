/* eslint-disable no-console */
import { execSync } from 'node:child_process'

try {
  execSync('pm2 stop bot', { stdio: 'ignore' })
} catch (error) {
  console.log(error)
}

try {
  execSync('pm2 delete bot', { stdio: 'ignore' })
} catch (error) {
  console.log(error)
}
