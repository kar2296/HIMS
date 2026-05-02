import * as gulp from 'gulp';
import { join } from 'path';
import { PROD_DEST, WEB_DIR } from '../../config';

export = () => {
    return gulp.src([
        join(WEB_DIR, '**', '*.*'),
        // '!' + join(WEB_DIR, 'mock', '**', '*.*')
    ]).pipe(gulp.dest(PROD_DEST + '/ui'));
};
