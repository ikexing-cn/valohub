/* eslint-disable no-console */
const { execSync } = require('node:child_process')
const { existsSync, readdirSync } = require('node:fs')
const { resolve, join } = require('node:path')
const { manualSync } = require('rimraf')
const { copySync, moveSync } = require('fs-extra')

try {
  const result = execSync('pm2 stop bot', { encoding: 'utf-8' })
  console.log('Stoppping bot:', result)
} catch {}

try {
  const result = execSync('pm2 delete bot', { encoding: 'utf-8' })
  console.log('Deleting bot:', result)
} catch {}

if (existsSync(resolve(process.argv[2], 'deploy-bot'))) {
  manualSync(resolve(process.argv[2], 'deploy-bot'))
}

try {
  process.chdir(process.argv[2])
  copySync('deploy-bot-build-files-download', 'deploy-bot')

  readdirSync('deploy-bot/dist').forEach((file) => {
    const sourceFile = join('deploy-bot/dist', file)
    const targetFile = join('deploy-bot', file)
    moveSync(sourceFile, targetFile, { overwrite: true })
  })

  process.chdir('deploy-bot')
  execSync('pm2 start ecosystem.config.cjs', { stdio: 'inherit' })
} catch (error) {
  console.error('发生错误:', error)
}
