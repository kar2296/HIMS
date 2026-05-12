import { BoFactory } from '../../Base/Business/Index';
import { Router, Request, Response, NextFunction, GetRouter, IncludeOptions, models } from '../../../Core/Index';
import { UserBo, LoginSessionBo, FacilitySettingBo, FacilityBo } from '../Business/Index';
import { Redis } from '../../../Core/Wrapper/Index';
import * as passport from 'passport';
import * as bearer from 'passport-http-bearer';
import * as local from 'passport-local';
import * as passportCustom from 'passport-custom';
import * as http from 'request';
import * as fs from 'fs';
const CustomStrategy = passportCustom.Strategy;

let router: Router = GetRouter();
const userBo = BoFactory.GetBo(UserBo);
const facilitySettingBo = BoFactory.GetBo(FacilitySettingBo);
const facilityBo = BoFactory.GetBo(FacilityBo);
let Models: Models = models;
// Secrets must be set in environment variables — never hardcode them here
const secret = process.env.JWT_SECRET;
const AUTO_LOG_SECRET = process.env.AUTO_LOG_SECRET;
const ACCEPT_AUTO_LOGIN_KEY = process.env.ACCEPT_AUTO_LOGIN_KEY;

if (!secret || !AUTO_LOG_SECRET || !ACCEPT_AUTO_LOGIN_KEY || !process.env.AES_PASSWORD_KEY) {
    throw new Error(
        'Missing required environment variables: JWT_SECRET, AUTO_LOG_SECRET, ' +
        'ACCEPT_AUTO_LOGIN_KEY, AES_PASSWORD_KEY. ' +
        'Copy .env.example to .env and fill in the values.'
    );
}

// Helper functions for safe property access
function getSessionContext(req: Request): any | null {
    return req.session?.passport?.user?.SessionContext || null;
}

function getUserSessionContext(req: Request): any | null {
    return req.user?.SessionContext || null;
}

