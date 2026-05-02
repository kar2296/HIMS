import * as gulp from 'gulp';
//import * as gulpLoadPlugins from 'gulp-load-plugins';
import * as merge from 'merge-stream';
import { join } from 'path';
import { PROD_DEST, TMP_DIR } from '../../config';
//const plugins = <any>gulpLoadPlugins();
const debug = require('gulp-debug');

export = () => merge(bundleShims());

// function getShims() {
//   let libs = DEPENDENCIES
//     .filter(d => /\.js$/.test(d.src));

//   return libs.filter(l => l.inject === 'shims')
//     .concat(libs.filter(l => l.inject === 'libs'))
//     .concat(libs.filter(l => l.inject === true))
//     .map(l => l.src);
// }

function bundleShims() {
  let src = [
    join(TMP_DIR, '**/*.js'),
    '!' + join(TMP_DIR, '**/*.ts')
  ];

  return gulp.src(src) //getShims()
    // Strip comments and sourcemaps
    // .pipe(plugins.uglify({
    //   mangle: false
    // }))
    //.pipe(plugins.concat(JS_PROD_SHIMS_BUNDLE))
    .pipe(debug({ title: 'production-js : ' }))
    .pipe(gulp.dest(PROD_DEST));
}
