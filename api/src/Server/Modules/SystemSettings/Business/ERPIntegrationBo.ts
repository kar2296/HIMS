import { BaseRequest } from '../../../Common/Index';
import { AppConfig } from '../../../../config/index';
import { GuarantorFormat } from './ERPFormatter/GuarantorFormat';
import { VendorMasterFormat } from './ERPFormatter/VendorMasterFormat';
import { FinanceReceivableFormat } from './ERPFormatter/FinanceReceivableFormat';
import * as moment from 'moment';

export class ERPIntegrationBo {
    public async ERPIntegrationXML(req: BaseRequest): Promise<boolean> {
        let ValidatedJSONData: any = [];
        let targetcontext: string = req.Data.targetcontext;
        if (targetcontext === 'GuarantorMasterFormat') {
            let objGuarantorFormat = new GuarantorFormat();
            ValidatedJSONData = await objGuarantorFormat.GuarantorValidation(req);
            await this.GenerateXML(ValidatedJSONData, 'GuarantorMaster');
        } else if (targetcontext === 'VendorMasterFormat') {
            let objVendorMasterFormat = new VendorMasterFormat();
            ValidatedJSONData = await objVendorMasterFormat.VendorMasterValidation(req);
            await this.GenerateXML(ValidatedJSONData, 'VendorMaster');
        } else if (targetcontext === 'FinanceReceivableFormat') {
            let objFinanceReceivableFormat = new FinanceReceivableFormat();
            ValidatedJSONData = await objFinanceReceivableFormat.CustomerValidation(req);
            await this.GenerateXML(ValidatedJSONData, 'CustomerMaster');
            objFinanceReceivableFormat = new FinanceReceivableFormat();
            ValidatedJSONData = await objFinanceReceivableFormat.FinanceReceivableValidation(req);
            await this.GenerateXML(ValidatedJSONData, 'FinanceReceipt');
        }

        return false;
    }

    public async ERPIntegrationXL(req: BaseRequest): Promise<boolean> {
        let ValidatedJSONData = null;
        let heading: any = [];
        let targetcontext: string = req.Data.targetcontext;
        if (targetcontext === 'GuarantorMasterFormat') {
            let objGuarantorFormat = new GuarantorFormat();
            ValidatedJSONData = await objGuarantorFormat.GuarantorValidation(req);
            heading = GuarantorFormat.heading;
            await this.GenerateXL(heading, ValidatedJSONData, 'GuarantorMaster');
        } else if (targetcontext === 'VendorMasterFormat') {
            let objVendorMasterFormat = new VendorMasterFormat();
            ValidatedJSONData = await objVendorMasterFormat.VendorMasterValidation(req);
            heading = VendorMasterFormat.heading;
            await this.GenerateXL(heading, ValidatedJSONData, 'VendorMaster');
        } else if (targetcontext === 'FinanceReceivableFormat') {
            let objFinanceReceivableFormat = new FinanceReceivableFormat();
            let CustomerJSONData = await objFinanceReceivableFormat.CustomerValidation(req);
            heading = FinanceReceivableFormat.Customerheading;
            if (await this.GenerateXL(heading, CustomerJSONData, 'CustomerMaster')) {
                objFinanceReceivableFormat = new FinanceReceivableFormat();
                ValidatedJSONData = await objFinanceReceivableFormat.FinanceReceivableValidation(req);
                heading = FinanceReceivableFormat.Financeheading;
                await this.GenerateXL(heading, ValidatedJSONData, 'FinanceReceipt');
            }
        }
        return false;
    }

    public async GenerateXML(ValidatedJSONData: any[], filename: string): Promise<boolean> {
        let fs = require('fs');
        if (ValidatedJSONData) {
            let MyData = { 'ListView': JSON.parse(JSON.stringify(ValidatedJSONData)) };
            if (MyData) {
                let jsontoxml = require('jsontoxml');
                let currentdate = new Date();
                let expfilename = filename + '_' + moment(currentdate).format('YYYYMMDDHHmmss') + '.xml';
                fs.writeFile(AppConfig.UploadExternalFilePath + expfilename,
                    jsontoxml(MyData
                        , { escape: true, removeIllegalNameCharacters: true, prettyPrint: true, xmlHeader: true }));
                return true;
            }
        }
        return false;
    }

    public async GenerateXL(heading: any[], ValidatedJSONData: any[], filename: string): Promise<boolean> {
        if (ValidatedJSONData) {
            let json2xls = require('json2xls');
            let myxls: any;
            if (heading.length > 0) {
                myxls = json2xls(ValidatedJSONData, { heading });
            } else {
                myxls = json2xls(ValidatedJSONData);
            }
            let fs = require('fs');
            let currentdate = new Date();
            let expfilename = filename + '_' + moment(currentdate).format('YYYYMMDDHHmmss') + '.xlsx';
            fs.writeFile(AppConfig.UploadExternalFilePath + expfilename, myxls, 'binary');
            return true;
        }
        return false;
    }

    public async ERPValidation(req: BaseRequest): Promise<any> {
        let targetcontext: string = req.Data.targetcontext;
        let isERPValidation: boolean = true;
        let ValidatedJSONData = null;
        if (targetcontext === 'GuarantorMasterFormat') {
            let objGuarantorFormat = new GuarantorFormat();
            ValidatedJSONData = await objGuarantorFormat.GuarantorValidation(req);
        } else if (targetcontext === 'VendorMasterFormat') {
            let objVendorMasterFormat = new VendorMasterFormat();
            ValidatedJSONData = await objVendorMasterFormat.VendorMasterValidation(req);
        } else if (targetcontext === 'FinanceReceivableFormat') {
            let objFinanceReceivableFormat = new FinanceReceivableFormat();
            ValidatedJSONData = await objFinanceReceivableFormat.FinanceReceivableValidation(req);
        }

        if (!ValidatedJSONData || ValidatedJSONData === null) {
            isERPValidation = false;
        }

        return isERPValidation;
    }
}
