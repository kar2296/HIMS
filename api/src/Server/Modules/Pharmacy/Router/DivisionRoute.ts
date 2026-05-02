import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { DivisionService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddDivision', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DivisionService, req);
    service.AddDivision(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateDivision', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DivisionService, req);
    service.UpdateDivision(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDivisionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DivisionService, req);
    service.GetDivisionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDivisions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DivisionService, req);
    service.GetDivisions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteDivision', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(DivisionService, req);
    service.DeleteDivision(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
