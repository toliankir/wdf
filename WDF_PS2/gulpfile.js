const gulp = require('gulp'),
    less = require('gulp-less'),
    prefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    debug = require('gulp-debug'),
    inject = require('gulp-inject'),
    bower = require('main-bower-files'),
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

    dist: './dist'
};

//------------------- Dev -------------------
//---------------- Own files ----------------
gulp.task('less', () => {
    return gulp.src(path.srcLess + '/**/*.less')
        .pipe(less())
        .pipe(prefixer())
        .pipe(gulp.dest(path.tmpCSS))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('inject-css', ['less'], () => {
    return gulp.src(path.tmpHTML + '/**/*.html')
        .pipe(inject(gulp.src([
            path.tmpCSS + '/**/*.css',
            '!' + path.tmpCSS + path.libs + '/**/*'
        ]), {relative: true}))
        .pipe(gulp.dest(path.tmpHTML));
});

gulp.task('js', () => {
    return gulp.src(path.srcJS + '/**/*.js')
        .pipe(plumber())
        .pipe(jshint(false))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(path.tmpJS));
});

gulp.task('inject-js', ['js'], () => {
    return gulp.src(path.tmpHTML + '/**/*.html')
        .pipe(inject(gulp.src([
            path.tmpJS + '/**/*.js',
            '!' + path.tmpJS + path.libs + '/**/*'
        ]), {relative: true}))
        .pipe(gulp.dest(path.tmpHTML));
});

gulp.task('html', () => {
    return gulp.src(path.srcHTML + '/**/*.html')
        .pipe(plumber())
        .pipe(htmlhint())
        .pipe(htmlhint.failReporter())
        .pipe(gulp.dest(path.tmpHTML));
});
//---------------- /Own files ----------------

//------------------- Bower ------------------
gulp.task('bower-css', () => {
    return gulp.src(bower([
        '**/*.css',
        '**/*.ttf',
        '**/*.woff?'
    ]), {base: 'bower'})
        .pipe(gulp.dest(path.tmpCSS + path.libs));
});

gulp.task('bower-js', () => {
    return gulp.src(bower(['**/*.js']), {base: 'bower'})
        .pipe(gulp.dest(path.tmpJS + path.libs));
});

gulp.task('inject-bower', ['bower-js', 'bower-css'], () => {
    return gulp.src(path.tmpHTML + '/**/*.html')
        .pipe(inject(gulp.src([
            path.tmpCSS + path.libs + '/**/*.css',
            path.tmpJS + path.libs + '/**/*.js',
        ]), {relative: true, name: 'libs'}))
        .pipe(gulp.dest(path.tmpHTML));
});
//------------------ /Bower ------------------

//-------------------- NPM -------------------
gulp.task('npm-css', () => {
    return gulp.src(npm('**/*.css'))
        .pipe(gulp.dest(path.tmpCSS + path.libs));
});

gulp.task('npm-js', () => {
    return gulp.src(npm('**/*.js'))
        .pipe(gulp.dest(path.tmpJS + path.libs));
});

gulp.task('inject-npm', ['npm-js', 'npm-css'], () => {
    return gulp.src(path.tmpHTML + '/**/*.html')
        .pipe(inject(gulp.src([
            path.tmpCSS + path.libs + '/**/*.css',
            path.tmpJS + path.libs + '/**/*.js',
        ]), {relative: true, name: 'libs'}))
        .pipe(gulp.dest(path.tmpHTML));
});
//------------------- /NPM -------------------

gulp.task('inject-all', ['html', 'less', 'js', 'bower-js', 'bower-css', 'npm-css', 'npm-js'], () => {
    return gulp.src(path.tmpHTML + '/**/*.html')
        .pipe(inject(gulp.src([
            path.tmpCSS + '/**/*.css',
            path.tmpJS + '/**/*.js',
            '!' + path.tmpCSS + path.libs + '/**/*.css',
            '!' + path.tmpJS + path.libs + '/**/*.js'
        ]), {relative: true}))
        .pipe(inject(gulp.src([
            path.tmpCSS + path.libs + '/**/*.css',
            path.tmpJS + path.libs + '/**/*.js',
        ]), {relative: true, name: 'libs'}))
        .pipe(gulp.dest(path.tmpHTML));
});

gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: path.tmpHTML
        },
        notify: false
    });
});

gulp.task('start', ['browser-sync', 'inject-all'], () => {
    gulp.watch(path.srcLess + '/**/*.less', ['inject-css']);
    gulp.watch(path.srcJS + '/**/*.js', ['inject-js', browserSync.reload]);
    gulp.watch(path.srcHTML + '/**/*.html', ['inject-all', browserSync.reload]);

    gulp.watch('./bower.js', ['inject-bower', browserSync.reload])
    gulp.watch('./package.json', ['inject-npm', browserSync.reload])
});
//------------------ /Dev -------------------


//------------------ Build ------------------

//---------------- Build CSS ----------------
gulp.task('build-css', () => {
    return gulp.src(path.tmpCSS + '/**/*.css')
        .pipe(strip.text())
        .pipe(minifycss())
        .pipe(concat('style.css'))
        .pipe(gulp.dest(path.dist));
});
//--------------- /Build CSS ----------------

//---------------- Build JS -----------------

gulp.task('build-js', () => {
    return gulp.src(path.tmpJS + '/**/*.js')
        .pipe(strip.text())
        .pipe(uglify())
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest(path.dist));
});
//--------------- /Build JS -----------------

gulp.task('build', ['build-css', 'build-js'], () => {
    return gulp.src(path.srcHTML + '/**/*.html')
        .pipe(inject(gulp.src(path.dist + '/**/*.js'), {relative: true}))
        .pipe(inject(gulp.src(path.dist + '/**/*.css'), {relative: true}))
        .pipe(strip())
        .pipe(gulp.dest(path.dist));
});
//----------------- /Build ------------------