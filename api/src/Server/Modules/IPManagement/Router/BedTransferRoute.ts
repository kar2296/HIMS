import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { BedTransferService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddBedTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransferService, req);
    service.AddBedTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBedTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransferService, req);
    service.UpdateBedTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedTransferById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransferService, req);
    service.GetBedTransferById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedTransfers', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransferService, req);
    service.GetBedTransfers(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetBedTransferByEncounterId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransferService, req);
    service.GetBedTransferByEncounterId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/DeleteBedTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransferService, req);
    service.DeleteBedTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintBedTransferReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(BedTransferService, req);
    service.PrintBedTransferReport(req.body)
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
