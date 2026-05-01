import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { VendorFacilityMapService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddVendorFacilityMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorFacilityMapService, req);
    service.AddVendorFacilityMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVendorFacilityMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorFacilityMapService, req);
    service.UpdateVendorFacilityMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorFacilityMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorFacilityMapService, req);
    service.GetVendorFacilityMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorFacilityMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorFacilityMapService, req);
    service.GetVendorFacilityMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityMasterVendor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorFacilityMapService, req);
    service.GetFacilityMasterVendor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVendorFacilityMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorFacilityMapService, req);
    service.DeleteVendorFacilityMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
