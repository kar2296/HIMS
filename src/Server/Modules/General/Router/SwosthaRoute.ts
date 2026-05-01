import * as express from 'express';
import * as request from 'request';
//import { FileUploader } from '../../../Core/Index';
//import { AppConfig } from '../../../../config/index';

import { Router, Request, Response, NextFunction } from '../../../Core/Index';

let router: Router = express.Router();

router.post('/GetSwosthaPatient',
    (req: Request, res: Response, next: NextFunction): any => {

        console.log('|||||Swostha Link');
        console.log(req.body.Data.Url);
        console.log(req.body.Data.Params);
        let baseURI = process.env.SWOSTHA_BASEURI;
        console.log(baseURI);
        //let url = 'https://ap02.swostha.com/' + 'auth/login';
        let url = process.env.SWOSTHA_BASEURI + req.body.Data.Url;



        // var inputData = {
        //     Params: [{
        //         'Key': 7,
        //         'Value': 2
        //       },
        //       {
        //         'Key': 2,
        //         'Value': 2
        //       }]
        //     PageContext: {
        //         PageSize: 1000,
        //         PageNumber: 1
        //     }
        // };

        //(Base Request) let inputData: any = {
        //     UserName: 'superadmin',
        //     Password: 'aKPMv4RmZImijRFS1tOeKQ==',
        //     ForceLogin: false,
        //     notificationtoken: ''
        // };
        let httpOptions = {
            timeout: 60000,
            headers: {
                'x-api-key': 'Api-Key '+process.env.SWOSTHA_SECRET,
                'Content-Type': 'application/json; charset=utf-8'
            },
            strictSSL: false,
            body: {Params: req.body.Data.Params},
            json: true
        };
        console.log('httpOptions', httpOptions);

        request.post(url, httpOptions,
            (error: any, response: request.RequestResponse, body: any) => {
                if (error) {
                    console.log(error);
                    //reject(error);
                }
                //resolve({ response });
                //console.log(body);
                res.send(response);
            });

    },
    // (req: Request, res: Response, next: NextFunction): any => {
    //     res.send({ result: 'Success', file: req.file });
    // }
);

export default router;
