/* eslint-disable no-console */
import { manualSync } from 'rimraf'
const { execSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const { copySync } = require('fs-extra')

try {
  const result = execSync('pm2 start bot', { encoding: 'utf-8' })
  console.log('Stoppping bot:', result)
} catch (error) {
  console.log(error)
}

try {
  const result = execSync('pm2 delete bot', { encoding: 'utf-8' })
  console.log('Deleting bot:', result)
} catch (error) {
  console.log(error)
}

if (existsSync('deploy-bot')) {
  manualSync('deploy-bot')
}

try {
  process.chdir(process.argv0)
  copySync('deploy-bot-build-files-download', 'deploy-bot')
  process.chdir('deploy-bot')
  execSync('pm2 start ecosystem.config.cjs', { stdio: 'inherit' })
} catch (error) {
  console.error('发生错误:', error)
}
