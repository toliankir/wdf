const gulp = require('gulp'),
    browserSync = require('browser-sync'),
    sequence = require('run-sequence'),
    plugins = require('gulp-load-plugins')();

const mask = {
    html: '*.html',
    less: '**/*.less',
    css: '**/*.css',
    js: '**/*.js'
};

const path = {
    main: '.',
    src: './src',
    srcJs: './src/js',
    srcLess: './src/less',
    dist: './dist',
    distVendor: './dist/vendor',
    assets: './assets'
};

//Removes prev distributive before start.
gulp.task('remove-dist', () => {
    return gulp.src(path.dist, {read: false})
        .pipe(plugins.clean());
});

//-------------------------- Vendor --------------------------
gulp.task('vendor-bower', () => {
    gulp.src('./bower.json')
        .pipe(plugins.mainBowerFiles())
        .pipe(plugins.uglifyEs.default())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.debug({
            title: 'Bower JS:',
            showCount: false
        }))
        .pipe(plugins.rename({dirname: ''}))
        .pipe(gulp.dest(path.distVendor));
});

gulp.task('vendor-npm', () => {
    gulp.src(plugins.mainNpmFiles())
        .pipe(plugins.uglifyEs.default())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.debug({
            title: 'NPM JS:',
            showCount: false
        }))
        .pipe(gulp.dest(path.distVendor));

    gulp.src(plugins.styleNpmFiles())
        .pipe(plugins.minifyCss())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.debug({
            title: 'NPM CSS:',
            showCount: false
        }))
        .pipe(gulp.dest(path.distVendor));
});

//------------------------- /Vendor --------------------------

//------------------------ Own Files -------------------------
gulp.task('own-js', () => {
    return gulp.src(path.srcJs + '/' + mask.js)
        .pipe(plugins.plumber())
        .pipe(plugins.jshint(false))
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.concat('script.min.js'))
        .pipe(plugins.uglifyEs.default())
        .pipe(plugins.debug({
            title: 'Own JS:',
            showCount: false
        }))
        .pipe(gulp.dest(path.dist));
});

gulp.task('own-less', () => {
    return gulp.src(path.srcLess + '/' + mask.less)
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer())
        .pipe(plugins.minifyCss())
        .pipe(plugins.concat('style.min.css'))
        .pipe(plugins.debug({
            title: 'Own LESS:',
            showCount: false
        }))
        .pipe(gulp.dest(path.dist));
});

gulp.task('own-html', () => {
    return gulp.src(path.src + '/' + mask.html)
        .pipe(plugins.plumber())
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.failReporter());
});
//----------------------- /Own Files -------------------------

//Injects all files from distributive folder to html files.
gulp.task('inject-all', () => {
    return gulp.src([path.src + '/' + mask.html])
        .pipe(plugins.inject(gulp.src(path.dist + '/*.css', {read: false}), {
            quiet: true,
            removeTags: true
        }))
        .pipe(plugins.debug({
            title: 'HTML inject:',
            showCount: false
        }))
        .pipe(plugins.inject(gulp.src(path.dist + '/*.js', {read: false}), {
            quiet: true,
            removeTags: true}))
        .pipe(plugins.inject(gulp.src(path.distVendor + '/' + mask.js, {read: false}), {
            name: 'libs',
            quiet: true,
            removeTags: true}))
        .pipe(plugins.inject(gulp.src(path.distVendor + '/' + mask.css, {read: false}), {
            name: 'libs',
            quiet: true,
            removeTags: true}))
        .pipe(gulp.dest(path.main));
});

gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: path.main
        },
        logFileChanges: false,
        notify: false
    });
});

//Run all tasks in selected order
gulp.task('build', () => {
    return sequence('remove-dist', ['vendor-bower', 'vendor-npm', 'own-js', 'own-less', 'own-html'], 'inject-all', 'browser-sync');
});


gulp.task('watch', ['build'], () => {
    plugins.watch(path.srcLess + mask.less, () => {
        sequence('own-less', 'inject-all', () => {
            browserSync.reload();
        })
    });

    plugins.watch(path.srcJs + mask.js, () => {
        sequence('own-js', 'inject-all', () => {
            browserSync.reload();
        })
    });

    plugins.watch(path.main + mask.html, () => {
        sequence('own-html', 'inject-all', () => {
            browserSync.reload();
        })
    });
});

//-------------------------- Help ----------------------------
gulp.task('default', () => {
    console.log('Run \'gulp --silent watch\' for working. \n' +
        'That collects all dependencies and user files to distributive folder.\n' +
        'Then starts web server on 3000 port and watching for user files changing.');
});