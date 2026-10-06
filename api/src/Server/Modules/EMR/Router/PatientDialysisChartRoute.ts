import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { PatientDialysisChartService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddPatientDialysisChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDialysisChartService, req);
    service.AddPatientDialysisChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdatePatientDialysisChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDialysisChartService, req);
    service.UpdatePatientDialysisChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDialysisChartById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDialysisChartService, req);
    service.GetPatientDialysisChartById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPatientDialysisCharts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDialysisChartService, req);
    service.GetPatientDialysisCharts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePatientDialysisChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDialysisChartService, req);
    service.DeletePatientDialysisChart(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintPatientDialysisChart', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDialysisChartService, req);
    service.PrintPatientDialysisChart(req.body)
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
router.post('/PrintPatientDialysisChartWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PatientDialysisChartService, req);
    service.PrintPatientDialysisChartWithoutHeader(req.body)
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
