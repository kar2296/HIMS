import { join } from 'path';
import { APP_DEST } from '../../config';
import { MinifyUtil } from '../../utils/project/minify';

export = () => {
    const source = [
        join(APP_DEST, 'config/**/*.js'),
        join(APP_DEST, 'job/**/*.js'),
        join(APP_DEST, 'Server/**/*.js'),
        join(APP_DEST, 'ui/app/**/*.js'),
        join(APP_DEST, '*.js'),
    ];
    return MinifyUtil.minifyFolder(APP_DEST, source, APP_DEST, {});
};
