import { WebServer, Request, Response, NextFunction } from './Server/Core/Index';
import { AppConfig } from './config/index';
import * as route from './Server/Router';
import { ApiResponse, IBaseDto } from './Server/Common/Index';

export class Bootstrap {
    public Server: WebServer;
    public Init(): WebServer {
        let server = new WebServer(AppConfig);
        server.ErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
            if (req.transaction) {
                req.transaction.rollback();
            }
            let e = err as any;
            let code = err && e.original ? e.original.code : '';
            if (!code) {
                code = e.code ? e.code : '';
            }
            var out: ApiResponse<IBaseDto> = {
                Data: null,
                PageContext: null,
                Error: { Code: code, Message: err.message, Stack: process.env.NODE_ENV === 'development' ? err.stack : null }
            };
            console.error(err);
            res.status(404).json(out);
        };
        server.Init();
        server.AddStaticFileRouting(AppConfig.WebBasePath, __dirname + process.env.WEB_UI_PATH, AppConfig.WebStaticFile);
        server.AddStaticFileRouting(AppConfig.DocsBasepath, __dirname + AppConfig.DocsBasepath, AppConfig.WebStaticFile);
        server.AddApiRouting('/', route);
        this.Server = server;
        return this.Server;
    }
    public Start(): void {
        this.Server.Start();
    }
    public Stop(): void {
        this.Server.Stop();
    }
}
