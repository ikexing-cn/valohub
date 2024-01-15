/* eslint-disable no-console */
const { execSync } = require('node:child_process')
const { existsSync, readdirSync } = require('node:fs')
const { resolve } = require('node:path')
const { copySync } = require('fs-extra')

const downloadUri = process.argv[2]
const downloadDirName = process.argv[3]
const downloadDirUri = resolve(downloadUri, downloadDirName)

const realRuntimeDirName = 'deploy-bot'
const realRuntimeDirUri = resolve(downloadUri, realRuntimeDirName)

try {
  execSync('pm2 delete bot', { stdio: 'inherit' })
} catch {}

execSync(`npm install rimraf pnpm`, { stdio: 'inherit' })

if (existsSync(realRuntimeDirUri)) {
  console.log('Deleting old runtime:', realRuntimeDirUri)
  execSync(`rimraf ${realRuntimeDirName}`, { stdio: 'inherit' })
}

try {
  process.chdir(downloadUri)
  console.log('Copying runtime:', downloadUri, '->', realRuntimeDirName)
  copySync(downloadDirName, realRuntimeDirName)

  // console.log(
  //   'Moving dist:',
  //   `${realRuntimeDirName}/dist`,
  //   '->',
  //   realRuntimeDirUri,
  // )
  // readdirSync(`${realRuntimeDirName}/dist`).forEach((file) => {
  //   const sourceFile = join(`${realRuntimeDirName}/dist`, file)
  //   const targetFile = join(realRuntimeDirName, file)
  //   moveSync(sourceFile, targetFile, { overwrite: true })
  // })

  // console.log('Moving package:', `${realRuntimeDirName}/package.json`)
  // const packages = readFileSync(`${realRuntimeDirName}/package.json`, 'utf8')

  // console.log('Injecting packages:', `${realRuntimeDirName}/package.json`)
  // const injectedPackages = packages
  //   .replaceAll('workspace:^', '0.0.1')
  //   .replaceAll('"type": "module"', '"type": "commonjs"')

  // console.log('Writing:', `${realRuntimeDirName}/package.json`)
  // writeFileSync(`${realRuntimeDirName}/package.json`, injectedPackages)

  process.chdir(realRuntimeDirName)

  execSync('pnpm install', { stdio: 'inherit' })
  execSync('pnpm run build', { stdio: 'inherit' })

  process.chdir(resolve('packages', 'bot'))

  console.log('Starting bot with pm2:')
  execSync('pm2 start ecosystem.config.cjs node --', { stdio: 'inherit' })

  console.log('Deleting downloadfile:', `${downloadDirUri}`)
  readdirSync(downloadDirUri).forEach((file) => {
    if (file === 'safe-pm2-control.cjs') return
    execSync(`rimraf ${resolve(downloadDirUri, file)}`, { stdio: 'inherit' })
  })
} catch (error) {
  console.error('发生错误:', error)
}
