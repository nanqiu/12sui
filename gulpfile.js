var gulp = require('gulp');
var watermark = require('gulp-watermark');
var tap = require('gulp-tap');
//var imagemin = require('gulp-imagemin');
var imageminJpegtran = require('imagemin-jpegtran');
var gm = require('gulp-gm');

gulp.task('watermark', function() {
    return gulp.src('/Users/nannan/Documents/thailand/*.jpg')
                .pipe(watermark({
                    image: './src/watermark/thailand.png',
                    resize: '60%',
                    gravity: 'SouthEast'
                }))
        .pipe(gm(function(gmfile, done) {
            gmfile.size(function(err, size) {
                done(null, gmfile.resize(
                    size.width * 0.5,
                    size.height * 0.5
                ));
            });
        }))
        .pipe(imageminJpegtran()())
        .pipe(gulp.dest('./src/travel/thailand'));
});
