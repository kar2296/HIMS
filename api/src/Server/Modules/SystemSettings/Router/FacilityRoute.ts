import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { FacilityService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddFacility',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadFacilityLogo(req, res, next, { basePath: AppConfig.LogoUploadExternalFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(FacilityService, req);
        service.AddFacility(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateFacility',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    // (req: Request, res: Response, next: NextFunction): any => {
    //     FileUploader.UploadFacilityLogo(req, res, next, { basePath: AppConfig.LogoUploadExternalFilePath, storage: 'disk' });
    // },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(FacilityService, req);
        service.UpdateFacility(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetFacilityById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.GetFacilityById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinFacilityById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.GetMinFacilityById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilitys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.GetFacilitys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetOtherFacilitys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.GetOtherFacilitys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityLogo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.GetFacilityLogo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSecondFacilityLogo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.GetSecondFacilityLogo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFacility', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.DeleteFacility(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapDepartments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.MapDepartments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDepartments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FacilityService, req);
    service.GetDepartments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
