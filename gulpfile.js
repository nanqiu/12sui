var gulp = require('gulp');
var watermark = require('gulp-watermark');
var tap = require('gulp-tap');

gulp.task('watermark', function() {
    return gulp.src('./article/travel/newzealand/*.jpg')
        .pipe(watermark({
            image: './tool/watermark.png',
						resize: '100%',
            gravity: 'SouthEast'
        }))
        .pipe(gulp.dest('./dist'));
});
