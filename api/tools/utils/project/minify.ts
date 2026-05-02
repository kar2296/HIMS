
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import * as glob from 'glob';


export class MinifyUtil {
    private static uglify:any = require('uglify-es');
    public static minify(source: string, dest: string, options: {}) {
        if (existsSync(source)) {
            console.info(source);
            const code = readFileSync(source, 'utf-8');
            const result = MinifyUtil.uglify.minify(code);
            if (result.error) {
                console.error(result.error);
            }
            writeFileSync(dest, result.code, 'utf-8');
        } else {
            console.error(`File Not found in path - ${source}`);
        }
    }
    public static minifyFolder(basepath:string, pattern: string[], dest: string, option: {}) {
        (pattern || []).forEach((source) => {
            console.log(`***************${source} Starts *************`);
            const files = glob.sync(source, { sync: true }) || [];
            console.warn(files);
            files.forEach((file) => {
                if (source.startsWith('./') && !file.startsWith('./')) {
                    file = `./${file}`;
                }
                const fileName = file.replace(basepath, '');
                MinifyUtil.minify(file, join(dest, fileName), option);
            });
            console.log(`***************${source} End *************`);
        });
    }
}
