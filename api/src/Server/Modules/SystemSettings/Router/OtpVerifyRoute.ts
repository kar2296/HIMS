import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { OtpVerifyService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddOtpVerify',
  (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtpVerifyService, req);
    service.AddOtpVerify(req.body)
      .then((response) => { res.send(response); })
      .catch(next);
  });
router.post('/AddProviderOtpVerify',
  (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtpVerifyService, req);
    service.AddProviderOtpVerify(req.body)
      .then((response) => { res.send(response); })
      .catch(next);
  });
router.post('/UpdateProviderOtpVerify',
  (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtpVerifyService, req);
    service.UpdateProviderOtpVerify(req.body)
      .then((response) => { res.send(response); })
      .catch(next);
  });
router.post('/UpdateOtpVerify',
  (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtpVerifyService, req);
    service.UpdateOtpVerify(req.body)
      .then((response) => { res.send(response); })
      .catch(next);
  });
router.post('/SendForgotOtpVerify',
  (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtpVerifyService, req);
    service.SendForgotOtpVerify(req.body)
      .then((response) => { res.send(response); })
      .catch(next);
  });
router.post('/UpdateForgotOtpVerify',
  (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(OtpVerifyService, req);
    service.UpdateForgotOtpVerify(req.body)
      .then((response) => { res.send(response); })
      .catch(next);
  });
router.post('/GetOtpVerifyById', (req: Request, res: Response, next: NextFunction): any => {
  const service = ServiceFactory.CreateService(OtpVerifyService, req);
  service.GetOtpVerifyById(req.body)
    .then((response) => { res.send(response); })
    .catch(next);
});
router.post('/GetOtpVerifys', (req: Request, res: Response, next: NextFunction): any => {
  const service = ServiceFactory.CreateService(OtpVerifyService, req);
  service.GetOtpVerifys(req.body)
    .then((response) => { res.send(response); })
    .catch(next);
});
router.post('/DeleteOtpVerify', (req: Request, res: Response, next: NextFunction): any => {
  const service = ServiceFactory.CreateService(OtpVerifyService, req);
  service.DeleteOtpVerify(req.body)
    .then((response) => { res.send(response); })
    .catch(next);
});

export default router;
