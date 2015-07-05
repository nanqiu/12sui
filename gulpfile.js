var gulp = require('gulp');
var watermark = require('gulp-watermark');
var tap = require('gulp-tap');
//var imagemin = require('gulp-imagemin');
var imageminJpegtran = require('imagemin-jpegtran');
var gm = require('gulp-gm');
var rimraf = require('gulp-rimraf');
var markdown = require('gulp-markdown');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var path = require('path');
var file = require('gulp-file');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var mincss = require('gulp-minify-css');
var sizeOf = require('image-size');

gulp.task('watermark', function() {
    return gulp.src('/Users/nannan/Documents/test/*.png')
        .pipe(watermark({
            image: './src/watermark/12.png',
            //resize: '60%',
            gravity: 'SouthEast'
        }))
        .pipe(gm(function(gmfile, done) {
            gmfile.size(function(err, size) {
                done(null, gmfile.resize(
                    size.width * 1,
                    size.height * 1
                ));
            });
        }))
        .pipe(imageminJpegtran()())
        .pipe(gulp.dest('./src/travel/xitianmu'));
});

gulp.task('clean', function() {
    return gulp.src('./res/')
        .pipe(rimraf({
            force: true
        }));
});

var lists = [];

var hash = {
    movie: '电影',
    travel: '旅行',
    book: '读书',
    stamp: '邮票'
};

var imageSize = {};

gulp.task('imagesize', function() {

    return gulp.src(['./src/**/*.jpg', './src/**/*.png', '!./src/watermark/*.png'])
        .pipe(tap(function(file) {
            imageSize[path.relative('./', file.path)] = sizeOf(file.path);
        }));

});

// 生成文章 id
var ids = {};

function getId(name) {
    return name.replace(/^(\d{4}\.\d{2}\.\d{2})\s(.+)$/, function(all, date, str) {
        var ret = date.replace(/\./g, '') + '-' + str.length;
        if (ids[ret]) {
            if (name !== ids[ret]) {
                console.error('重复 id：' + ids[ret] + ', ' + name);
            }
        } else {
            ids[ret] = name;
        }
        return ret;
    });
}

gulp.task('article', ['clean', 'imagesize'], function() {

    //console.log(imageSize);

    return gulp.src('./src/**/*.md')
        .pipe(tap(function(file) {
            //console.log(file.path, path.relative('./article', file.path.replace(/\/[^\/]+$/, '/')));
            // 提取相关内容
            var dateReg = /\/(\d{4}\.\d{2}\.\d{2})\s/;
            var tagReg = /\/(\w+)\/[^\/]+$/;
            var titleReg = /\d{4}\.\d{2}\.\d{2}\s(.+)\.md/;
            var title = file.path.match(titleReg)[1];
            var tag = file.path.match(tagReg)[1];
            var date = file.path.match(dateReg)[1];
            file.contents = new Buffer(
                file.contents.toString()
                .replace(/(\]\()\.\//g, '$1' + path.relative('./', file.path.replace(/\/[^\/]+$/, '/')) + '/')
                .replace(/(^#\s.+\n)/, '$1>发表时间：' + date + '，所属分类：<a href="#tag/' + tag + '">' + hash[tag] + '</a>\n')
            );
            lists.push({
                title: title,
                tag: tag,
                date: date,
                href: getId(file.path.replace(/^.+\/([^\/]+)\.md$/, '$1'))
            });
        }))
        .pipe(markdown())
        .pipe(tap(function(file) {
            file.contents = new Buffer(
                file.contents.toString().replace(/(<img\ssrc=)"([^"]+)"/g, function(all, prefix, href) {
                    var size = imageSize[href];
                    return prefix + '"about:blank" class="lazy" data-original="' + href + '" width="' + size.width + '" height="' + size.height + '"';
                })
            );
        }))
        .pipe(rename(function(path) {
            path.dirname = '';
            path.basename = getId(path.basename);
        }))
        .pipe(gulp.dest('./article'));

});

gulp.task('list', ['article'], function() {
    var content = JSON.stringify({
        tags: [{
            name: '电影',
            link: 'movie'
        }, {
            name: '旅行',
            link: 'travel'
        }, {
            name: '读书',
            link: 'book'
        }, {
            name: '邮票',
            link: 'stamp'
        }],
        lists: lists.sort(function(a, b) {
            return a.date > b.date ? -1 : 1;
        })
    });
    return file('list.json', content, {
        src: true
    }).pipe(gulp.dest('./article'));
});

gulp.task('concat', ['clean'], function() {
    return gulp.src(['./src/assets/jquery-2.1.4.min.js', './src/assets/underscore-min.js', './src/assets/backbone-min.js', './src/assets/jquery.lazyload.min.js'])
        .pipe(concat('base.js'))
        .pipe(tap(function(file) {
            file.contents = new Buffer(
                file.contents.toString().replace(/\/\/#\ssourceMappingURL.+\n*/g, '')
            );
        }))
        .pipe(gulp.dest('./res/'));
});

gulp.task('uglify', ['clean'], function() {
    return gulp.src('./src/assets/main.js')
        .pipe(uglify())
        .pipe(gulp.dest('./res/'));
});

gulp.task('cssmin', ['clean'], function() {
    return gulp.src('./src/assets/*.css')
        .pipe(mincss())
        .pipe(gulp.dest('./res/'));
});

gulp.task('default', ['clean', 'article', 'list', 'concat', 'uglify', 'cssmin']);
