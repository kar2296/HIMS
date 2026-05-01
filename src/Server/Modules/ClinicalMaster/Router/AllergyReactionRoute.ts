import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AllergyReactionService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAllergyReaction', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyReactionService, req);
    service.AddAllergyReaction(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAllergyReaction', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyReactionService, req);
    service.UpdateAllergyReaction(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAllergyReactionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyReactionService, req);
    service.GetAllergyReactionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAllergyReactions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyReactionService, req);
    service.GetAllergyReactions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAllergyReaction', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AllergyReactionService, req);
    service.DeleteAllergyReaction(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
