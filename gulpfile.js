'use strict'

/* **************************************************
 *
 * require packages
 *
 * **************************************************/
// general modules
const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')

// sass postcss modules
const sass = require('gulp-sass')
const packageImporter = require('node-sass-package-importer')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssMqPacker = require('css-mqpacker')
const flexBugsFixes = require('postcss-flexbugs-fixes')
const cssWring = require('csswring')

// ejs modules
const ejs = require('gulp-ejs')
const htmlmin = require('gulp-htmlmin')

// imagemin modules
const imagemin = require('gulp-imagemin')
const imageminPngQuant = require('imagemin-pngquant')
const imageminMozJpeg = require('imagemin-mozjpeg')

// clean modules
const clean = require('del')

// server modules
const server = require('browser-sync').create()

/* **************************************************
 *
 * general setting
 *
 * **************************************************/
const documentRoot = `${__dirname}`
const srcRoot = `${documentRoot}/src`
const distRoot = `${documentRoot}/dist`

/* **************************************************
 *
 * html
 *
 * **************************************************/
gulp.task('html', () => {
  return gulp
    .src(`${srcRoot}/**/*.html`)
    .pipe(gulp.dest(`${distRoot}/`))
})

/* **************************************************
 *
 * sass
 *
 * **************************************************/
const sassConfig = {
  sassOption: {
    outputStyle: 'expanded',
    importer: packageImporter({
      extensions: ['.scss', '.css'],
    }),
  },
  autoprefixerOption: {grid: true},
  postcssOption: [
    cssMqPacker,
    flexBugsFixes,
    autoprefixer(this.autoprefixerOption),
  ],
  postcssOptionRelease: [
    cssMqPacker,
    flexBugsFixes,
    autoprefixer(this.autoprefixerOption),
    cssWring,
  ],
}

gulp.task('sass', () => {
  return gulp.src(`${srcRoot}/sass/**/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass(sassConfig.sassOption))
    .pipe(postcss(sassConfig.postcssOption))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${distRoot}/css/`))
})

gulp.task('sass:release', () => {
  return gulp.src(`${srcRoot}/sass/**/*.scss`)
    .pipe(sass(sassConfig.sassOption))
    .pipe(postcss(sassConfig.postcssOptionRelease))
    .pipe(gulp.dest(`${distRoot}/css/`))
})

/* **************************************************
 *
 * ejs
 *
 * **************************************************/
const ejsConfig = {
  ejsSrc: [`${srcRoot}/ejs/**/*.ejs`, `!${srcRoot}/ejs/_partial/*.ejs`],
  ejsWatchSrc: `${srcRoot}/ejs/**/*.ejs`,
  ejsSettingOption: {ext: '.html'},
  htmlminOption: {collapseWhitespace: true},
}

gulp.task('ejs', () => {
  return gulp.src(ejsConfig.ejsSrc)
    .pipe(ejs({}, {}, ejsConfig.ejsSettingOption))
    .pipe(gulp.dest(`${distRoot}/`))
})

gulp.task('ejs:release', () => {
  return gulp.src(ejsConfig.ejsSrc)
    .pipe(ejs({}, {}, ejsConfig.ejsSettingOption))
    .pipe(htmlmin(ejsConfig.htmlminOption))
    .pipe(gulp.dest(`${distRoot}/`))
})

/* **************************************************
 *
 * imagemin
 *
 * **************************************************/
const imageminConfig = [
  imageminPngQuant({quality: '65-80'}),
  imageminMozJpeg({quality: 90}),
  imagemin.gifsicle(),
  imagemin.jpegtran(),
  imagemin.optipng(),
  imagemin.svgo(),
]

gulp.task('imagemin', () => {
  return gulp.src(`${srcRoot}/images/**/*`)
    .pipe(imagemin(imageminConfig))
    .pipe(gulp.dest(`${distRoot}/images/`))
})

/* **************************************************
 *
 * clean
 *
 * **************************************************/
gulp.task('clean', (callback) => {
  clean([`${distRoot}/**`, `!${distRoot}`], callback())
})

/* **************************************************
 *
 * server
 *
 * **************************************************/
const serverConfig = {
  server: {
    baseDir: `${distRoot}`,
  },
}

gulp.task('server', (callback) => {
  server.init(serverConfig)
  callback()
})

/* **************************************************
 *
 * watch
 *
 * **************************************************/
gulp.task('watch', gulp.series('server', () => {
  const reload = (callback) => {
    server.reload()
    callback()
  }

  gulp.watch(`${srcRoot}/**/*.html`, gulp.task('html'));
  gulp.watch(ejsConfig.ejsWatchSrc, gulp.task('ejs'))
  gulp.watch(`${srcRoot}/sass/**/*.scss`, gulp.task('sass'))
  gulp.watch(`${srcRoot}/images/**/*`, gulp.task('imagemin'))
  gulp.watch(`${distRoot}/**/*`, reload)
}))

/* **************************************************
 *
 * release
 *
 * **************************************************/
gulp.task(
  'release',
  gulp.series('clean', gulp.parallel('html', 'sass', 'ejs', 'imagemin'))
)

/* **************************************************
 *
 * default
 *
 * **************************************************/
gulp.task('default', gulp.parallel('html', 'sass', 'ejs', 'imagemin'))
