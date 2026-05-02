import { config } from 'dotenv';
config();


import { argv } from 'yargs';
import * as util from 'gulp-util';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Generator } from '../../utils/project/generator';
import { MODULE_TEMPLATE_BASEPATH, GEN_CODE_MODULE_DIR } from '../../config';
import { TableBO, Context, Module, Entity, Column } from '../../utils/project/TableBo';
import { BoFactory } from '../../../src/Server/Modules/Base/Index';
//import {ApiRequest} from '../../../src/Server/Common';

const SqlToTypescriptMapper: { [key: string]: string } = {
    bigint: 'number',
    int: 'number',
    double: 'number',
    varchar: 'string',
    datetime: 'Date',
    bit: 'boolean',
    time: 'string',
    varbinary: 'string'
};
const SqlToSequelizeMapper: { [key: string]: string } = {
    bigint: 'DataTypes.BIGINT',
    //test: 'DataTypes.ABSTRACT';
    varchar: 'DataTypes.STRING',
    varbinary: 'DataTypes.STRING.BINARY',
    char: 'DataTypes.CHAR',
    text: 'DataTypes.TEXT',
    //test: 'DataTypes.NUMBER';
    int: 'DataTypes.INTEGER',
    float: 'DataTypes.FLOAT',
    time: 'DataTypes.TIME',
    datetime: 'DataTypes.DATE',
    //test: 'DataTypes.DATEONLY';
    bit: 'DataTypes.BOOLEAN',
    //test: 'DataTypes.NOW';
    blob: 'DataTypes.BLOB',
    decimal: 'DataTypes.DECIMAL',
    // test: 'DataTypes.NUMERIC';
    //test: 'DataTypes.UUID';
    //test: 'DataTypes.UUIDV1';
    //test: 'DataTypes.UUIDV4';
    //test: 'DataTypes.HSTORE';
    //test: 'DataTypes.JSON';
    //test: 'DataTypes.JSONB';
    //test: 'DataTypes.VIRTUAL';
    //test: 'DataTypes.ARRAY';
    //test: 'DataTypes.NONE';
    enum: 'DataTypes.ENUM',
    //test: 'DataTypes.RANGE';
    //test: 'DataTypes.REAL';
    double: 'DataTypes.DOUBLE'
};

