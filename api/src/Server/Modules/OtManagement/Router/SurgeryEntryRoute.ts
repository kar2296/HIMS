import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { SurgeryEntryService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddSurgeryEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.AddSurgeryEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateOTSurgeryEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.UpdateOTSurgeryEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSurgeryEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.UpdateSurgeryEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateSurgeryEntryReview', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.UpdateSurgeryEntryReview(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSurgeryEntryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.GetSurgeryEntryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSurgeryEntrys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.GetSurgeryEntrys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSurgerysummarybyProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.GetSurgerysummarybyProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSurgerysummarybySurgeon', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.GetSurgerysummarybySurgeon(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSurgerysummarybyAnaesthetist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.GetSurgerysummarybyAnaesthetist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintSurgeryEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.PrintSurgeryEntry(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintSurgeryEntryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.PrintSurgeryEntryReport(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintSurgerysummarybyProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.PrintSurgerysummarybyProcedure(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintSurgerysummarybySurgeon', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.PrintSurgerysummarybySurgeon(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintSurgerysummarybyAnaesthesist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.PrintSurgerysummarybyAnaesthesist(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/DeleteSurgeryEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(SurgeryEntryService, req);
    service.DeleteSurgeryEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
