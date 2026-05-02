import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientToothChartService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientToothChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientToothChartService, req);
    service.AddPatientToothChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientToothChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientToothChartService, req);
    service.UpdatePatientToothChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientToothChartById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientToothChartService, req);
    service.GetPatientToothChartById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientToothCharts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientToothChartService, req);
    service.GetPatientToothCharts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientToothChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientToothChartService, req);
    service.DeletePatientToothChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientToothChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientToothChartService, req);
    service.PrintPatientToothChart(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
export default router;
