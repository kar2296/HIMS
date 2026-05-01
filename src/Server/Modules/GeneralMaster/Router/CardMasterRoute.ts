import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CardMasterService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCardMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CardMasterService, req);
    service.AddCardMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCardMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CardMasterService, req);
    service.UpdateCardMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCardMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CardMasterService, req);
    service.GetCardMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCardMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CardMasterService, req);
    service.GetCardMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCardMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CardMasterService, req);
    service.DeleteCardMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
