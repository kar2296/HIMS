import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CarePathSectionService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCarePathSection', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathSectionService, req);
    service.AddCarePathSection(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCarePathSection', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathSectionService, req);
    service.UpdateCarePathSection(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathSectionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathSectionService, req);
    service.GetCarePathSectionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCarePathSections', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathSectionService, req);
    service.GetCarePathSections(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCarePathSection', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CarePathSectionService, req);
    service.DeleteCarePathSection(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
