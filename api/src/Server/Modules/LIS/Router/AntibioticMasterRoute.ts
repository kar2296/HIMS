import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { AntibioticMasterService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddAntibioticMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.AddAntibioticMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAntibioticMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.UpdateAntibioticMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAntibioticMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.GetAntibioticMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAntibioticMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.GetAntibioticMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAntibioticMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.DeleteAntibioticMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

//antibioticorganismmapbo
router.post('/AddAntibioticOrganismMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.AddAntibioticOrganismMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateAntibioticOrganismMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.UpdateAntibioticOrganismMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAntibioticOrganismMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.GetAntibioticOrganismMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAntibioticOrganismMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.GetAntibioticOrganismMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAntibioticOrganismMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.GetAntibioticOrganismMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteAntibioticOrganismMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(AntibioticMasterService, req);
    service.DeleteAntibioticOrganismMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
export default router;
