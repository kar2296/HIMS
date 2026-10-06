import * as express from 'express';
import { Router, Express, Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express-serve-static-core';
import * as http from 'http';
import * as https from 'https';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as fs from 'fs';
import { Server } from 'net';
import { IWebServerConfig, IStaticFileConfig } from '../../config/index';
// var cors = require('cors');
export { Router, Express, Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express-serve-static-core';
export const GetRouter = express.Router;

export class WebServer {
    public Config: IWebServerConfig;
    public App: Express;
    public Server: Server;
    //private Port: number;
    constructor(webconfig: IWebServerConfig) {
        var self = this;
        self.Config = webconfig;
        self.App = express();
    }

    public Init(): WebServer {
        var self = this;
        self.App.set('port', self.Config.ApiPort);
        self.App.use(logger('dev'));
        self.App.use(cookieParser());
        // S5693: JSON body limit set to 2MB (safe default for API requests).
        // NOTE: File uploads in this app are sent as base64 inside JSON.
        // If uploads exceed 2MB, the preferred fix is to switch to multipart/form-data
        // with multer (limit: 8MB) rather than raising this JSON limit.
        self.App.use(bodyParser.json({ limit: '2mb' }));
        // S5693: urlencoded limit explicitly set to 2MB (matches JSON parser).
        self.App.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));
        return self;
    }
    public AddStaticFileRouting(route: string, path: string, config: IStaticFileConfig): void {
        var self = this;
        self.App.use(route, express.static(path, config));
        console.log('Route Name: %s Path: %s', route, path);
    }

    public AddApiRouting(route: string, router: Router): void {
        var self = this;
        self.App.use(route, router);
    }
    public Start(): WebServer {
        let self = this;
        self.registerModules();
        if (self.Config.IsHttpsEnabled) {
            console.log('https - Enabled');
            let privateKey = fs.readFileSync(self.Config.HttpsKeypath, 'utf8');
            let certificate = fs.readFileSync(self.Config.HttpsCertificatepath, 'utf8');
            let credentials = { key: privateKey, cert: certificate };
            self.Server = https.createServer(credentials, self.App);
        } else {
            console.log('http - Enabled');
            self.Server = http.createServer(self.App);
        }
        self.Server.listen(self.Config.ApiPort, null, (self.listenerCallback).bind(self));
       // self.Server.listen(self.Config.ApiPort, 192.168.1.9 , (self.listenerCallback).bind(self));
        return self;
    }
    public Stop(callback?: (err?: Error) => void): WebServer {
        let self = this;
        this.Server.close(callback);
        console.log('Express server stop');
        return self;
    }

    // private configure(): void {
    //     var self = this;
    //     self.App.configure('development', () => {
    //         //TODO:
    //     });
    //     self.App.configure('testing', () => {
    //         //TODO:
    //     });
    //     self.App.configure('production', () => {
    //         //TODO:
    //     });
    // }
    public HandlerFor404: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
        let err: any = new Error('Resource Not Found.');
        err.status = 404;
        next(err);
    }
    public ErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
        console.error(err);
        let statusCode = err.status || err.statusCode;
        if (!statusCode) {
            if (err.code === 'OBJECT_UPDATED_BY_SOMEONE') {
                statusCode = 409;
            } else if (err.message === 'Resource Not Found.') {
                statusCode = 404;
            } else {
                statusCode = 500;
            }
        }
        res.status(statusCode).json({
            Data: null,
            Error: {
                Code: err.code || 'ERROR',
                Message: err.message || (typeof err === 'string' ? err : 'An error occurred.')
            }
        });
    }
    private registerModules(): void {
        var self = this;
        self.App.use(self.HandlerFor404);
        self.App.use((self.ErrorHandler).bind(self));
    }
    private listenerCallback(): void {
        var self = this;
        let port = self.App.get('port');
        console.log('Express server listening on port :' + port);
        console.log('Application Path :' + __dirname);
        console.log('Evironment :' + process.env.NODE_ENV);
    }
}
