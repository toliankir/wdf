const gulp = require('gulp'),
    sequence = require('run-sequence'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    prefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    debug = require('gulp-debug'),
    cached = require('gulp-cached'),
    inject = require('gulp-inject'),
    bower = require('main-bower-files'),
    npm = require('main-npm-files'),
    jshint = require('gulp-jshint'),
    plumber = require('gulp-plumber'),
    htmlhint = require('gulp-htmlhint'),
    minifycss = require('gulp-minify-css'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify-es').default,
    systemPath = require('path');

const path = {
    src: './src',
    srcLess: './src/less',
    srcJS: './src/js',
    dist: './dist'
};

gulp.task('remove-dist', () => {
    return gulp.src(path.dist + '/*')
        .pipe(clean());
});

//---------------- Own files ----------------

//---------------- CSS files ----------------
gulp.task('own-css', () => {
    return gulp.src(path.srcLess + '/**/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(prefixer())
        .pipe(minifycss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.dist))
        .pipe(cached('own-css'))
        .pipe(debug({
            title: 'Own LESS:',
            showCount: false
        }));
});

gulp.task('vendor-css', async () => {
    return gulp.src(npm('dist/**/*.css').concat(bower(['**/*.css'])))
        .pipe(minifycss())
        .pipe(debug({
            title: 'Vendor CSS: ',
            showCount: false
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.dist));
});

gulp.task('inject-css', () => {
    return gulp.src(path.dist + '/**/*.html')
        .pipe(inject(gulp.src(path.dist + '/**/*.css'), {
            ignorePath: 'dist',
            quiet: true
        }))
        .pipe(gulp.dest(path.dist));
});
//---------------- /CSS files ----------------

//----------------- JS files -----------------
gulp.task('own-js', () => {
    return gulp.src(path.srcJS + '/**/*.js')
        .pipe(plumber())
        .pipe(jshint(false))
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.dist))
        .pipe(cached('own-js'))
        .pipe(debug({
            title: 'Own JS: ',
            showCount: false
        }));
});

gulp.task('vendor-js', async () => {
    return gulp.src(npm('dist/**/*.js').concat(bower(['**/*.js'])))
        .pipe(uglify())
        .pipe(debug({
            title: 'Vendor JS: ',
            showCount: false
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.dist));
});

function getDistPath(filePath) {
    return '<script src="/' + systemPath.basename(filePath, '.js') + '.min.js' + '"></script>';
}

gulp.task('inject-js', () => {
    return gulp.src(path.dist + '/**/*.html')
        .pipe(inject(gulp.src(npm('dist/**/*.js').concat(bower(['**/*.js'])), {read: false}), {
            name: 'libs',
            transform: function (filePath) {
                return getDistPath(filePath);
            },
            quiet: true
        }))
        .pipe(inject(gulp.src(path.srcJS + '/**/*.js', {read: false}), {
            transform: function (filePath) {
                return getDistPath(filePath);
            },
            quiet: true
        }))
        .pipe(gulp.dest(path.dist));
});
//---------------- /JS files -----------------
gulp.task('html', () => {
    return gulp.src(path.src + '/**/*.html')
        .pipe(plumber())
        .pipe(htmlhint())
        .pipe(htmlhint.failReporter())
        .pipe(gulp.dest(path.dist))
        .pipe(cached('HTML'))
        .pipe(debug({
            title: 'HTML: ',
            showCount: false
        }));
});

gulp.task('copy-all', ['html', 'vendor-js', 'vendor-css', 'own-css', 'own-js']);

gulp.task('build', () => {
    sequence('remove-dist', 'copy-all', 'inject-js', 'inject-css');
});

gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: path.dist
        },
        logFileChanges: false,
        notify: false
    });
});

gulp.task('watch', ['browser-sync', 'build'], () => {
    return watch([
        path.srcLess + '**/*.less',
        path.srcJS + '/**/*.js',
        path.src + '/**/*.html'
    ], () => {
        sequence(['own-css', 'own-js', 'html'], 'inject-js', 'inject-css', () => {
            browserSync.reload();
        });

    })
});

gulp.task('help', () => {
    console.log('gulp watch     # Watch files.');
    console.log('gulp build     # Build files.');
    console.log('Better run with argument --silent:');
    console.log('gulp --silent watch');
    console.log('gulp --silent build');
});

gulp.task('default', () => {
    console.log('Run "gulp help" for help.');
});