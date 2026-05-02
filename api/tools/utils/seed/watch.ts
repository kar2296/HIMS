import { notifyLiveReload } from '../../utils';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import { join } from 'path';
import { APP_SRC } from '../../config';
import * as gulp from 'gulp';

const plugins = <any>gulpLoadPlugins();

export function watch(taskname: string) {
  return function () {
    plugins.watch(join(APP_SRC, '**'), function(event: any) {
      gulp.series(taskname)(function() {
        notifyLiveReload(event);
      });
    });
  };
}
