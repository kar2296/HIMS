import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { GrnDetailService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddGrnDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.AddGrnDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGrnDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.UpdateGrnDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGrnDetailById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.GetGrnDetailById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGrnDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.GetGrnDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGrnDetail', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.DeleteGrnDetail(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PurchaseSaleGSTDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.PurchaseSaleGSTDetails(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConsolidatePurchaseGst', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.GetConsolidatePurchaseGst(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetConsolidateInputGstSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.GetConsolidateInputGstSummary(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintGRNReportByItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.PrintGRNReportByItem(req.body)
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
router.post('/PrintPurchaseSaleGSTReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.PrintPurchaseSaleGSTReport(req.body)
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
router.post('/PrintConsolidatePurchaseGSTReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.PrintConsolidatePurchaseGSTReport(req.body)
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
router.post('/PrintConsolidateInputGSTSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.PrintConsolidateInputGSTSummary(req.body)
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
router.post('/PrintDailyPurchaseSummary', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GrnDetailService, req);
    service.PrintDailyPurchaseSummary(req.body)
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
