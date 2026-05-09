const fs = require('fs');
let content = fs.readFileSync('api/src/Server/Modules/SystemSettings/Router/Auth.ts', 'utf8');

const target1 = `                            let maxAttempts = (facilitySetting && facilitySetting.dataValues && facilitySetting.dataValues.MaxFailedLoginAttempts) ? facilitySetting.dataValues.MaxFailedLoginAttempts : 10;`;
const replace1 = `                            let maxAttempts = (facilitySetting && facilitySetting.dataValues && 
                                facilitySetting.dataValues.MaxFailedLoginAttempts) ? 
                                facilitySetting.dataValues.MaxFailedLoginAttempts : 10;`;

const target2 = `                let defaultPwd = (facilitySetting && facilitySetting.dataValues && facilitySetting.dataValues.DefaultPwd) ? facilitySetting.dataValues.DefaultPwd : 'Default@123';
                `;
const replace2 = `                let defaultPwd = (facilitySetting && facilitySetting.dataValues && 
                    facilitySetting.dataValues.DefaultPwd) ? 
                    facilitySetting.dataValues.DefaultPwd : 'Default@123';`;

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);

fs.writeFileSync('api/src/Server/Modules/SystemSettings/Router/Auth.ts', content);
