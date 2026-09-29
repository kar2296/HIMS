import * as gulp from 'gulp';
import { join } from 'path';
var jsonfile = require('jsonfile');
import * as gulpLoadPlugins from 'gulp-load-plugins';
import { PROD_DEST, PROD_DEST_ZIP, APP_SRC } from '../../config';
const plugins = <any>gulpLoadPlugins();

let pkgPath = join(APP_SRC, '../package.json');

export = () => {
    let version = updateVersion();
    // let d = new Date();
    // let timeStamp = '' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '-' + d.getHours() + '-' + d.getMinutes();
    return gulp.src([
        join(PROD_DEST, '**', '*.*'),
        pkgPath
    ])
        .pipe(plugins.zip('pkvpharmacy-' + version + '.zip'))
        .pipe(gulp.dest(PROD_DEST_ZIP));
};

function copyToProd(json: any) {
    json.scripts = {};
    json.license = '';
    json.devDependencies = {};
    json.main = 'index.js';
    jsonfile.writeFileSync(join(PROD_DEST, 'package.json'), json, { spaces: 2 });
}

function updateVersion() {
    let pkg = jsonfile.readFileSync(pkgPath);
    let version = (pkg.version as string).split('.');
    let build = Number.parseInt(version[version.length - 1]);
    version[version.length - 1] = (build + 1).toString();
    pkg.version = version.join('.');
    console.log('Updated Package Version Number: ' + pkg.version);
    jsonfile.writeFileSync(pkgPath, pkg, { spaces: 2 });
    copyToProd(pkg);
    return pkg.version;
}
