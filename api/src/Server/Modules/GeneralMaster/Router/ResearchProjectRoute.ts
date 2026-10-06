import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ResearchProjectService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddResearchProject', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectService, req);
    service.AddResearchProject(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateResearchProject', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectService, req);
    service.UpdateResearchProject(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetResearchProjectById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectService, req);
    service.GetResearchProjectById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetResearchProjects', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectService, req);
    service.GetResearchProjects(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteResearchProject', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectService, req);
    service.DeleteResearchProject(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
