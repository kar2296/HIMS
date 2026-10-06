import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { UserService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddUser',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(UserService, req);
        service.AddUser(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateUser',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(UserService, req);
        service.UpdateUser(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateSelfUser',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(UserService, req);
        service.UpdateSelfUser(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/ChangePassword', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.ChangePassword(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ChangeSecurityPin', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.ChangeSecurityPin(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserProfilePic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetUserProfilePic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserSignPic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetUserSignPic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/SendUserNameSms', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.SendUserNameSms(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetUserById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetViewDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetViewDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUsers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetUsers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserswithAppointments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetUserswithAppointments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinUsers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetMinUsers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetEmergencyUsers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetEmergencyUsers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUser', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.DeleteUser(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapDepartments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.MapDepartments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDepartments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetDepartments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.MapFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.MapCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategory', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetCategory(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapSpecialities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.MapSpecialities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSpecialities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetSpecialities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/setUserCurrentFacility', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.setUserCurrentFacility(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintUserMasterReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.PrintUserMasterReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintDoctorListReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.PrintDoctorListReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/AddUserDoctorMasterExcel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.AddUserDoctorMasterExcel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
