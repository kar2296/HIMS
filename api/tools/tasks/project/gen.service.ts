// import {argv} from 'yargs';
// import * as fs from 'fs';
// import * as Handlebars from 'handlebars';
// import * as util from 'gulp-util';
// import {TableBO} from '../../utils/project/tableBO';
// import {BOFactory} from '../../../src/bo';
// //import {Dal} from '../../../src/dal';
// //import {List} from 'linqts';


// export = () => {
//     var table = BOFactory.CreateBO(TableBO);
//     table.GetAllColumnDetails().then((tables) => {
//         util.log(JSON.stringify(argv.TableName));
//         let source = fs.readFileSync('./tools/generator/templates/service.hbr', 'utf-8');
//         let template = Handlebars.compile(source);
//         let data = {
//             name: 'test.ts',
//             msg: 'success.'
//         };
//         var result = template(data);
//         let serviceDestPath = './tools/generator/code/service/';
//         if (!fs.existsSync(serviceDestPath)) {
//             fs.mkdirSync(serviceDestPath);
//         }
//         fs.writeFileSync(serviceDestPath + 'json.json', JSON.stringify(tables));
//         fs.writeFileSync(serviceDestPath + data.name, result);
//         util.log('end');
//     });
// };

