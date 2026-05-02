import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UserDefinedFieldService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddUserDefinedField', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefinedFieldService, req);
    service.AddUserDefinedField(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUserDefinedField', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefinedFieldService, req);
    service.UpdateUserDefinedField(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserDefinedFieldById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefinedFieldService, req);
    service.GetUserDefinedFieldById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserDefinedFields', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefinedFieldService, req);
    service.GetUserDefinedFields(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUserDefinedField', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserDefinedFieldService, req);
    service.DeleteUserDefinedField(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
