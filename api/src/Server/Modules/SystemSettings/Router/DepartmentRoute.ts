import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { DepartmentService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddDepartment',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(DepartmentService, req);
        service.AddDepartment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateDepartment',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(DepartmentService, req);
        service.UpdateDepartment(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetDepartmentLogo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentService, req);
    service.GetDepartmentLogo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetDepartmentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentService, req);
    service.GetDepartmentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDepartments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentService, req);
    service.GetDepartments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintDepartmentListReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentService, req);
    service.PrintDepartmentListReport(req.body)
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
router.post('/DeleteDepartment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DepartmentService, req);
    service.DeleteDepartment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
