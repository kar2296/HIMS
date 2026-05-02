import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ResearchProjectMemberService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddResearchProjectMember', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectMemberService, req);
    service.AddResearchProjectMember(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateResearchProjectMember', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectMemberService, req);
    service.UpdateResearchProjectMember(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetResearchProjectMemberById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectMemberService, req);
    service.GetResearchProjectMemberById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetResearchProjectMembers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectMemberService, req);
    service.GetResearchProjectMembers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteResearchProjectMember', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ResearchProjectMemberService, req);
    service.DeleteResearchProjectMember(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
