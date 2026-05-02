import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { UserService } from '../../SystemSettings/Service/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
// import { UserProviderUpdateService, OtpVerifyService } from '../../SystemSettings/Service/Index';
// import { OtpVerifyService } from '../../SystemSettings/Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/GetUsers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetUsersNoAuth(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

// router.post('/GetUsersDropDown', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(UserService, req);
//     service.GetUsersNoAuthDropDown(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });


// router.post('/AddSelfUser',
//     (req: Request, res: Response, next: NextFunction): any => {
//         FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
//     },
//     (req: Request, res: Response, next: NextFunction): any => {
//         const service = ServiceFactory.CreateService(UserService, req);
//         service.AddSelfUserNoSession(req.body)
//             .then((response) => { res.send(response); })
//             .catch(next);
//     });


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


// router.post('/AddProviderOtpVerify',
//     (req: Request, res: Response, next: NextFunction): any => {
//         const service = ServiceFactory.CreateService(OtpVerifyService, req);
//         service.AddProviderOtpVerifyNoSession(req.body)
//             .then((response) => { res.send(response); })
//             .catch(next);
//     });

// router.post('/UpdateProviderOtpVerify',
//     (req: Request, res: Response, next: NextFunction): any => {
//         const service = ServiceFactory.CreateService(OtpVerifyService, req);
//         service.UpdateProviderOtpVerify(req.body)
//             .then((response) => { res.send(response); })
//             .catch(next);
//     });

// router.post('/GetUserProviderUpdates', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(UserProviderUpdateService, req);
//     service.GetUserProviderUpdates(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });



router.post('/forgot-swostha-id', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.getUserAndSendSwosthaId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/forgot-drhms-id', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.getUserAndSendSms(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/ChangePassword', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.ChangePasswordWithoutSession(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});


router.post('/GetUserProfilePic', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserService, req);
    service.GetUserProfilePic(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
