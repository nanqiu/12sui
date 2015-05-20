var gulp = require('gulp');
var watermark = require('gulp-watermark');
var tap = require('gulp-tap');
//var imagemin = require('gulp-imagemin');
var imageminJpegtran = require('imagemin-jpegtran');
var gm = require('gulp-gm');

gulp.task('watermark', function() {
    return gulp.src('./src/travel/newzealand/000.jpg')
                .pipe(watermark({
                    image: './src/watermark/newzealand.png',
                    resize: '60%',
                    gravity: 'SouthEast'
                }))
        //.pipe(smushit())
        .pipe(gm(function(gmfile, done) {
            gmfile.size(function(err, size) {
                done(null, gmfile.resize(
                    size.width * 0.5,
                    size.height * 0.5
                ));
            });
        }))
        .pipe(imageminJpegtran()())
        .pipe(gulp.dest('./dist'));
});
