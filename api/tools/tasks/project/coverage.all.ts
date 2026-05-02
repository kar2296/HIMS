import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';

const plugins = <any>gulpLoadPlugins();

export = () => {
    return gulp.src(['dist/**/!(*spec).js'])
        //.pipe(plugins.debug())
        .pipe(plugins.istanbul({ includeUntested: true }))
        .pipe(plugins.istanbul.hookRequire());
};
