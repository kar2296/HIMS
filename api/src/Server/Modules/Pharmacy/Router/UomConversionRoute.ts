import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UomConversionService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddUomConversion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomConversionService, req);
    service.AddUomConversion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUomConversion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomConversionService, req);
    service.UpdateUomConversion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageUomConversions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomConversionService, req);
    service.ManageUomConversions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUomConversionById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomConversionService, req);
    service.GetUomConversionById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUomConversions', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomConversionService, req);
    service.GetUomConversions(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUomConversion', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UomConversionService, req);
    service.DeleteUomConversion(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
