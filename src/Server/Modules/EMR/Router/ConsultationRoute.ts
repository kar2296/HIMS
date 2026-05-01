import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { ConsultationService} from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddConsultation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.AddConsultation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateConsultation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.UpdateConsultation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateProgressNoteStatus', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.UpdateProgressNoteStatus(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConsultationById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.GetConsultationById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConsultations', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.GetConsultations(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteConsultation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.DeleteConsultation(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintConsultation', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.PrintConsultation(req.body)
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
router.post('/PrintIPCaseSheetSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.PrintIPCaseSheetSummary(req.body)
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
router.post('/PrintConsultationWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.PrintConsultationWithoutHeader(req.body)
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
router.post('/PrintDischargeLabResult', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.PrintDischargeLabResult(req.body)
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
router.post('/PrintDischargeCasesheet', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.PrintDischargeCasesheet(req.body)
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
router.post('/PrintDischargeCasesheetWithoutHeader', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.PrintDischargeCasesheetWithoutHeader(req.body)
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

router.post('/PrintIPCasesheet', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.PrintIPCasesheet(req.body)
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
router.post('/PrintIndIPCasesheet', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ConsultationService, req);
    service.PrintIndIPCasesheet(req.body)
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
export default router;
