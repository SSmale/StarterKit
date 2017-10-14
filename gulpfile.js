//------------------//
// Define Variables //
//------------------//

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

//-------------------//
// Development Tasks //
//-------------------//

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync.init({
      server: {
          baseDir: "app"
      }
      // Tunnel has some issues currently
      //, tunnel: "name_the_tunnel" this can be anything in lower case
  });
});

// Converts SCSS to CSS, Prefixes for the last two browser vesions and provides source maps to assit in debugging
gulp.task('sass', function() {
   return gulp.src('app/scss/**/*.scss')
       .pipe(sourcemaps.init())
       .pipe(sass().on('error', function(err) {
          console.error(err.message);
          browserSync.notify(err.message, 30000); // Display error in the browser
          this.emit('end'); // Prevent gulp from catching the error and exiting the watch process
        })) // Converts Sass to CSS with gulp-sass
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
gulp.task('watch', ['sass'], function (){
  gulp.watch('app/scss/**/*.scss', ['sass']); 
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/*.html', browserSync.reload); 
  gulp.watch('app/js/**/*.js', browserSync.reload); 
})

//------------------//
// Production Tasks //
//------------------//

// Minifies the JS and CSS files
gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

// Moves custom fonts to the production folder
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

// Moves images to the production folder
gulp.task('images', function() {
  return gulp.src('app/images/**/*')
  .pipe(gulp.dest('dist/images'))
});

// Deletes the production folder to remove deprecated files
gulp.task('clean:dist', function() {
  return del.sync('dist');
});

//------------------//
//  Run Gulp Tasks  //
//------------------//

gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['sass', 'useref', 'fonts', 'images'],
    callback
  )
});

gulp.task('default', function (callback) {
  runSequence(['browserSync', 'sass'], 'watch',
    callback
  )
});
