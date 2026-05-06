import * as express from 'express';
import type { Router, Request, Response, NextFunction } from 'express-serve-static-core';

const router: Router = express.Router();

router.use((req: Request, res: Response, next: NextFunction): any => {
    (req as any).isAuthenticated()
        ? next()
        : next(new Error('Authentication failed.'));
});

export { router as AuthMiddleware };
