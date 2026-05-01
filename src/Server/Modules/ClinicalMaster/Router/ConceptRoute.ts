import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ConceptService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddConcept', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConceptService, req);
    service.AddConcept(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateConcept', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConceptService, req);
    service.UpdateConcept(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConceptById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConceptService, req);
    service.GetConceptById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConcepts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConceptService, req);
    service.GetConcepts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteConcept', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConceptService, req);
    service.DeleteConcept(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
