import {} from 'pm2'
import { exec } from 'node:child_process'

function startPm2() {
  return new Promise((resolve, reject) => {
    exec('npx pm2 ls', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        reject(error)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        reject(stderr)
        return
      }
      resolve(stdout)
    })
  })
}
