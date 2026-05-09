const fs = require('fs');
let content = fs.readFileSync('api/src/Server/Modules/SystemSettings/Router/Auth.ts', 'utf8');

const target1 = `                        let attempts = (user.dataValues.FailedLoginAttempts || 0) + 1;
                        let isLocked = user.dataValues.IsLocked;
                        if (attempts >= 10) {
                            isLocked = true;
                        }

                        let updateData: any = { Id: user.dataValues.Id, FailedLoginAttempts: attempts, IsLocked: isLocked };
                        userBo.UpdatewithoutSession(updateData).then(() => {
                            if (isLocked) {
                                return done(null, false, { message: 'ACCOUNT_LOCKED' });
                            }
                            return done(null, false, { message: 'INVALID_CREDENTIALS' });
                        });
                        return;`;

const replacement1 = `                        let attempts = (user.dataValues.FailedLoginAttempts || 0) + 1;
                        let isLocked = user.dataValues.IsLocked;

                        facilitySettingBo.Find({ where: { FacilityId: user.dataValues.FacilityId || 1 } }).then((facilitySetting: any) => {
                            let maxAttempts = (facilitySetting && facilitySetting.dataValues && facilitySetting.dataValues.MaxFailedLoginAttempts) ? facilitySetting.dataValues.MaxFailedLoginAttempts : 10;
                            if (attempts >= maxAttempts) {
                                isLocked = true;
                            }

                            let updateData: any = { Id: user.dataValues.Id, FailedLoginAttempts: attempts, IsLocked: isLocked };
                            userBo.UpdatewithoutSession(updateData).then(() => {
                                if (isLocked) {
                                    return done(null, false, { message: 'ACCOUNT_LOCKED' });
                                }
                                return done(null, false, { message: 'INVALID_CREDENTIALS' });
                            });
                        }).catch((err: any) => {
                            console.error(err);
                            return done(null, false, { message: 'INVALID_CREDENTIALS' });
                        });
                        return;`;

const target2 = `            const updateData: any = {
                Id: user.dataValues.Id,
                Password: 'Default@123',
                IsLocked: false,
                FailedLoginAttempts: 0,
                RequiresPasswordChange: true
            };

            userBo.UpdatewithoutSession(updateData).then(() => {
                res.status(200).send({ message: 'Password reset successfully', tempPassword: 'Default@123' });
            }).catch(next);`;

const replacement2 = `            facilitySettingBo.Find({ where: { FacilityId: user.dataValues.FacilityId || 1 } }).then((facilitySetting: any) => {
                let defaultPwd = (facilitySetting && facilitySetting.dataValues && facilitySetting.dataValues.DefaultPwd) ? facilitySetting.dataValues.DefaultPwd : 'Default@123';
                
                const updateData: any = {
                    Id: user.dataValues.Id,
                    Password: defaultPwd,
                    IsLocked: false,
                    FailedLoginAttempts: 0,
                    RequiresPasswordChange: true
                };

                userBo.UpdatewithoutSession(updateData).then(() => {
                    res.status(200).send({ message: 'Password reset successfully', tempPassword: defaultPwd });
                }).catch(next);
            }).catch(next);`;

content = content.replace(target1.replace(/\n/g, '\r\n'), replacement1.replace(/\n/g, '\r\n'));
content = content.replace(target2.replace(/\n/g, '\r\n'), replacement2.replace(/\n/g, '\r\n'));

fs.writeFileSync('api/src/Server/Modules/SystemSettings/Router/Auth.ts', content);