class ModuleGenerator {
    modules: Array<Module>;
    Sql2SeqMapper: { [key: string]: string };
    Sql2TypeScriptMapper: { [key: string]: string };
    public constructor() {
        this.Sql2SeqMapper = SqlToSequelizeMapper;
        this.Sql2TypeScriptMapper = SqlToTypescriptMapper;
    }
    public async Init(): Promise<void> {
        let context: Context = require('../../../src/Server/Modules/Modules.json');
        let modules = await this.GetAllModuleDetails(context.Modules)
            .catch(this.log);
        this.modules = modules || [];
        this.CreateDir(GEN_CODE_MODULE_DIR);
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

    public ListModule(): void {
        this.modules.forEach(x => this.WriteModuleName(x));
    }

    private WriteModuleName(module: Module): void {
        util.log(module.ModuleName);
    }

    private GenerateModule(modlue: Module): void {
        this.log(modlue.ModuleName + ' started.');
        this.GenerateIndex(modlue);
        this.GenerateBusiness(modlue);
        this.GenerateModel(modlue);
        this.GenerateRouter(modlue);
        this.GenerateService(modlue);
        this.log(modlue.ModuleName + ' completed.');
    }

    private async GetAllModuleDetails(modules: Array<Module>): Promise<Array<Module>> {
        let promises: Array<Promise<void>> = [];
        modules.forEach(x => {
            let promise = this.GetAllTableDetailsForModule(x.Entities)
                .then(entities => {
                    x.Entities = entities;
                }).catch(this.log);
            promises.push(promise);
        });
        await Promise.all(promises);
        return modules;
    }

    private async GetAllTableDetailsForModule(tables: Array<Entity>): Promise<Array<Entity>> {
        let promises: Array<Promise<void>> = [];
        tables.forEach(x => {
            let promise = this.GetTableDetails(x.Table)
                .then(columns => {
                    x.Details = columns;
                }).catch(this.log);
            promises.push(promise);
        });
        await Promise.all(promises);
        return tables;
    }

    private async GetTableDetails(tableName: string): Promise<Array<Column>> {
        let bo: TableBO = BoFactory.GetBo(TableBO);
        let columns = await bo.GetColumnDetails(tableName);
        for (let column of columns) {
            column.SequelizeType = (<any>this.Sql2SeqMapper)[column.Type];
            column.TypescriptType = (<any>this.Sql2TypeScriptMapper)[column.Type];
        }
        return columns;
    }

    private GenerateIndex(moduleParam: Module): void {
        let modulePaht = join(GEN_CODE_MODULE_DIR, moduleParam.ModuleName);
        this.CreateDir(modulePaht);
        let indexTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Index.hbr');
        Generator.Generate(indexTemplatePath, modulePaht, null, 'Index', '.ts');
    }

    private GenerateBusiness(moduleParam: Module): void {
        let codePath = join(GEN_CODE_MODULE_DIR, moduleParam.ModuleName, 'Business');
        this.CreateDir(codePath);
        let boTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Business', 'Business.hbr');
        moduleParam.Business.forEach(x => {
            Generator.Generate(boTemplatePath, codePath, x, x.Name, 'Bo.ts');
        });
        let indexTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Business', 'Index.hbr');
        Generator.Generate(indexTemplatePath, codePath, moduleParam.Business, 'Index', '.ts');
    }

    private GenerateModel(moduleParam: Module): void {
        let modelPath = join(GEN_CODE_MODULE_DIR, moduleParam.ModuleName, 'Model');
        this.CreateDir(modelPath);
        this.GenerateModelInterface(moduleParam);
        let modelTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Model', 'Model.hbr');
        moduleParam.Entities.forEach(x => {
            Generator.Generate(modelTemplatePath, modelPath, x, x.Name, '.Model.ts');
        });
        let modelsTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Model', 'Models.hbr');
        Generator.Generate(modelsTemplatePath, modelPath, moduleParam.Entities, 'Models', '.ts');
    }

    private GenerateModelInterface(moduleParam: Module): void {
        let modelInterfacePath = join(GEN_CODE_MODULE_DIR, moduleParam.ModuleName, 'Model', 'Interface');
        this.CreateDir(modelInterfacePath);
        let ifTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Model', 'Interface', 'Interface.hbr');
        moduleParam.Entities.forEach(x => {
            Generator.Generate(ifTemplatePath, modelInterfacePath, x, x.Name, 'Interface.ts');
        });
        let indexTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Model', 'Interface', 'Index.hbr');
        Generator.Generate(indexTemplatePath, modelInterfacePath, moduleParam.Entities, 'Index', '.ts');
    }

    private GenerateRouter(moduleParam: Module): void {
        let routerPath = join(GEN_CODE_MODULE_DIR, moduleParam.ModuleName, 'Router');
        this.CreateDir(routerPath);
        let routeTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Router', 'Router.hbr');
        moduleParam.Service.forEach(x => {
            Generator.Generate(routeTemplatePath, routerPath, x, x.Name, 'Route.ts');
        });
        let routeSpecTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Router', 'Router.spec.hbr');
        moduleParam.Service.forEach(x => {
            Generator.Generate(routeSpecTemplatePath, routerPath, x, x.Name, 'Route.spec.ts');
        });
        let routerIndexTemplate = join(MODULE_TEMPLATE_BASEPATH, 'Router', 'Index.hbr');
        Generator.Generate(routerIndexTemplate, routerPath, moduleParam.Service, 'Index', '.ts');
    }

    private GenerateService(moduleParam: Module): void {
        let servicePath = join(GEN_CODE_MODULE_DIR, moduleParam.ModuleName, 'Service');
        this.CreateDir(servicePath);
        let serviceTemplatePath = join(MODULE_TEMPLATE_BASEPATH, 'Service', 'Service.hbr');
        moduleParam.Service.forEach(x => {
            Generator.Generate(serviceTemplatePath, servicePath, x, x.Name, 'Service.ts');
        });
        let serviceIndexTemplate = join(MODULE_TEMPLATE_BASEPATH, 'Service', 'Index.hbr');
        Generator.Generate(serviceIndexTemplate, servicePath, moduleParam.Service, 'Index', '.ts');
    }

    private CreateDir(path: string): void {
        if (!existsSync(path)) {
            mkdirSync(path);
        }
    }

    private log(message: string) {
        if (argv.log) {
            util.log(message);
        }
    }
}

export = () => {
    if (!argv.module && !argv.all && !argv.list) {
        DisplayHelp();
        return;
    }
    let gen = new ModuleGenerator();
    gen.Init()
        .then(() => {
            if (argv.all) {
                gen.GenerateAllModule();
            } else if (argv.module) {
                gen.GenerateByName(argv.module);
            } else if (argv.list) {
                gen.ListModule();
            } else {
                DisplayHelp();
            }
        }).catch(console.log);
};

// export = async (): Promise<void> => {
//     util.log('Started');
//     if (!argv.module && !argv.all && !argv.list) {
//         DisplayHelp();
//         return;
//     }
//     let gen = new ModuleGenerator();
//     let promise = await gen.Init()
//     if (argv.all) {
//         util.log('Started - All');
//         gen.GenerateAll();
//         util.log('Completed - All');
//     } else if (argv.module) {
//         util.log('Started - ' + argv.module);
//         gen.GenerateByName(argv.module);
//     } else if (argv.list) {
//         util.log('Started - List');
//         gen.ListModule();
//     } else {
//         util.log('Started - Help');
//         DisplayHelp();
//     }
//     util.log('Completed');
//     return promise;
// }


function DisplayHelp(): void {
    util.log(`
usage
gulp gen.module --module <modulename> [--log]   # to generate module class for a table
gulp gen.module --all [--log]                   # to generage module class for all table
gulp gen.module --list [--log]                  # to list all available tables
gulp gen.module --help [--log]                  # to view help
`);
}

// public async FillModuleDetails(moduleParam: Module): Promise<Module> {
    //     let req: ApiRequest<number, string> = { PageContext: null, Params: null, Id: null, UserContext: null, Data: null }
    //     let bo: TableBO = BoFactory.GetBo(TableBO, req);
    //     let tables = await Observable
    //         .from(moduleParam.Tables)
    //         .map(x => x.Name)
    //         .toArray()
    //         .toPromise()
    //         .catch(this.log);
    //     //this.log(JSON.stringify(tables));
    //     let columns = await bo.GetAllColumnDetails(tables)
    //         .catch(this.log);
    //     //this.log(JSON.stringify(columns));
    //     let tableGrp = await Observable
    //         .from(columns)
    //         .groupBy(x => x.Name)
    //         .toPromise()
    //         .catch(this.log);

    //     for (let item of moduleParam.Tables) {
    //         item.Details = (<any>tableGrp)[item.Name];
    //         this.log(JSON.stringify(item));
    //     }
    //     return moduleParam;
    // }
