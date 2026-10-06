import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientBPChartService } from '../Service/Index';
import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddPatientBPChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBPChartService, req);
    service.AddPatientBPChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientBPChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBPChartService, req);
    service.UpdatePatientBPChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBPChartById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBPChartService, req);
    service.GetPatientBPChartById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientBPCharts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBPChartService, req);
    service.GetPatientBPCharts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientBPChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBPChartService, req);
    service.DeletePatientBPChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientBPChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBPChartService, req);
    service.PrintPatientBPChart(req.body)
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
router.post('/PrintPatientBPChartWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientBPChartService, req);
    service.PrintPatientBPChartWithoutHeader(req.body)
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
