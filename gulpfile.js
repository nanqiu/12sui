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

gulp.task('watermark', function() {
    return gulp.src('/Users/nannan/Documents/thailand/*.jpg')
        .pipe(watermark({
            image: './src/watermark/thailand.png',
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

gulp.task('clean', function() {
    return gulp.src('./dist/')
        .pipe(rimraf());
});

var lists = [];

var hash = {
    movie: '电影',
    travel: '旅行',
    book: '读书',
    stamp: '邮票'
};

// 生成文章 id
function getId(name) {
    return name.replace(/^(\d{4}\.\d{2}\.\d{2})\s(.+)$/, function(all, date, str) {
        return date.replace(/\./g, '') + '-' + str.length;
    });
}

gulp.task('article', ['clean'], function() {

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
                .replace(/(^#\s.+\n)/, '$1>发表时间：' + date + '，所属分类：' + hash[tag] + '\n')
            );
            lists.push({
                title: title,
                tag: tag,
                date: date,
                href: getId(file.path.replace(/^.+\/([^\/]+)\.md$/, '$1'))
            });
        }))
        .pipe(markdown())
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
    }, null, 4);
    return file('list.json', content, {
        src: true
    }).pipe(gulp.dest('./article'));
});

gulp.task('default', ['clean', 'article', 'list']);
