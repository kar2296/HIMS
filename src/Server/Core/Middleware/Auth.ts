import * as express from 'express';
import { Router, Request, Response, NextFunction } from 'express-serve-static-core';

const router: Router = express.Router();

router.use((req: Request, res: Response, next: NextFunction): any => {
    (<any>req).isAuthenticated()
        ? next()
        : next(new Error('Authentication failed.'));
});

export { router as AuthMiddleware };
