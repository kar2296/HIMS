import * as Client from 'ftp';
import { join } from 'path';
import * as util from 'gulp-util';
import { APP_SRC, PROD_DEST_ZIP } from '../../config';
import { readFileSync } from 'fs';
let pkgPath = join(APP_SRC, '../package.json');

export = (done: any) => {
    const client = new Client();
    client.on('ready', function () {
        const jsonfile = require('jsonfile');
        const pkg = jsonfile.readFileSync(pkgPath);
        const file = `gloomsoft-${pkg.version}.zip`;
        const content = readFileSync(join(PROD_DEST_ZIP, file));
        util.log(`Content Length - ${content.length}`);
        client.put(content, join('releases', 'hm', file), function (err) {
            if (err) throw err;
            client.end();
            util.log('File uploaded to ftp successfully.');
            done();
        });
    });
    // connect to localhost:21 as anonymous
    const ftpConf = {
        host: process.env.FTP_HOST || undefined,
        user: process.env.FTP_USER || undefined,
        password: process.env.FTP_PASSWORD || undefined,
        secure: process.env.FTP_SECURE === 'true' ? true : undefined,
        port: process.env.FTP_PORT ? Number(process.env.FTP_PORT) : undefined
    };
    util.log(ftpConf);
    client.connect(ftpConf);
};
