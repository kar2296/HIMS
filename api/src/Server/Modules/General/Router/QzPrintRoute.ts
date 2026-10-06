import * as express from 'express';
import { createSign } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';

/**
 * QZ Tray request signing (used by src/printing/qzPrinter.ts).
 *
 * QZ Tray prints silently only for sites that sign every request with the site's private key.
 * The key must stay on the server; the browser only receives signatures.
 *
 *   QZ_CERTIFICATE_PATH  public certificate (PEM) issued for this site
 *   QZ_PRIVATE_KEY_PATH  matching private key (PEM), kept out of source control (e.g. api/secrets/qz/)
 *
 * Both are optional. Without them QZ Tray still prints, but asks once per computer to allow the site.
 * Routes are mounted under /General, behind the bearer-token authentication middleware.
 */
const router: Router = express.Router();

const MAX_SIGN_LENGTH = 16384;

interface QzKeys {
    certificate: string | null;
    privateKey: string | null;
}

let keys: QzKeys | null = null;

function readPem(path: string | undefined): string | null {
    if (!path) {
        return null;
    }
    try {
        return readFileSync(resolve(process.cwd(), path), 'utf8');
    } catch (err) {
        // Plain concatenation: the gulp build runs files through gulp-template, which evaluates template literals.
        console.error('QZ print: cannot read ' + path, err);
        return null;
    }
}

function loadKeys(): QzKeys {
    if (!keys) {
        keys = {
            certificate: readPem(process.env.QZ_CERTIFICATE_PATH),
            privateKey: readPem(process.env.QZ_PRIVATE_KEY_PATH)
        };
    }
    return keys;
}

router.post('/Certificate', (req: Request, res: Response): void => {
    const { certificate, privateKey } = loadKeys();
    // Only hand out the certificate when requests can also be signed; otherwise QZ Tray rejects every call.
    res.send({ Certificate: certificate && privateKey ? certificate : null });
});

router.post('/Sign', (req: Request, res: Response, next: NextFunction): void => {
    const toSign = req.body && req.body.Data ? req.body.Data.ToSign : undefined;
    if (typeof toSign !== 'string' || !toSign || toSign.length > MAX_SIGN_LENGTH) {
        res.status(400).json({ Data: null, Error: { Code: 'INVALID_REQUEST', Message: 'Nothing to sign.' } });
        return;
    }
    const { certificate, privateKey } = loadKeys();
    if (!certificate || !privateKey) {
        res.status(503).json({ Data: null, Error: { Code: 'QZ_SIGNING_DISABLED', Message: 'QZ Tray signing is not configured on the server.' } });
        return;
    }
    try {
        const signer = createSign('SHA512');
        signer.update(toSign);
        res.send({ Signature: signer.sign(privateKey, 'base64') });
    } catch (err) {
        next(err);
    }
});

export default router;