function validateSession(req: Request, res: Response, next: NextFunction): void {
    if (!req.session?.passport?.user?.SessionContext) {
       res.status(401).send({ error: 'Invalid or expired session' });
return;
    }
    next();
}

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    console.log('LOGIN ROUTE ACCESSED');

    passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            if (info && info.message === 'ACCOUNT_LOCKED') {
                return res.status(403).send({ error: 'ACCOUNT_LOCKED' });
            }
            return res.status(401).send({ error: 'INVALID_CREDENTIALS' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            let loginSessionBo = BoFactory.GetBo(LoginSessionBo, req);
            // Add proper null checks
            if (!req.session || !req.session.passport || !req.session.passport.user) {
                return res.status(401).send({ error: 'Invalid session' });
            }
            let sessionCtxt: any = req.session.passport.user.SessionContext;
            let forceLogin: any = (req as any).body.ForceLogin;
            let userexist: any = (req as any).body.CHKUserExist;
            if (!sessionCtxt) {
                return res.status(401).send({ error: 'Invalid session context' });
            }
            if (!userexist) {
                if (forceLogin) {
                    console.log('Force login...');
                    let logindetails: any = {};
                    logindetails = {
                        Id: 0,
                        Data: {
                            UserId: sessionCtxt.UserId
                        }
                    };
                    loginSessionBo.updateLoginSession(logindetails);
                }
                let logindata = {
                    Id: 0,
                    Data: {
                        UserId: sessionCtxt.UserId,
                        UserName: sessionCtxt.UserName,
                        LoginTime: new Date(),
                        SessionId: (req as any).sessionID
                    }
                };
                loginSessionBo.AddLoginSession(logindata);
            }

            return res.status(200).send({ Data: sessionCtxt });
        });
    })(req, res, next);
});
router.post('/checkExistingLoginSession',
    (req: Request, res: Response, next: NextFunction) => {
        let loginSessionBo = BoFactory.GetBo(LoginSessionBo, req);
        loginSessionBo.checkExistingLoginSession(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    }
);
router.post('/logout', (req: Request, res: Response, next: NextFunction): void => {
    // Add proper null checks
    const userContext = getUserSessionContext(req);
    if (userContext && userContext.UserId) {
        let loginSessionBo = BoFactory.GetBo(LoginSessionBo, req);
        let logindetails: any = {};
        logindetails = {
            Id: 0,
            Data: {
                UserId: userContext.UserId
            }
        };
        loginSessionBo.updateLoginSession(logindetails);
    }
    req.logout();
    if (req.session) {
        req.session.destroy(function (err) {
            res.status(200).send({ result: 'success....' });
        });
    } else {
        res.status(200).send({ result: 'success....' });
    }
});
passport.serializeUser((user: any, done: Function) => {
    done(null, user);
});
passport.deserializeUser((id: number, done: Function) => {
    done(null, id);
});
passport.use(new CustomStrategy((req: any, done: Function) => {
    const { enc } = req.body;
    const CryptoJS = require('crypto-js');
    const bytes = CryptoJS.AES.decrypt(enc, ACCEPT_AUTO_LOGIN_KEY); //AppConfig.AcceptLoginKey
    const original = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (original && original.Secret && original.Secret === AUTO_LOG_SECRET) {

        let include: Array<IncludeOptions> = [];
        include.push({
            model: Models.Department,
            as: 'Department',
            attributes: ['DepartmentCode', 'DepartmentName'],
            required: false
        });
        include.push({
            model: Models.ReferenceValue, attributes: ['Description'],
            as: 'Title', where: { 'GroupCode': 'Title' }, required: false
        });

        include.push({
            model: Models.Department,
            as: 'Departments',
            attributes: ['DepartmentCode', 'DepartmentName'],
            required: false
        });

        include.push({
            model: Models.Facility, attributes: ['FacilityName',
                'OrganizationId', 'LogoPath',
                'Mobile', 'IsDeptWiseLabPrint',
            'LicenseExpiryDate'], required: false
        });

        include.push({
            model: Models.Group, required: false,
            include: [
                {
                    model: Models.Role, required: false, attributes: ['RoleCode', 'LandingControlId'],
                    include: [
                        { model: Models.Control, required: false, as: 'LandingControl' },
                        { model: Models.RolePrivilege, required: false }
                    ]
                }
            ]
        });

        /* include.push({
            model: Models.ReferenceValue, attributes: ['Description'],
            as: 'UserType', where: { 'GroupCode': 'UserType' }, required: false
        }); */

        userBo.Find({ where: { UserName: original.UserName }, include: include })
            .then((user: any) => {
                let value = user.dataValues;
                let name = value.FirstName;
                let departmentName = '';
                if (value.MiddleName) {
                    name += ' ' + value.MiddleName;
                }
                if (value.LastName) {
                    name += ' ' + value.LastName;
                }
                if (user.Title && user.Title.Description) {
                    name = user.Title.Description + ' ' + name;
                }
                if (user.Department && user.Department.DepartmentName) {
                    departmentName = user.Department.DepartmentName;
                }

                let medblazePost = 0;
                if (process.env.MEDBLAZE_URL && process.env.MEDBLAZE_URL.length > 3) {
                    medblazePost = 1;
                }
                return done(null, {
                    SessionContext: {
                        UserId: value.Id,
                        UserName: value.UserName,
                        OrganizationId: value.Facility?.OrganizationId,
                        FacilityId: value.FacilityId,
                        // UserTypeId: value.UserTypeId,
                        PatientId: value.PatientId,
                        UserGroupId: value.UserGroupId,
                        // ClinicalRoleId: value.ClinicalRoleId,
                        IsMedBlazePost: medblazePost,
                        IsPharmacyDueAllowed: value.IsPharmacyDueAllowed,
                        DepartmentId: value.DepartmentId,
                        UserFullName: name,
                        DepartmentName: departmentName,
                        UserDepartments: user.Departments,
                        Facility: user.Facility,
                        Group: user.Group,
                        FacilityName: value.Facility ? value.Facility.FacilityName : '',
                        FacilityContact: value.Facility ? value.Facility.Mobile : '',
                        IsDeptWiseLabPrint: value.Facility ? value.Facility.IsDeptWiseLabPrint : '',
                        LogoPath: value.Facility ? value.Facility.LogoPath : '',
                        ItemCategoryId: value.ItemCategoryId,
                        ItemSubCategoryId: value.ItemSubCategoryId,
                        LoginTime: new Date(),
                        UserType: value.UserType ? value.UserType : '',
                        LoginPermission: value.LoginPermission,
                        IsActive: value.IsActive,
                        ActiveStatusId: value.ActiveStatusId,
                        EmployeeId: value.EmployeeId,
                        SubDepartmentId: value.SubDepartmentId,
                        TicketTypeId: value.TicketTypeId,
                        LicenseInfo: {
                            ExpiresOn: process.env.LICENSE_END_DATE
                        }
                    }
                });
            }).catch(err => console.log(err));
    } else {
        return done(null, false);
    }

}));
passport.use(new local.Strategy({ usernameField: 'UserName', passwordField: 'Password' },
    (userName: string, password: string, done: Function) => {
        //console.log('inside passport.use');
        //console.log(this.Response);

        let include: Array<IncludeOptions> = [];
        include.push({
            model: Models.Department,
            as: 'Department',
            attributes: ['DepartmentCode', 'DepartmentName'],
            required: false
        });
        include.push({
            model: Models.ReferenceValue, attributes: ['Description'],
            as: 'Title', where: { 'GroupCode': 'Title' }, required: false
        });

        include.push({
            model: Models.Department,
            as: 'Departments',
            attributes: ['DepartmentCode', 'DepartmentName'],
            required: false
        });

        include.push({ model: Models.Facility, attributes: ['FacilityName', 'Mobile', 'IsDeptWiseLabPrint',
            'LicenseExpiryDate'
        ], required: false });

        include.push({
            model: Models.Group, required: false,
            include: [
                {
                    model: Models.Role, required: false, attributes: ['RoleCode', 'LandingControlId'],
                    include: [
                        { model: Models.Control, required: false, as: 'LandingControl' },
                        { model: Models.RolePrivilege, required: false }
                    ]
                }
            ]
        });

        include.push({
            model: Models.ReferenceValue, attributes: ['Description'],
            as: 'UserType', where: { 'GroupCode': 'UserType' }, required: false
        });

        userBo.Find({ where: { UserName: userName }, include: include })
            .then((user: any) => {

                const CryptoJS = require('crypto-js');

                const cipherParams = CryptoJS.lib.CipherParams.create({
                    ciphertext: CryptoJS.enc.Base64.parse(password)
                });

                const strIV = CryptoJS.enc.Base64.parse(process.env.AES_PASSWORD_KEY!);
                const base64Key = CryptoJS.enc.Base64.parse(process.env.AES_PASSWORD_KEY!);

                const decrypted = CryptoJS.AES.decrypt(
                    cipherParams,
                    base64Key,
                    { iv: strIV });
                const pwd = decrypted.toString(CryptoJS.enc.Utf8);

                //console.log('encrypted pwd=' + password);
                //console.log('decrypted pwd=' + pwd);

                if (!user || !user.dataValues || user.dataValues.Password !== pwd) {
                    if (user && user.dataValues) {
                        let attempts = (user.dataValues.FailedLoginAttempts || 0) + 1;
                        let isLocked = user.dataValues.IsLocked;

                        facilityBo.Find({ where: { Id: user.dataValues.FacilityId || 1 } }).then((facility: any) => {
                            let fData = facility && facility.dataValues;
                            let maxAttempts = (fData && fData.MaxFailedLoginAttempts) ? fData.MaxFailedLoginAttempts : 10;
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
                        return;
                    }
                    return done(null, false, { message: 'INVALID_CREDENTIALS' });
                }

                let value = user.dataValues;
                if (value.IsLocked) {
                    return done(null, false, { message: 'ACCOUNT_LOCKED' });
                }
                if (value.FailedLoginAttempts > 0) {
                    let updateData: any = { Id: value.Id, FailedLoginAttempts: 0 };
                    userBo.UpdatewithoutSession(updateData).catch((err: any) => console.error('Failed to reset FailedLoginAttempts', err));
                }
                let name = value.FirstName;
                let departmentName = '';
                if (value.MiddleName) {
                    name += ' ' + value.MiddleName;
                }
                if (value.LastName) {
                    name += ' ' + value.LastName;
                }
                if (user.Title && user.Title.Description) {
                    name = user.Title.Description + ' ' + name;
                }
                if (user.Department && user.Department.DepartmentName) {
                    departmentName = user.Department.DepartmentName;
                }

                let medblazePost = 0;
                if (process.env.MEDBLAZE_URL && process.env.MEDBLAZE_URL.length > 3) {
                    medblazePost = 1;
                }
                return done(null, {
                    SessionContext: {
                        UserId: value.Id,
                        UserName: value.UserName,
                        OrganizationId: value.OrgId,
                        FacilityId: value.FacilityId,
                        UserTypeId: value.UserTypeId,
                        PatientId: value.PatientId,
                        UserGroupId: value.UserGroupId,
                        ClinicalRoleId: value.ClinicalRoleId,
                        IsPharmacyDueAllowed: value.IsPharmacyDueAllowed,
                        IsDueCheck: value.IsDueCheck,
                        DepartmentId: value.DepartmentId,
                        UserFullName: name,
                        DepartmentName: departmentName,
                        UserDepartments: user.Departments,
                        Facility: user.Facility,
                        Group: user.Group,
                        FacilityName: value.Facility ? value.Facility.FacilityName : '',
                        FacilityContact: value.Facility ? value.Facility.Mobile : '',
                        IsDeptWiseLabPrint: value.Facility ? value.Facility.IsDeptWiseLabPrint : '',
                        IsMedBlazePost: medblazePost,
                        ItemCategoryId: value.ItemCategoryId,
                        ItemSubCategoryId: value.ItemSubCategoryId,
                        LoginTime: new Date(),
                        UserType: value.UserType ? value.UserType : '',
                        LoginPermission: value.LoginPermission,
                        IsActive: value.IsActive,
                        ActiveStatusId: value.ActiveStatusId,
                        EmployeeId: value.EmployeeId,
                        SubDepartmentId: value.SubDepartmentId,
                        RequiresPasswordChange: value.RequiresPasswordChange,
                        LicenseInfo: {
                            ExpiresOn: process.env.LICENSE_END_DATE
                        }
                    }
                });
            }).catch(err => console.log(err));
    }));

passport.use(new bearer.Strategy(
    { scope: 'bearer', realm: '', passReqToCallback: false },
    (bearerToken: string, done: Function) => {
        try {
            const CryptoJS = require('crypto-js');
            const redis = Redis.Instance;

            const decryptBytes = CryptoJS.AES.decrypt(bearerToken, secret);
            const token = JSON.parse(decryptBytes.toString(CryptoJS.enc.Utf8));
            const key = 'api:' + (bearerToken ? bearerToken : '');
            redis.Get(key)
                .then((sess) => {
                    if (sess) {
                        done(null, sess);
                        redis.Expire(key, Number(process.env.SESSION_MAX_AGE));
                    } else {
                        authHandler(token.userName, token.password, done);
                    }
                });
        } catch (err) {
            console.log(err);
            done(err, { id: 0 }, { message: 'Invalid token' });
        }
    }));


function authHandler(userName: String, password: String, done: Function): void {
    let include: Array<IncludeOptions> = [];
    include.push({
        model: Models.Department,
        as: 'Department',
        attributes: ['DepartmentCode', 'DepartmentName'],
        required: false
    });
    include.push({
        model: Models.ReferenceValue, attributes: ['Description'],
        as: 'Title', where: { 'GroupCode': 'Title' }, required: false
    });

    include.push({
        model: Models.Department,
        as: 'Departments',
        attributes: ['DepartmentCode', 'DepartmentName'],
        required: false
    });

    include.push({ model: Models.Facility, attributes: ['FacilityName', 'Mobile', 'IsDeptWiseLabPrint',
         'LicenseExpiryDate'
    ], required: false });

    include.push({
        model: Models.Group, required: false,
        include: [
            {
                model: Models.Role, required: false, attributes: ['RoleCode', 'LandingControlId'],
                include: [
                    { model: Models.Control, required: false, as: 'LandingControl' },
                    { model: Models.RolePrivilege, required: false }
                ]
            }
        ]
    });

    include.push({
        model: Models.ReferenceValue, attributes: ['Description'],
        as: 'UserType', where: { 'GroupCode': 'UserType' }, required: false
    });

    userBo.Find({ where: { UserName: userName }, include: include })
        .then((user: any) => {

            if (!user || !user.dataValues || user.dataValues.Password !== password) {
                return done(null, false);
            }
            let value = user.dataValues;
            let name = value.FirstName;
            let departmentName = '';
            if (value.MiddleName) {
                name += ' ' + value.MiddleName;
            }
            if (value.LastName) {
                name += ' ' + value.LastName;
            }
            if (user.Title && user.Title.Description) {
                name = user.Title.Description + ' ' + name;
            }
            if (user.Department && user.Department.DepartmentName) {
                departmentName = user.Department.DepartmentName;
            }

            let medblazePost = 0;
            if (process.env.MEDBLAZE_URL && process.env.MEDBLAZE_URL.length > 3) {
                medblazePost = 1;
            }
            return done(null, {
                SessionContext: {
                    UserId: value.Id,
                    UserName: value.UserName,
                    OrganizationId: value.OrgId,
                    FacilityId: value.FacilityId,
                    UserTypeId: value.UserTypeId,
                    PatientId: value.PatientId,
                    UserGroupId: value.UserGroupId,
                    ClinicalRoleId: value.ClinicalRoleId,
                    IsPharmacyDueAllowed: value.IsPharmacyDueAllowed,
                    IsDueCheck: value.IsDueCheck,
                    DepartmentId: value.DepartmentId,
                    UserFullName: name,
                    DepartmentName: departmentName,
                    UserDepartments: user.Departments,
                    Group: user.Group,
                    Facility: user.Facility,
                    FacilityName: value.Facility ? value.Facility.FacilityName : '',
                    FacilityContact: value.Facility ? value.Facility.Mobile : '',
                    IsDeptWiseLabPrint: value.Facility ? value.Facility.IsDeptWiseLabPrint : '',
                    IsMedBlazePost: medblazePost,
                    ItemCategoryId: value.ItemCategoryId,
                    ItemSubCategoryId: value.ItemSubCategoryId,
                    LoginTime: new Date(),
                    UserType: value.UserType ? value.UserType : '',
                    LoginPermission: value.LoginPermission,
                    IsActive: value.IsActive,
                    ActiveStatusId: value.ActiveStatusId,
                    EmployeeId: value.EmployeeId,
                    SubDepartmentId: value.SubDepartmentId,
                    LicenseInfo: {
                        ExpiresOn: process.env.LICENSE_END_DATE
                    }
                }
            });
        }).catch(err => console.log(err));
}

router.post('/getActiveUsers', (req: Request, res: Response, next: NextFunction): void => {
    getActiveUsers().then((ses) => {
        res.status(200).send({ result: ses });
    });
});

async function getActiveUsers(): Promise<any[]> {
    const redis = Redis.Instance;
    const keys: string[] = await redis.Keys('sess:*');
    const activeSessions: any[] = [];
    await Promise.all(keys.map((key): Promise<void> => {
        return (async (k): Promise<void> => {
            const ses: any = await redis.Get(k);
            if (ses) {
                ses.ttl = await redis.TTL(k);
                activeSessions.push(ses);
            }
        })(key);
    }));
    return activeSessions;
}

router.post('/getClientToken', (req: Request, res: Response, next: NextFunction): void => {
    const reqData = req.body;
    userBo.Find({ where: { UserName: reqData.userName }, attributes: ['Id', 'Password'] })
        .then((user: any) => {
            if (!user || !user.dataValues || user.dataValues.Password !== reqData.password) {
                res.status(200).send({ error: 'Invalid credentials' });
            } else {
                const CryptoJS = require('crypto-js');

                let validTill = new Date();
                validTill.setMinutes(validTill.getMinutes() + 20);
                reqData.nonce = validTill.toUTCString();

                const tokenInfo = CryptoJS.AES.encrypt(JSON.stringify(reqData), secret);
                res.status(200).send({ token: tokenInfo.toString() });
            }
        }).catch((err) => {
            console.log(err);
        });
});
router.post('/login-with-secret',
    passport.authenticate('custom'),
    (req: Request, res: Response, next: NextFunction) => {
        let loginSessionBo = BoFactory.GetBo(LoginSessionBo, req);
        // Add proper null checks
        if (!req.session || !req.session.passport || !req.session.passport.user) {
            return res.status(401).send({ error: 'Invalid session' });
        }
        let sessionCtxt: any = req.session.passport.user.SessionContext;
        let forceLogin: any = true;
        let userexist: any = (req as any).body.CHKUserExist;
        if (!sessionCtxt) {
            return res.status(401).send({ error: 'Invalid session context' });
        }
        if (!userexist) {
            if (forceLogin) {
                console.log('Force login...');
                let logindetails: any = {};
                logindetails = {
                    Id: 0,
                    Data: {
                        UserId: sessionCtxt.UserId
                    }
                };
                loginSessionBo.updateLoginSession(logindetails);
            }
            let logindata = {
                Id: 0,
                Data: {
                    UserId: sessionCtxt.UserId,
                    UserName: sessionCtxt.UserName,
                    LoginTime: new Date(),
                    SessionId: (req as any).sessionID
                }
            };
            loginSessionBo.AddLoginSession(logindata);
        }

        return res.status(200).send({ Data: sessionCtxt });
    }
);

router.post('/getTokenForAutoLogin', (req: Request, res: Response, next: NextFunction): void => {
    const reqData = req.body;
    userBo.Find({ where: { UserName: reqData.userName }, attributes: ['Id', 'Password'] })
        .then((user: any) => {
            if (!user || !user.dataValues || AUTO_LOG_SECRET !== reqData.secret) {
                res.status(200).send({ error: 'Invalid credentials' });
            } else {
                const CryptoJS = require('crypto-js');
                let validTill = new Date();
                validTill.setMinutes(validTill.getMinutes() + 20);
                reqData.nonce = validTill.toUTCString();
                const tokenData: any = { ...reqData };
                delete tokenData['secret'];
                tokenData.password = user.dataValues.Password;
                const tokenInfo = CryptoJS.AES.encrypt(JSON.stringify(tokenData), secret);
                res.status(200).send({ token: tokenInfo.toString() });
            }
        }).catch((err) => {
            console.log(err);
        });
});
router.post('/encryptJSON', (req: Request, res: Response, next: NextFunction): void => {
    const reqData = req.body;
    const CryptoJS = require('crypto-js');
    const publicKey = fs.readFileSync('../api/src/cert/sand_public_key1.pem', { encoding: 'utf8' });
    const tokenData: any = { ...reqData };
    const tokenInfo = CryptoJS.AES.encrypt(JSON.stringify(tokenData), publicKey);

    //inputData.ApiKey = secret;
    let finalurl = 'https://testapi.mygstcafe.com/eicore/v1.03/Invoice/api/auth';
    let httpOptions = {
        timeout: 60000,
        headers: {
            //'x-api-key': 'Api-Key ' + fac.SwosthaKey,
            'Content-Type': 'application/json',
            'client_id': process.env.EINVOICE_CLIENT_ID,
            'client_secret': process.env.EINVOICE_CLIENT_SECRET,
            //'Gstin': '27AAFCP0535R012'
        },
        strictSSL: false,
        //body: { Data: inputData },
        body: { Data: tokenInfo.toString() },
        json: true
    };
    console.log(httpOptions);
    http.post(finalurl, httpOptions,
        (error: any, response: http.RequestResponse, body: any) => {
            if (error) {
                console.log(error);
                //reject(error);
            }
            console.log(response);
            res.status(200).send({ token: response });
            //resolve({ response });
        });
});

//res.status(200).send({ token: tokenInfo.toString() });

router.post('/reset-locked-password', (req: Request, res: Response, next: NextFunction): void => {
    const reqData = req.body;
    if (!reqData || !reqData.userName) {
        res.status(400).send({ error: 'Username is required' });
        return;
    }
    userBo.Find({ where: { UserName: reqData.userName } })
        .then((user: any) => {
            if (!user || !user.dataValues || !user.dataValues.IsLocked) {
                res.status(400).send({ error: 'Account is not locked or does not exist.' });
                return;
            }

            facilityBo.Find({ where: { Id: user.dataValues.FacilityId || 1 } }).then((facility: any) => {
                let fData = facility && facility.dataValues;
                let defaultPwd = (fData && fData.DefaultPwd) ? fData.DefaultPwd : 'Default@123';

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
            }).catch(next);
        }).catch(next);
});

router.post('/force-change-password', (req: Request, res: Response, next: NextFunction): void => {
    const reqData = req.body;
    let userId = reqData.UserId;
    if (!userId) {
        let userContext = getUserSessionContext(req);
        if (userContext) {
            userId = userContext.UserId;
        }
    }

    if (!userId || !reqData.newPassword) {
        res.status(400).send({ error: 'Missing required parameters.' });
        return;
    }

    const CryptoJS = require('crypto-js');
    const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(reqData.newPassword)
    });
    const strIV = CryptoJS.enc.Base64.parse(process.env.AES_PASSWORD_KEY!);
    const base64Key = CryptoJS.enc.Base64.parse(process.env.AES_PASSWORD_KEY!);
    const decrypted = CryptoJS.AES.decrypt(cipherParams, base64Key, { iv: strIV });
    const pwd = decrypted.toString(CryptoJS.enc.Utf8);

    const updateData: any = {
        Id: userId,
        Password: pwd,
        RequiresPasswordChange: false
    };

    userBo.UpdatewithoutSession(updateData).then(() => {
        // Also update SessionContext if we are logged in so they don't get forced again
        if (req.session && req.session.passport && req.session.passport.user && req.session.passport.user.SessionContext) {
            req.session.passport.user.SessionContext.RequiresPasswordChange = false;
        }
        res.status(200).send({ message: 'Password updated successfully' });
    }).catch(next);
});

export default router;
