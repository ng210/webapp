
import { build } from 'vite'
import { transform } from 'esbuild'
import { readdir, access, readFile, writeFile, copyFile, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const appName = process.argv[2]

if (!appName || basename(appName) !== appName || appName === '.' || appName === '..') {
    throw new Error('Usage: node build.mjs <WebAppName>')
}

const distDir = resolve(root, 'dist')
const appSource = resolve(root, appName, 'ui')
const appOutput = resolve(distDir, appName, 'ui')

const libSource = resolve(root, 'JsLib')
const libOutput = resolve(distDir, 'lib')

const componentSource = resolve(root, 'components')
const componentOutput = resolve(distDir, 'components')

const configFile = resolve(root, 'vite.config.js')

// --------------------------------------------------
// Segédfüggvények
// --------------------------------------------------

async function copyMinified(source, destination) {
    await mkdir(destination, { recursive: true })

    const entries = await readdir(source, { withFileTypes: true })

    for (const entry of entries) {
        const input = resolve(source, entry.name)
        const output = resolve(destination, entry.name)

        if (entry.isDirectory()) {
            await copyMinified(input, output)
            continue
        }

        if (['.js', '.mjs'].includes(extname(entry.name))) {
            let code = await readFile(input, 'utf8')

            // JsLib útvonalak átírása lib-re
            code = code.replace(
                /(\bfrom\s*|\bimport\s*(?:\(\s*)?)(['"])([^'"]+)\2/g,
                (match, prefix, quote, specifier) => {
                    const updated = specifier.replace(
                        /(^|\/)JsLib(?=\/)/,
                        '$1lib'
                    )

                    return `${prefix}${quote}${updated}${quote}`
                }
            )

            const result = await transform(code, {
                minify: false,  // true,
                target: 'es2022'
            })

            await writeFile(output, result.code)
        }
        else {
            await copyFile(input, output)
        }
    }
}

async function checkDirectory(path, description) {
    try {
        await access(path)
    }
    catch {
        throw new Error(`Missing ${description}: ${path}`)
    }
}

// --------------------------------------------------
// 0. Források ellenőrzése
// --------------------------------------------------

await checkDirectory(appSource, 'webapp UI directory')
await checkDirectory(libSource, 'JsLib directory')
await checkDirectory(componentSource, 'components directory')

await checkDirectory(
    resolve(appSource, 'index.html'),
    'webapp index.html'
)

// --------------------------------------------------
// 1. Korábbi build törlése
// --------------------------------------------------

await rm(distDir, { recursive: true, force: true })
await mkdir(distDir, { recursive: true })

// --------------------------------------------------
// 2. Webapp build
// --------------------------------------------------

console.log(`Building webapp: ${appName}`)

await build({
    configFile,
    root: appSource,
    base: './',

    build: {
        outDir: appOutput,
        emptyOutDir: false,
        copyPublicDir: true,

        target: 'es2022',
        minify: false,  //'esbuild',
        sourcemap: false
    }
})

// --------------------------------------------------
// 3. JsLib publikálása
// --------------------------------------------------

console.log('Building JsLib...')

await copyMinified(libSource, libOutput)

// --------------------------------------------------
// 4. Components publikálása
// --------------------------------------------------

console.log('Building components...')

const directories = await readdir(componentSource, {
    withFileTypes: true
})

for (const directory of directories) {
    if (!directory.isDirectory()) {
        continue
    }

    const name = directory.name
    const componentDir = resolve(componentSource, name)
    const entry = resolve(componentDir, `${name}.js`)

    await checkDirectory(entry, `component entry point: ${name}`)

    console.log(`Building component: ${name}`)

    await build({
        configFile,
        root: componentDir,

        build: {
            outDir: componentOutput,
            emptyOutDir: false,

            lib: {
                entry,
                formats: ['es'],

                // A forrás könyvtárszerkezetének megőrzése
                fileName: () => `${name}/${name}.js`
            },

            rolldownOptions: {
                output: {
                    codeSplitting: false
                }
            }
        }
    })
}

console.log('Build completed successfully.')
