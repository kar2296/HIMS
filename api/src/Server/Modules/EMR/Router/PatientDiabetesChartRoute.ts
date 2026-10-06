import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDiabetesChartService } from '../Service/Index';
import { unlinkSync } from 'fs';
let router: Router = express.Router();

router.post('/AddPatientDiabetesChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiabetesChartService, req);
    service.AddPatientDiabetesChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDiabetesChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiabetesChartService, req);
    service.UpdatePatientDiabetesChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDiabetesChartById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiabetesChartService, req);
    service.GetPatientDiabetesChartById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDiabetesCharts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiabetesChartService, req);
    service.GetPatientDiabetesCharts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDiabetesChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiabetesChartService, req);
    service.DeletePatientDiabetesChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientDiabetesChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiabetesChartService, req);
    service.PrintPatientDiabetesChart(req.body)
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
router.post('/PrintPatientDiabetesChartWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDiabetesChartService, req);
    service.PrintPatientDiabetesChartWithoutHeader(req.body)
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
