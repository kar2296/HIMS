import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { AnalytemasterService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddAnalytemaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.AddAnalytemaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAnalytemaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.UpdateAnalytemaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMaxId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.GetMaxId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalytemasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.GetAnalytemasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalytemasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.GetAnalytemasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAnalytemaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.DeleteAnalytemaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddAliasesmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.AddAliasesmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAliasesmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.UpdateAliasesmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAliasesmasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.GetAliasesmasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAliasesmasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.GetAliasesmasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAliasesmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.DeleteAliasesmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/AddAnalyteRefmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.AddAnalyteRefmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAnalyteRefmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.UpdateAnalyteRefmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyteRefmasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.GetAnalyteRefmasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAnalyterefmasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.GetAnalyterefmasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAnalyteRefmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AnalytemasterService, req);
    service.DeleteAnalyteRefmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddAnalyteMasterExcel',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(AnalytemasterService, req);
        service.AddAnalyteMasterExcel(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
});


export default router;
