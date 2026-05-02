import { argv } from 'yargs';
import * as util from 'gulp-util';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Context, Module, ScreenMeta, Screen, FormScreen, MapFormScreen } from '../../utils/project/UIDef';
import { GEN_CODE_WEB_DIR, WEB_TEMPLATE_BASEPATH } from '../../config';
import { Generator } from '../../utils/project/generator';

class UIGenerator {
    modules: Array<Module>;

    public async Init(): Promise<void> {
        let context: Context = require('../../../../ui/uiMeta/Modules.json');
        let modules = this.GetAllModuleDetails(context.Modules);
        this.modules = modules;
        this.CreateDir(GEN_CODE_WEB_DIR);
        util.log('test');
    }

    public GenerateAllModule(): void {
        this.modules
            .forEach(x => this.GenerateModule(x));
    }

    public GenerateByName(name: string): void {
        this.modules
            .filter(x => x.ModuleName.toLowerCase() === name.toLowerCase())
            .forEach(x => this.GenerateModule(x));
    }

    public GenerateByScreen(moduleName: string, screenName: string): void {
        let module: Module = this.modules
            .find(x => x.ModuleName.toLowerCase() === moduleName.toLowerCase());
        let screen: ScreenMeta = module.Screens
            .find(y => y.Name.toLowerCase() === screenName.toLowerCase());
        this.GenerateScreen(module, screen);
    }

    public ListModule(): void {
        this.modules.forEach(x => this.WriteModuleName(x));
    }

    private WriteModuleName(module: Module): void {
        util.log(module.ModuleName);
    }

    private GenerateModule(module: Module): void {
        util.log(module.ModuleName + ' started.');
        this.GenerateScreens(module);
        util.log(module.ModuleName + ' completed.');
    }

    private GenerateScreens(module: Module): void {
        module.Screens
            .forEach(screen => this.GenerateScreen(module, screen));
    }

    private GenerateScreen(module: Module, screenMeta: ScreenMeta): void {
        let screenName: string = screenMeta.Name;
        let screenType: string = screenMeta.Type;

        //util.log('M:' + module.ModuleName + ', S:' + screenName);
        let modulePath = join(GEN_CODE_WEB_DIR, module.ModuleName);
        this.CreateDir(modulePath);
        //util.log('screentype -' + screenType);
        let generatedCodeFolder = join(modulePath, screenName);
        this.CreateDir(generatedCodeFolder);

        if (screenType === 'list') {
            let screenInfo: Screen = require('../../../../ui/uiMeta/' + module.ModuleName + '/' + screenName + '.json');
            util.log('List generation starts -> ' + screenInfo.Title);
            let listHtmlTemplate = join(WEB_TEMPLATE_BASEPATH, 'ListHtml.hbr');
            Generator.GenerateUI(listHtmlTemplate, generatedCodeFolder, screenInfo, screenName, '.html');

            let listCtrlTemplate = join(WEB_TEMPLATE_BASEPATH, 'ListCtrl.hbr');
            Generator.GenerateUI(listCtrlTemplate, generatedCodeFolder, screenInfo, screenName, '.js');
            let localizationCtrlTemplate = join(WEB_TEMPLATE_BASEPATH, 'ListLocalization.hbr');
            Generator.GenerateUI(localizationCtrlTemplate, generatedCodeFolder, screenInfo, screenName, '.json');

            util.log('List generation ends -> ' + screenInfo.Title);
        } else if (screenType === 'form') {
            let formScreenInfo: FormScreen = require('../../../../ui/uiMeta/' + module.ModuleName + '/' + screenName + '.json');
            util.log('Form generation starts -> ' + formScreenInfo.Title);
            let formHtmlTemplate = join(WEB_TEMPLATE_BASEPATH, 'FormHtml.hbr');
            Generator.GenerateUI(formHtmlTemplate, generatedCodeFolder, formScreenInfo, screenName, '.html');

            let formCtrlTemplate = join(WEB_TEMPLATE_BASEPATH, 'FormCtrl.hbr');
            Generator.GenerateUI(formCtrlTemplate, generatedCodeFolder, formScreenInfo, screenName, '.js');

            let localizationCtrlTemplate = join(WEB_TEMPLATE_BASEPATH, 'FormLocalization.hbr');
            Generator.GenerateUI(localizationCtrlTemplate, generatedCodeFolder, formScreenInfo, screenName, '.json');

            util.log('Form generation ends -> ' + formScreenInfo.Title);
        } else if (screenType === 'mapform') {
            let formScreenInfo: MapFormScreen = require('../../../../ui/uiMeta/' + module.ModuleName + '/' + screenName + '.json');
            util.log('Map form generation starts -> ' + formScreenInfo.Title);
            let formHtmlTemplate = join(WEB_TEMPLATE_BASEPATH, 'MapFormHtml.hbr');
            Generator.GenerateUI(formHtmlTemplate, generatedCodeFolder, formScreenInfo, screenName, '.html');

            let formCtrlTemplate = join(WEB_TEMPLATE_BASEPATH, 'MapFormCtrl.hbr');
            Generator.GenerateUI(formCtrlTemplate, generatedCodeFolder, formScreenInfo, screenName, '.js');

            let localizationCtrlTemplate = join(WEB_TEMPLATE_BASEPATH, 'MapFormLocalization.hbr');
            Generator.GenerateUI(localizationCtrlTemplate, generatedCodeFolder, formScreenInfo, screenName, '.json');

            util.log('Map form generation ends -> ' + formScreenInfo.Title);
        }

    }

    private GetAllModuleDetails(modules: Array<Module>): Array<Module> {
        return modules;
    }

    private CreateDir(path: string): void {
        if (!existsSync(path)) {
            mkdirSync(path);
        }
    }

}

export = () => {
    if (!argv.module && !argv.all && !argv.list) {
        DisplayHelp();
        return;
    }
    let gen = new UIGenerator();
    gen.Init()
        .then(() => {
            if (argv.all) {
                gen.GenerateAllModule();
            } else if (argv.module && argv.screen) {
                gen.GenerateByScreen(argv.module, argv.screen);
            } else if (argv.module) {
                gen.GenerateByName(argv.module);
            } else if (argv.list) {
                gen.ListModule();
            } else {
                DisplayHelp();
            }
        });
};

function DisplayHelp(): void {
    util.log(`
        usage
        gulp gen.ui --all                                       # to generage all module screens
        gulp gen.ui --module <modulename>                       # to generate module screens
        gulp gen.ui --module <modulename> --screen <screenname> # to generate screen by name
        gulp gen.ui --help                                      # to view help
    `);
}
