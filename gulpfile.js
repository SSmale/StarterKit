var browserSync = require('browser-sync');  
var gulp = require('gulp');
var sass = require('gulp-sass');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var del = require('del');
var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var runSequence = require('run-sequence');


// Development Tasks 
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync.init({
      server: {
          baseDir: "app"
      }
  });
});

//SASS to CSS
// gulp.task('sass', function() {
//     gulp.src('app/scss/**/*.scss')
//         .pipe(sass()) // Converts Sass to CSS with gulp-sass
//         .pipe( gulp.dest('app/css') )
//         .pipe(browserSync.reload({
//             stream: true
//         }));
// });

gulp.task('sass', function() {
   return gulp.src('app/scss/**/*.scss')
       .pipe(sourcemaps.init())
       .pipe(sass()) // Converts Sass to CSS with gulp-sass
       .pipe(autoprefixer({
             browsers: ['last 2 versions'],
             cascade: false
         }))
       .pipe(sourcemaps.write('.'))
       .pipe(gulp.dest('app/css'))
       .pipe(browserSync.reload({
           stream: true
       }))
});

// Gulp watch
gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('app/scss/**/*.scss', ['sass']); 
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/*.html', browserSync.reload); 
  gulp.watch('app/js/**/*.js', browserSync.reload); 
})


gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

gulp.task('images', function() {
  return gulp.src('app/images/**/*')
  .pipe(gulp.dest('dist/images'))
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
});

// gulp.task('autoprefix', function () {
//   return gulp.src('app/css')
//     .pipe(sourcemaps.init())
//     .pipe(postcss([ autoprefixer(
//       {
//         browsers: ['last 2 versions'],
//         cascade: false
//       }) ]))
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest('.'));
// });  'autoprefix',

//Gulp tasks

gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['sass', 'useref', 'fonts', 'images'],
    callback
  )
});

gulp.task('default', function (callback) {
  runSequence(['sass', 'browserSync'], 'watch',
    callback
  )
});
