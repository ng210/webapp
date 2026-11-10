import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
    build: {
        target: 'es2022',
        minify: 'esbuild',
        sourcemap: false,
        cssMinify: false
    },
    server: {
        https: true
        // {
        //     key: fs.readFileSync('./cert/key.pem'),
        //     cert: fs.readFileSync('./cert/cert.pem')
        // }
    },
    plugins: [mkcert()]
})