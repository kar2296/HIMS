import * as gulp from 'gulp';
const debug = require('gulp-debug');
var replace = require('gulp-replace');
// import { APP_SRC } from '../../config';

export = () => {
    // return gulp.src(join(APP_SRC, '**/*.Model.ts'))
    //return gulp.src('/Users/NatarajanG/BitBucket/code/api/src/Server/Modules/SystemSettings/Model/Facility.Model.ts')
    const src = ['D:/Personal/Projects/zerofence/gloomsoft-dev/code/api/src/Server/Modules/**/*.Model.ts'];
    return gulp.src(src)
        .pipe(debug({ title: 'Model files :' }))
        // tslint:disable-next-line:max-line-length
        .pipe(replace(/([\s]+classMethods: {)([\s]+)(associate: \(models: Models\): void => {)([\=\d\n\r\w\s\(\)',.:;/\{\}]+)(})([\s\r\n]+)(},)([\=\d;\n\r\w\s\(\)',.:/\{\}]+)(return)(\s)([\w]+)(;)/,
            `$8 ($11 as any).associate = function(models: Models) {$4};\n $9$10$11$12`
        ))
        // tslint:disable-next-line:max-line-length
        .pipe(replace(/[\s]+(classMethods: {)([\s]+)(equalComparer: )([\s\w:.,=&;>/\{\}\(\)]+)(,)([\s]+)(associate: \(models: Models\): void => {)([\=\d\n\r\w\s\(\)',.:;/\{\}]+)(})([\s\r\n]+)(},)([\=\d;\n\r\w\s\(\)',.:\{\}]+)(return)(\s)([\w]+)(;)/,
            `$12 ($15 as any).associate = function(models: Models) {$8};\n $13$14$15$16`
        ))
        .pipe(gulp.dest('./src/Server/Modules/'));
};
