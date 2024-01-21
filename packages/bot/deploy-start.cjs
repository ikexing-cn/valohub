/* eslint-disable no-console */
const { execSync } = require('node:child_process')
const { existsSync, readdirSync, copyFileSync, mkdirSync } = require('node:fs')
const { resolve, join } = require('node:path')

const [, , downloadUri, downloadDirName, proxyUrl] = process.argv
const downloadDirUri = resolve(downloadUri, downloadDirName)

const realRuntimeDirName = 'deploy-bot'
const realRuntimeDirUri = resolve(downloadUri, realRuntimeDirName)

function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest)
  }

  const entries = readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

try {
  execSync('pm2 delete bot', { stdio: 'inherit' })
} catch {}

execSync(`npm install rimraf pnpm -g`, { stdio: 'inherit' })

try {
  if (existsSync(realRuntimeDirUri)) {
    console.log('Deleting old runtime:', realRuntimeDirUri)
    execSync(`rimraf ${realRuntimeDirUri}`, { stdio: 'inherit' })
  }
} catch {}

process.chdir(downloadUri)
console.log('Copying runtime:', downloadUri, '->', realRuntimeDirName)
copyDir(downloadDirName, realRuntimeDirName)

process.chdir(realRuntimeDirName)

if (proxyUrl) {
  console.log('Setting environment variables:')
  execSync(`set http_proxy=${proxyUrl}`)
  execSync(`set https_proxy=${proxyUrl}`)
}

console.log('Installing dependencies:')
execSync('pnpm install', { stdio: 'inherit' })

console.log('Building bot:')
execSync('pnpm run build', { stdio: 'inherit' })

process.chdir(resolve('packages', 'bot'))

console.log('Starting bot with pm2:')
execSync('pm2 start ecosystem.config.cjs node --', { stdio: 'inherit' })

console.log('Deleting downloadfile:', `${downloadDirUri}`)
execSync(`rimraf ${downloadDirUri}`, { stdio: 'inherit' })

console.log('Listing pm2 processes:')
execSync(`pm2 list`, { stdio: 'inherit' })
