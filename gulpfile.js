var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var rename = require("gulp-rename");
var jsMinify = require('gulp-minify');

function build_css() {
  return gulp.src(['./static/scss/main.scss'])
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./static/css'));
}

const build = gulp.series(build_css);

exports.default = build;
