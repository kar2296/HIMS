import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { LISInterfaceService } from '../Service/Index';
let router: Router = express.Router();

router.post('/GetEquipmentList', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceService, req);
    service.GetEquipmentList(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddLISResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceService, req);
    service.AddLISResult(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddLISImage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceService, req);
    service.AddLISImage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetLISResults', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceService, req);
    service.GetLISResults(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetLISImages', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceService, req);
    service.GetLISImages(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetLISRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceService, req);
    service.GetLISRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/UpdateLISRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceService, req);
    service.UpdateLISRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/DeleteLISResults', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(LISInterfaceService, req);
    service.DeleteLISResults(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
