/* eslint-disable no-console */
const { execSync } = require('node:child_process')
const {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} = require('node:fs')
const { resolve, join } = require('node:path')
const { manualSync } = require('rimraf')
const { copySync, moveSync } = require('fs-extra')

const downloadUri = process.argv[2]
const downloadDirName = process.argv[3]
const downloadDirUri = resolve(downloadUri, downloadDirName)

const realRuntimeDirName = 'deploy-bot'
const realRuntimeDirUri = resolve(downloadUri, realRuntimeDirName)

try {
  const result = execSync('pm2 delete bot', { encoding: 'utf-8' })
  console.log('Deleting bot:', result)
} catch {}

if (existsSync(realRuntimeDirUri)) {
  console.log('Deleting old runtime:', realRuntimeDirUri)
  manualSync(realRuntimeDirUri)
}

try {
  process.chdir(downloadUri)
  console.log('Copying runtime:', downloadUri, '->', realRuntimeDirName)
  copySync(downloadDirName, realRuntimeDirName)

  console.log(
    'Moving dist:',
    `${realRuntimeDirName}/dist`,
    '->',
    realRuntimeDirUri,
  )
  readdirSync(`${realRuntimeDirName}/dist`).forEach((file) => {
    const sourceFile = join(`${realRuntimeDirName}/dist`, file)
    const targetFile = join(realRuntimeDirName, file)
    moveSync(sourceFile, targetFile, { overwrite: true })
  })

  console.log('Moving package:', `${realRuntimeDirName}/package.json`)
  const packages = readFileSync(`${realRuntimeDirName}/package.json`, 'utf8')

  console.log('Injecting packages:', `${realRuntimeDirName}/package.json`)
  const injectedPackages = packages
    .replaceAll('workspace:^', '0.0.1')
    .replaceAll('"type": "module"', '"type": "commonjs"')

  console.log('Writing:', `${realRuntimeDirName}/package.json`)
  writeFileSync(`${realRuntimeDirName}/package.json`, injectedPackages)

  process.chdir(realRuntimeDirName)

  console.log('Starting bot with pm2:')
  execSync('pm2 start ecosystem.config.cjs node --', { stdio: 'inherit' })

  console.log('Deleting downloadfile:', `${downloadDirUri}`)
  readdirSync(downloadDirUri).forEach((file) => {
    if (file === 'safe-pm2-control.cjs') return
    manualSync(resolve(downloadDirUri, file))
  })
} catch (error) {
  console.error('发生错误:', error)
}
