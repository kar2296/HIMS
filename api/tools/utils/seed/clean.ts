import * as util from 'gulp-util';
import * as chalk from 'chalk';
import * as rimraf from 'rimraf';

export function clean(paths: string | string[]): (done: () => void) => void {
  return done => {
    let pathsArray: string[];
    if (!(paths instanceof Array)) {
      pathsArray = [<string>paths];
    } else pathsArray = paths;
    let promises = pathsArray.map(p => {
      return new Promise<void>(resolve => {
        rimraf(p, e => {
          if (e) {
            util.log('Clean task failed with', e);
          } else {
            util.log('Deleted', (chalk as any).yellow(p || '-'));
          }
          resolve();
        });
      });
    });
    Promise.all(promises).then(() => done());
  };
}
