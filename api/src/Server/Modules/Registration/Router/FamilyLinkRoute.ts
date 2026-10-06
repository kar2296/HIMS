import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { FamilyLinkService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddFamilyLink', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyLinkService, req);
    service.AddFamilyLink(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateFamilyLink', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyLinkService, req);
    service.UpdateFamilyLink(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageFamilyLinks', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyLinkService, req);
    service.ManageFamilyLinks(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFamilyLinkById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyLinkService, req);
    service.GetFamilyLinkById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFamilyLinks', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyLinkService, req);
    service.GetFamilyLinks(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFamilyLinksForBillTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyLinkService, req);
    service.GetFamilyLinksForBillTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteFamilyLink', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(FamilyLinkService, req);
    service.DeleteFamilyLink(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
