import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import { join } from 'path';
import * as util from 'gulp-util';

export class Generator {
    public static Generate(templatePath: string, destPath: string, data: any, fileName: string, suffix?: string): void {
        try {
            let source = fs.readFileSync(templatePath, 'utf-8');
            let template = Handlebars.compile(source);
            let view = { data: data, Name: fileName };
            let result = template(view);
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath);
            }
            let dfName = join(destPath, fileName + suffix);
            if (fs.existsSync(dfName)) {
                fs.unlinkSync(dfName);
            }
            fs.writeFileSync(dfName, result);
            util.log(dfName);
        } catch (ex) {
            util.log(ex);
        }
    }

    public static GenerateMulitple(templatePath: string, destPath: string, data: any[], fileNameProperty: string, suffix?: string): void {
        try {
            var list: Array<any> = data;
            // TODO: Group by TableName then loop.
            // list.ForEach(x => {
            //     let fileName = x[fileNameProperty];
            //     if (!fileName) {
            //         throw new Error(`'fileNameProperty' is not available in data`);
            //     }
            //     this.Generate(templatePath, destPath, x, fileName, suffix);
            // });
            console.log(list);
        } catch (ex) {
            util.log(ex);
        }
    }

    public static GenerateUI(templatePath: string, destPath: string, data: any, fileName: string, suffix?: string): void {
        try {
            let source = fs.readFileSync(templatePath, 'utf-8');
            let template = Handlebars.compile(source);
            let view = { data: data, Name: fileName };
            let result = template(view);
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath);
            }
            let dfName = join(destPath, fileName + suffix);
            if (fs.existsSync(dfName)) {
                fs.unlinkSync(dfName);
            }
            fs.writeFileSync(dfName, result);
        } catch (ex) {
            util.log(ex);
        }
    }
}
