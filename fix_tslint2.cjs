const fs = require('fs');
let content = fs.readFileSync('api/src/Server/Modules/SystemSettings/Router/Auth.ts', 'utf8');

const target1 = `                            let maxAttempts = (facilitySetting && facilitySetting.dataValues && 
                                facilitySetting.dataValues.MaxFailedLoginAttempts) ? 
                                facilitySetting.dataValues.MaxFailedLoginAttempts : 10;`;
const replace1 = `                            let fsData = facilitySetting && facilitySetting.dataValues;
                            let maxAttempts = (fsData && fsData.MaxFailedLoginAttempts) ? fsData.MaxFailedLoginAttempts : 10;`;

const target2 = `                let defaultPwd = (facilitySetting && facilitySetting.dataValues && 
                    facilitySetting.dataValues.DefaultPwd) ? 
                    facilitySetting.dataValues.DefaultPwd : 'Default@123';`;
const replace2 = `                let fsData = facilitySetting && facilitySetting.dataValues;
                let defaultPwd = (fsData && fsData.DefaultPwd) ? fsData.DefaultPwd : 'Default@123';`;

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);

// clean up all trailing whitespaces in the file
content = content.split('\n').map(line => line.replace(/\s+$/, '')).join('\n');

fs.writeFileSync('api/src/Server/Modules/SystemSettings/Router/Auth.ts', content);
