import * as express from 'express';
import { FileUploader } from '../../../Core/Index';
import { AppConfig } from '../../../../config/index';

import { Router, Request, Response, NextFunction } from '../../../Core/Index';

let router: Router = express.Router();

router.post('/Upload',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, field: 'profile', storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        res.send({ result: 'Success', file: req.file });
    });

export default router;
