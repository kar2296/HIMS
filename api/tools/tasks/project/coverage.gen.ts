import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
const plugins = <any>gulpLoadPlugins();

export = () => {
    gulp.src(['dist/**/*.spec.js'])
        //.pipe(plugins.debug())
        .pipe(plugins.jasmine({ verbose: true, captureExceptions: true }))
        .pipe(plugins.istanbul.writeReports({
            dir: './coverage',
            reporters: ['json', 'text-summary'], //'lcov','text',
            reportOpts: { dir: './coverage' }
        }))
        //.pipe(plugins.istanbul.enforceThresholds({ thresholds: { global: 10 } }))
        .once('end', () => {
            process.kill(process.pid, 'SIGINT');
            setTimeout(() => {
                process.exit(0);
            }, 100);
        });
};
