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
        self.App.use(bodyParser.json({ limit: '50mb' }));
        // self.App.use(cors());
        //self.App.use(bodyParser.urlencoded({ extended: false }));
        self.App.use(bodyParser.urlencoded({ extended: true }));
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
        let err = new Error('Resource Not Found.');
        next(err);
    }
    public ErrorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
        console.error(err);
        res.status(404).json(err);
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
