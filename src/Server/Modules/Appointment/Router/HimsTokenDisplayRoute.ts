import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TokenDisplayService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTokenDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TokenDisplayService, req);
    service.AddTokenDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTokenDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TokenDisplayService, req);
    service.UpdateTokenDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTokenDisplayById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TokenDisplayService, req);
    service.GetTokenDisplayById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetListofTokens', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TokenDisplayService, req);
    service.GetListofTokens(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTokenDisplays', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TokenDisplayService, req);
    service.GetTokenDisplays(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTokenDisplay', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TokenDisplayService, req);
    service.DeleteTokenDisplay(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
