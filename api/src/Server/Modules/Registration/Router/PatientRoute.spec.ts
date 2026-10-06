import * as request from 'supertest';
//import {WebServer } from '../../../Core/Index'; //, Request, Response, NextFunction
import {AppConfig} from '../../../../config/index';
//import route from './User';
import bootstrap from '../../../../Bootstrap';

const baseUrl = 'http://127.0.0.1:' + AppConfig.ApiPort;
bootstrap();

describe('/User', () => {
    it('POST /Add', (done) => {
        request(baseUrl)
            .post('/user/AddUser')
            .send({
                'Rev': 1,
                'Title': 'Title',
                'FirstName': 'FirstName',
                'MiddleName': 'MiddleName',
                'LastName': 'LastName',
                'Age': 30,
                'PreferredLanguage': 'PreferredLanguage',
                'Qualification': 'Qualification',
                'Nationality': 'Nationality',
                'Category': 'Category',
                'DoctorShareClass': 'DoctorShareClass',
                'AddressLine1': 'AddressLine1',
                'AddressLine2': 'AddressLine2',
                'Pincode': 'Pincode',
                'Area': 'Area',
                'City': 'City',
                'State': 'State',
                'Country': 'Country',
                'LandLine': 'LandLine',
                'Mobile': 'Mobile',
                'Email': 'Email',
                'LicenseNo': 'LicenseNo',
                'UserName': 'UserName',
                'Password': 'Password'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err: any, res: request.Response) {
                if (err) throw err;
                console.log(res.body);
                done();
            });
    });

    it('POST /FindById', (done) => {
        request(baseUrl)
            .post('/user/FindById')
            .send({
                'Id': 1
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            //.expect('Content-Length', '15')
            .expect(200)
            .end(function (err: any, res: any) {
                if (err) throw err;
                done();
            });
    });
    it('POST /GetAllUsers', (done) => {
        request(baseUrl)
            .post('/user/GetAllUsers')
            .send({
                'PageContext': {
                    'PageSize': 100,
                    'PageNumber': 1
                },
                'Params': null
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err: any, res: any) {
                if (err) throw err;
                done();
            });
    });
});
