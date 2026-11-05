import { build } from 'vite'
import { readdir, access, rm, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const sourceDir = resolve(root, 'components')
const outputDir = resolve(root, 'dist/components')
const configFile = resolve(root, 'vite.config.js')

// Korábbi build törlése
await rm(outputDir, { recursive: true, force: true })
await mkdir(outputDir, { recursive: true })

// Komponenskönyvtárak beolvasása
const directories = await readdir(sourceDir, { withFileTypes: true })

// Minden komponens külön feldolgozása
for (const directory of directories) {
    if (!directory.isDirectory()) {
        continue
    }

    const name = directory.name
    const componentDir = resolve(sourceDir, name)
    const entry = resolve(componentDir, `${name}.js`)

    // Belépési pont ellenőrzése
    try {
        await access(entry)
    }
    catch {
        throw new Error(`Missing component entry point: ${name}/${name}.js`)
    }

    console.log(`Building component: ${name}`)

    await build({
        configFile,
        root: componentDir,

        build: {
            outDir: outputDir,
            emptyOutDir: false,

            lib: {
                entry,
                formats: ['es'],
                fileName: () => `${name}.js`
            },

            rolldownOptions: {
                output: {
                    codeSplitting: false
                }
            }
        }
    })
}

console.log('Component build completed.')