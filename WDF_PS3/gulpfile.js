const gulp = require('gulp'),
    sequence = require('run-sequence'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    prefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    debug = require('gulp-debug'),
    cahced = require('gulp-cached'),
    inject = require('gulp-inject'),
    npm = require('main-npm-files'),
    jshint = require('gulp-jshint'),
    plumber = require('gulp-plumber'),
    htmlhint = require('gulp-htmlhint'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    strip = require('gulp-strip-comments'),
    uglify = require('gulp-uglify-es').default;

const path = {
    srcHTML: './src',
    srcLess: './src/less',
    srcJS: './src/js',

    tmpHTML: './tmp',
    tmpCSS: './tmp/style',
    tmpJS: './tmp/js',

    libs: '/libs',

    dist: './dist',
    distFont: './dist/webfonts',
    distCSS: './dist/style',
    distJS: './dist/js'
};


//------------------- Dev -------------------
gulp.task('remove-all', () => {
    return gulp.src(path.tmpHTML + '/*')
        .pipe(clean());
});

//---------------- Own files ----------------
gulp.task('less', () => {
    return gulp.src(path.srcLess + '/**/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(prefixer())
        .pipe(gulp.dest(path.tmpCSS))
        // .pipe(browserSync.reload({stream: true}))
        .pipe(cahced('less'))
        .pipe(debug({
            title: 'LESS:',
            showCount: false
        }));
});

gulp.task('inject-css', ['less'], () => {
    return gulp.src(path.tmpHTML + '/**/*.html')
        .pipe(inject(gulp.src([
            path.tmpCSS + '/**/*.css',
            '!' + path.tmpCSS + path.libs + '/**/*'
        ]), {
            relative: true,
            quiet: true
        }))
        .pipe(gulp.dest(path.tmpHTML));
});

gulp.task('js', () => {
    return gulp.src(path.srcJS + '/**/*.js')
        .pipe(plumber())
        .pipe(jshint(false))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(path.tmpJS))
        .pipe(cahced('js'))
        .pipe(debug({
            title: 'JS: ',
            showCount: false
        }));
});

gulp.task('inject-js', ['js'], () => {
    return gulp.src(path.tmpHTML + '/**/*.html')
        .pipe(inject(gulp.src([
            path.tmpJS + '/**/*.js',
            '!' + path.tmpJS + path.libs + '/**/*'
        ]), {
            relative: true,
            quiet: true
        }))
        .pipe(gulp.dest(path.tmpHTML));
});

gulp.task('html', ['remove-all'], () => {
    return gulp.src(path.srcHTML + '/**/*.html')
        .pipe(plumber())
        .pipe(htmlhint())
        .pipe(htmlhint.failReporter())
        .pipe(gulp.dest(path.tmpHTML))
        .pipe(cahced('HTML'))
        .pipe(debug({
            title: 'HTML: ',
            showCount: false
        }));
});
//---------------- /Own files ----------------

//-------------------- NPM -------------------
gulp.task('npm-css', () => {
    return gulp.src(npm('dist/**/*.css'))
        .pipe(gulp.dest(path.tmpHTML + path.libs))
        .pipe(cahced('npm-css'))
        .pipe(debug({
            title: 'NPM-CSS: ',
            showCount: false
        }));
});

gulp.task('npm-js', () => {
    return gulp.src(npm('dist/**/*.js'))
        .pipe(gulp.dest(path.tmpHTML + path.libs))
        .pipe(cahced('npm-js'))
        .pipe(debug({
            title: 'NPM JS: ',
            showCount: false
        }));
});

gulp.task('inject-npm', ['npm-js', 'npm-css'], () => {
    return gulp.src(path.tmpHTML + '/**/*.html')
        .pipe(inject(gulp.src([
            path.tmpHTML + path.libs + '/**/*.css',
            path.tmpHTML + path.libs + '/**/*.js',
        ]), {
            relative: true,
            name: 'libs',
            quiet: true
        }))
        .pipe(gulp.dest(path.tmpHTML));
});
//------------------- /NPM -------------------
gulp.task('inject-all', () => {
    sequence('html', 'inject-css', 'inject-js', 'inject-npm',  () => {
        browserSync.reload();
    });
});

gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: path.tmpHTML
        },
        logFileChanges: false,
        notify: false
    });
});

gulp.task('default', ['browser-sync', 'inject-all'], () => {
    return watch([
        path.srcLess + '**/*.less',
        path.srcJS + '/**/*.js',
        path.srcHTML + '/**/*.html',
        './package.json'
    ], () => {
        sequence('inject-all');
    })
});
//------------------ /Dev -------------------

//------------------ Build ------------------
gulp.task('remove-dist', () => {
    return gulp.src(path.dist + '/*')
        .pipe(clean());
});
//---------------- Build CSS ----------------
gulp.task('build-css', () => {
    return gulp.src([
        path.tmpHTML + path.libs + '/**/*.css',
        path.tmpCSS + '/**/*.css'
    ])
        .pipe(minifycss())
        .pipe(concat('style.css'))
        .pipe(gulp.dest(path.distCSS));
});

gulp.task('build-font', () => {
    return gulp.src([
        path.tmpHTML + path.libs + '/**/*.ttf',
        path.tmpHTML + path.libs + '/**/*.woff2'
    ])
        .pipe(rename({dirname: ''}))
        .pipe(debug())
        .pipe(gulp.dest(path.distFont));
});
//--------------- /Build CSS ----------------

//---------------- Build JS -----------------

gulp.task('build-js', () => {
    return gulp.src([
        path.tmpHTML + path.libs + '/**/*.js',
        path.tmpJS + '/**/*.js'
    ])
        .pipe(uglify())
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest(path.distJS));
});

//--------------- /Build JS -----------------

gulp.task('pre-build', () => {
    sequence('remove-dist', ['build-css', 'build-font', 'build-js']);
});

gulp.task('build', ['pre-build'], () => {
    return gulp.src(path.srcHTML + '/**/*.html')
        .pipe(inject(gulp.src(path.distJS + '/**/*.js', {read: false}), {relative: false, ignorePath: 'dist'}))
        .pipe(inject(gulp.src(path.distCSS + '/**/*.css', {read: false}), {relative: false, ignorePath: 'dist'}))
        .pipe(strip())
        .pipe(gulp.dest(path.dist));
});
//----------------- /Build ------------------