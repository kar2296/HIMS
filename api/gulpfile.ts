import { config } from 'dotenv';
config({ path: 'tools.env' });

import * as gulp from 'gulp';
import { loadTasks } from './tools/utils';
import { SEED_TASKS_DIR, PROJECT_TASKS_DIR } from './tools/config';

loadTasks(SEED_TASKS_DIR);
loadTasks(PROJECT_TASKS_DIR);

// Build dev
gulp.task('build.dev', gulp.series(
  'clean.dev',
  'tslint',
  'build.js.dev',
  'copy.assets'
));

// Build dev watch
gulp.task('build.dev.watch', gulp.series(
  'build.dev',
  'watch.dev'
));

// Build e2e
gulp.task('build.e2e', gulp.series(
  'clean.dev',
  'tslint',
  'build.assets.dev',
  'build.js.e2e',
  'build.index.dev'
));

// Build prod
gulp.task('build.prod', gulp.series(
  'clean.prod',
  'build.assets.prod',
  'copy.js.prod',
  'build.js.prod',
  'build.bundles',
  'copy.assets',
  'copy.ui',
  'minify',
  'zip'
));

// Build publish
gulp.task('build.publish', gulp.series('publish'));

// Build test
gulp.task('build.test', gulp.series(
  'clean.dev',
  'tslint',
  'build.assets.dev',
  'build.js.test'
));

// Build test watch
gulp.task('build.test.watch', gulp.series(
  'build.test',
  'watch.test'
));

// Build tools
gulp.task('build.tools', gulp.series(
  'clean.tools',
  'build.js.tools'
));

// Docs
gulp.task('docs', gulp.series(
  'build.docs',
  'serve.docs'
));

// Serve dev
gulp.task('serve.dev', gulp.series(
  'build.dev',
  'server.start',
  'watch.dev'
));

// Serve e2e
gulp.task('serve.e2e', gulp.series(
  'build.e2e',
  'server.start',
  'watch.e2e'
));

// Serve prod
gulp.task('serve.prod', gulp.series(
  'build.prod',
  'server.prod'
));
