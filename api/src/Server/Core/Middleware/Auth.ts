import * as express from 'express';
import { Router, Request, Response, NextFunction } from 'express-serve-static-core';

const router: Router = express.Router();

router.use((req: Request, res: Response, next: NextFunction): any => {
    if ((<any>req).isAuthenticated()) {
        next();
    } else {
        res.status(401).send({ Error: { Code: '401', Message: 'Authentication failed.' } });
    }
});

export { router as AuthMiddleware };
