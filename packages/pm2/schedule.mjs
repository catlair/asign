import { fs } from 'zx'

fs.writeFile('./demo.txt', new Date().toISOString())
