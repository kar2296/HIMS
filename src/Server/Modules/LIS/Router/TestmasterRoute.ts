import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { TestmasterService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddTestmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.AddTestmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTestmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.UpdateTestmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMaxId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetMaxId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTestmaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.DeleteTestmaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
//MapFacilities
router.post('/MapFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.MapFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
//TestAnalyteMap
router.post('/AddTestmasteranalytemap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.AddTestmasteranalytemap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTestmasteranalytemap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.UpdateTestmasteranalytemap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasteranalytemapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasteranalytemapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasteranalytemaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasteranalytemaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTestmasteranalytemap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.DeleteTestmasteranalytemap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
//Testdiagnosis
router.post('/AddTestdiagnosismapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.AddTestdiagnosismapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTestdiagnosismapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.UpdateTestdiagnosismapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestdiagnosismappingById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestdiagnosismappingById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestdiagnosismappings', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestdiagnosismappings(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTestdiagnosismapping', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.DeleteTestdiagnosismapping(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
//TestmasterInst
router.post('/AddTestmasterInst', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.AddTestmasterInst(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTestmasterInst', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.UpdateTestmasterInst(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasterInstById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasterInstById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasterInsts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasterInsts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTestmasterInst', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.DeleteTestmasterInst(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
//TestmasterTemplate
router.post('/AddTestmasterTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.AddTestmasterTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTestmasterTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.UpdateTestmasterTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasterTemplateById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasterTemplateById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasterTemplates', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasterTemplates(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTestmasterTemplate', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.DeleteTestmasterTemplate(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
//TestmasterBOM
router.post('/AddTestmasterBOM', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.AddTestmasterBOM(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTestmasterBOM', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.UpdateTestmasterBOM(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasterBOMById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasterBOMById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTestmasterBOMs', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetTestmasterBOMs(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTestmasterBOM', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.DeleteTestmasterBOM(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceMappedTestItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TestmasterService, req);
    service.GetServiceMappedTestItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddTestMasterExcel',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(TestmasterService, req);
        service.AddTestMasterExcel(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
});

export default router;
