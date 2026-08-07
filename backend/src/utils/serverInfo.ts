import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

export const getServerInfo = () => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const packageJsonPath = join(__dirname, '../../package.json')

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    return {
      version: packageJson.version || '1.0.0',
      name: packageJson.name || 'backend',
    }
  } catch {
    return {
      version: '1.0.0',
      name: 'backend',
    }
  }
}
