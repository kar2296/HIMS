import { ApiRequest } from '../../../Common/Index';
import * as request from 'request';

export class SNOMEDCTBo {
    public static async GetSNOMEDCT(apiReq?: ApiRequest<any>): Promise<any> {
        let Result: any = [];
        let Description = '';
        if (apiReq && apiReq.Params) {
            apiReq.Params.forEach((param) => {
                switch (param.Key) {
                    case 0:
                        Description = param.Value;
                        break;
                }
            });
        }
        let SNOMEDResp: any = await SNOMEDCTBo.SNOMEDCTQueryData(Description);
        console.log(SNOMEDResp.matches);
        if (SNOMEDResp.matches) {
            let SearchData = {
                'matches': SNOMEDResp.matches
            };
            Result.push(SearchData);
        }
        return Result;
    }

    public static async GetSNOMEDCTByConceptId(apiReq?: ApiRequest<any>): Promise<any> {
        let Result = [];
        let ConceptId = null;
        if (apiReq && apiReq.Params) {
            apiReq.Params.forEach((param) => {
                switch (param.Key) {
                    case 0:
                        ConceptId = param.Value;
                        break;
                }
            });
        }
        let SNOMEDParentResp: any = await SNOMEDCTBo.SNOMEDCTConceptParentData(ConceptId);
        console.log(SNOMEDParentResp);
        if (SNOMEDParentResp && SNOMEDParentResp.length > 0) {
            Result.push({ 'Parents': SNOMEDParentResp});
        }

        let SNOMEDChildResp: any = await SNOMEDCTBo.SNOMEDCTConceptChildData(ConceptId);
        console.log(SNOMEDChildResp);
        if (SNOMEDChildResp && SNOMEDChildResp.length > 0) {
            Result.push({ 'Children': SNOMEDChildResp });
        }


        return Result;
    }


    public static async SNOMEDCTQueryData(Description: String): Promise<request.RequestResponse> {
        //console.log(Description);
        return new Promise<any>((resolve, reject) => {
            return request('http://browser.ihtsdotools.org/api/v1/snomed/en-edition/' +
                'v20180131/descriptions?query=' + Description +//&searchMode=partialMatching
                '&lang=english&statusFilter=english&skipTo=0&returnLimit=100' +
                '&normalize=true', { json: true }, (err, res, body) => {
                    if (err) {
                        console.log(err); resolve(err);
                    }
                    console.log(body);
                    resolve(body);
                });
        });
    }

    public static async SNOMEDCTConceptParentData(ConceptId: String): Promise<request.RequestResponse> {
        //console.log(ConceptId);
        return new Promise<any>((resolve, reject) => {
            return request('https://browser.ihtsdotools.org/api/v1/snomed/en-edition/v20180131/' +
                'concepts/'+ConceptId+'/Parents', { json: true }, (err, res, body) => {
                    if (err) {
                        console.log(err); resolve(err);
                    }
                    console.log(body);
                    resolve(body);
                });
        });


    }

    public static async SNOMEDCTConceptChildData(ConceptId: String): Promise<request.RequestResponse> {
        //console.log(ConceptId);
        return new Promise<any>((resolve, reject) => {
            return request('https://browser.ihtsdotools.org/api/v1/snomed/en-edition/v20180131/' +
                'concepts/'+ConceptId+'/children', { json: true }, (err, res, body) => {
                    if (err) {
                        console.log(err); resolve(err);
                    }
                    console.log(body);
                    resolve(body);
                });
        });
    }


}
