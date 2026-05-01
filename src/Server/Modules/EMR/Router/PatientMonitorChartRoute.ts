import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientMonitorChartService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientMonitorChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMonitorChartService, req);
    service.AddPatientMonitorChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientMonitorChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMonitorChartService, req);
    service.UpdatePatientMonitorChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientMonitorChartById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMonitorChartService, req);
    service.GetPatientMonitorChartById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientMonitorCharts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMonitorChartService, req);
    service.GetPatientMonitorCharts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientMonitorChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMonitorChartService, req);
    service.DeletePatientMonitorChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientMonitorChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMonitorChartService, req);
    service.PrintPatientMonitorChart(req.body)
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
router.post('/PrintPatientMonitorChartWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientMonitorChartService, req);
    service.PrintPatientMonitorChartWithoutHeader(req.body)
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
