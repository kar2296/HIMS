import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import {join} from 'path';
import {APP_SRC, ENUM_DIR} from '../../config';
import { makeTsProject} from '../../utils';
const plugins = <any>gulpLoadPlugins();

export = () => {
    let tsProject = makeTsProject();
    let src = [
        join(APP_SRC, '**/*.e.ts')
    ];

    let projectFiles = gulp.src(src);
    let result = projectFiles
        .pipe(plugins.debug())
        .pipe(plugins.plumber())
        .pipe(tsProject());


    return result.js
        .pipe(plugins.concat('enum.js'))
        .pipe(gulp.dest(ENUM_DIR));
};
