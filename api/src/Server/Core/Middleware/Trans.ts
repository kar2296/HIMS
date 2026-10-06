import * as express from 'express';
import { Router, Request, Response, NextFunction } from 'express-serve-static-core';
import { Dal } from '../Repository';
import { Sequence } from '../../Modules/General/Common/Sequence.s';

const router: Router = express.Router();

router.use((req: Request, res: Response, next: NextFunction): any => {
    // Dal.transaction()
    //     .then((trans) => {
    //         const send = res.send;

    //         res.send = function (response): any {
    //             const promise = (req.deferredSequences && req.deferredSequences.length > 0) ?
    //                 Sequence.ProcessDeferredSequences(req) : Promise.resolve();
    //             promise.then(() => {
    //                 if (!req.transaction.finished) {
    //                     req.transaction.commit();
    //                 }
    //                 return (send as any).bind(res)(response);
    //             });
    //         };
    //         req.transaction = trans;
    //         next();
    //     })
    //     .catch(next);
    // Dal.transaction()
    // .then((trans) => {
    //     const send = res.send;

    //     res.send = function (response): any {
    //         const promise = (req.deferredSequences && req.deferredSequences.length > 0)
    //             ? Sequence.ProcessDeferredSequences(req)
    //             : Promise.resolve();

    //         promise
    //             .then(() => {
    //                 if (!req.transaction.finished) {
    //                     return req.transaction.commit(); // Commit the transaction
    //                 }
    //             })
    //             .catch((error) => {
    //                 // Rollback the transaction if an error occurs
    //                 if (!req.transaction.finished) {
    //                     return req.transaction.rollback().then(() => {
    //                         throw error; // Re-throw to pass the error along
    //                     });
    //                 }
    //             })
    //             return (send as any).bind(res)(response);
    //             // .finally(() => {
    //             //     (send as any).bind(res)(response); // Send the response
    //             // });
    //     };

    //     req.transaction = trans; // Attach the transaction to the request object
    //     next();
    // })
    // .catch((error) => {
    //     // Handle errors that occur during transaction initialization
    //     if (req.transaction && !req.transaction.finished) {
    //         req.transaction.rollback().finally(() => next(error));
    //     } else {
    //         next(error);
    //     }
    // });
    Dal.transaction()
    .then(function (trans) {
        const send = res.send;

        res.send = function (response): any {
            let promise;

            if (req.deferredSequences && req.deferredSequences.length > 0) {
                promise = Sequence.ProcessDeferredSequences(req);
            } else {
                promise = Promise.resolve();
            }

            promise
                .then(function () {
                    if (!req.transaction.finished) {
                        return req.transaction.commit(); // Commit the transaction
                    }
                })
                .catch(function (error) {
                    // Rollback the transaction if an error occurs
                    if (!req.transaction.finished) {
                        return req.transaction.rollback().then(function () {
                            throw error; // Re-throw to pass the error along
                        });
                    }
                    throw error; // Re-throw if rollback is unnecessary
                })
                .then(function () {
                    send.call(res, response); // Send the response after success
                })
                .catch(next); // Handle errors during response processing
        };

        req.transaction = trans; // Attach the transaction to the request object
        next();
    })
    .catch(function (error) {
        // Handle errors during transaction initialization
        if (req.transaction && !req.transaction.finished) {
            req.transaction.rollback().then(function () {
                next(error); // Pass the error to the next middleware
            }).catch(next);
        } else {
            next(error); // Pass the error directly if no transaction exists
        }
    });

});

export { router as TransMiddleware };
