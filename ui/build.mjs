import fs from 'fs-extra'
import esbuild from 'esbuild'
import babel from 'esbuild-plugin-babel'
import browserSync from 'browser-sync'
import historyApiFallback from 'connect-history-api-fallback'
import dotenv from 'dotenv'
import workboxBuild from 'workbox-build'

dotenv.config()
const bs = browserSync.create()

const production = process.env.NODE_ENV == 'production'
const watchMode = process.argv[2] == 'watch'

const ENVIRONMENT_VARIABLES = [
  'NODE_ENV',
  'PHOTOVIEW_API_ENDPOINT',
  'VERSION',
  'BUILD_DATE',
  'COMMIT_SHA',
]

const defineEnv = ENVIRONMENT_VARIABLES.reduce((acc, key) => {
  acc[`process.env.${key}`] = process.env[key] ? `"${process.env[key]}"` : null
  return acc
}, {})

const esbuildOptions = {
  entryPoints: ['src/index.tsx', 'mapbox-gl/dist/mapbox-gl.css'],
  entryNames: '[name]',
  plugins: [
    babel({
      filter: /photoview\/ui\/src\/.*\.(js|tsx?)$/,
    }),
  ],
  publicPath: process.env.UI_PUBLIC_URL || '/',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  platform: 'browser',
  splitting: true,
  minify: production,
  sourcemap: !production,
  loader: {
    '.js': 'jsx',
    '.svg': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.ttf': 'file',
    '.eot': 'file',
    '.png': 'file',
  },
  define: defineEnv,
}

if (watchMode) {
  esbuildOptions.incremental = true
  esbuildOptions.watch = {
    onRebuild(err) {
      if (err == null) {
        bs.reload()
      }
    },
  }
}

fs.emptyDirSync('dist/')
fs.copyFileSync('src/index.html', 'dist/index.html')
fs.copyFileSync('src/manifest.webmanifest', 'dist/manifest.json')
fs.copyFileSync('src/favicon.ico', 'dist/favicon.ico')
fs.copySync('src/assets/', 'dist/assets/')

if (watchMode) {
  esbuild.build(esbuildOptions)

  bs.init({
    server: {
      baseDir: './dist',
      middleware: [historyApiFallback()],
    },
    port: 1234,
    open: false,
  })
} else {
  const build = async () => {
    await esbuild.build(esbuildOptions)

    console.log('esbuild done')

    await workboxBuild.generateSW({
      globDirectory: 'dist/',
      globPatterns: ['**/*.{png,svg,woff2,ttf,eot,woff,js,ico,html,json,css}'],
      swDest: 'dist/service-worker.js',
    })

    console.log('workbox done')
    console.log('build complete')
  }
  build()
}
