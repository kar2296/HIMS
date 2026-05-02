import * as SStatic from 'sequelize';
import { BaseRequest } from '../../../Common/Index';
import { BaseBo } from '../../Base/Index';
import { AppConfig } from '../../../../config/index';
import { ServiceItemFormat } from './MasterExportFormatter/ServiceItemFormatter';
import { ServiceItemFilters } from '../../ClinicalMaster/Common/Filters.e';
import { ServiceRateCategoryFilters } from '../../ClinicalMaster/Common/Filters.e';
import { AppInfoInstance, AppInfoAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as clinicbo from '../../ClinicalMaster/Business/Index';
import * as moment from 'moment';

export class MasterExportBo extends BaseBo<AppInfoInstance, AppInfoAttributes> {
    public async MasterExportXL(req: BaseRequest): Promise<boolean> {
        let ExportJsonData: any = [];
        let heading: any = [];
        let targetcontext: string = req.Data.targetcontext;
        if (targetcontext.toLowerCase() === 'serviceitemmaster') {
            let objServiceRateCategory = await this.getServiceRateCategory(req);
            let objServiceItem = await this.getServiceItemData(req);
            // console.log(objServiceRateCategory);
            // console.log(objServiceItem);
            let ServiceitemWithTariffModel: any = {};
            try {
                for (var idx in objServiceItem.Data) {
                    var serviceItem = objServiceItem.Data[idx];
                    ServiceitemWithTariffModel.ItemCode = serviceItem.ItemCode;
                    ServiceitemWithTariffModel.Description = serviceItem.Description;
                    for (var idx1 in serviceItem.ServiceItemTariffDetails) {
                        var vServiceItemTariffDetails = serviceItem.ServiceItemTariffDetails[idx1];
                        for (var idx2 in objServiceRateCategory.Data) {
                            var vServiceRateCategory = objServiceRateCategory.Data[idx2];
                            if (vServiceItemTariffDetails.ServiceRateCategoryId === vServiceRateCategory.Id) {
                                var TariffName = vServiceRateCategory.Description;
                                ServiceitemWithTariffModel.TariffName = TariffName;
                            }
                        }
                        ServiceitemWithTariffModel.Rate = vServiceItemTariffDetails.Rate;
                    }

                    if (ServiceitemWithTariffModel && ServiceitemWithTariffModel.ItemCode)
                        ExportJsonData.push(ServiceitemWithTariffModel);
                }
            } catch (e) { console.log(e); }
            heading = ServiceItemFormat.heading;
            if (ExportJsonData && ExportJsonData.length > 0)
               await this.GenerateXL(heading, ExportJsonData, 'ServiceItemMaster');
        }
        return false;
    }

    public async getServiceRateCategory(req: BaseRequest): Promise<any> {
        let ServiceRateCategory = null;
        try {
            let serviceRateCategApiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: ServiceRateCategoryFilters.ActiveStatus, Value: req.Data.ActiveStatus }
                ]
            };
            let objServiceRateCategoryBo = BoFactory.GetBo(clinicbo.ServiceRateCategoryBo, this.Request);
            ServiceRateCategory = await objServiceRateCategoryBo.GetServiceRateCategorys(serviceRateCategApiReq);

        } catch (e) { console.log(e); }
        return ServiceRateCategory;
    }

    public async getServiceItemData(req: BaseRequest): Promise<any> {
        let AllServiceItemFormat = null;
        try {
            let serviceItemApiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: ServiceItemFilters.Code, Value: req.Data.Code },
                    { Key: ServiceItemFilters.ActiveStatus, Value: req.Data.ActiveStatus }
                ]
            };
            if (req.Data.SubCategoryId) {
                serviceItemApiReq.Params.push({ Key: ServiceItemFilters.SubCategoryId, Value: req.Data.SubCategoryId });
            } if (req.Data.DepartmentId) {
                serviceItemApiReq.Params.push({ Key: ServiceItemFilters.DepartmentId, Value: req.Data.DepartmentId });
            } if (req.Data.CategoryId) {
                serviceItemApiReq.Params.push({ Key: ServiceItemFilters.CategoryId, Value: req.Data.CategoryId });
            } if (req.Data.MasterTypeId) {
                serviceItemApiReq.Params.push({ Key: ServiceItemFilters.MasterTypeId, Value: req.Data.MasterTypeId });
            } if (req.Data.SubDepartmentId) {
                serviceItemApiReq.Params.push({ Key: ServiceItemFilters.SubDepartmentId, Value: req.Data.SubDepartmentId });
            } if (req.Data.IsPackage) {
                serviceItemApiReq.Params.push({ Key: ServiceItemFilters.IsPackage, Value: req.Data.IsPackage });
            } if (req.Data.MasterName) {
                serviceItemApiReq.Params.push({ Key: ServiceItemFilters.MasterName, Value: req.Data.MasterName });
            }
            let ServiceItemBo = BoFactory.GetBo(clinicbo.ServiceItemBo, this.Request);
            AllServiceItemFormat = await ServiceItemBo.GetServiceItems(serviceItemApiReq);
        } catch (e) { console.log(e); }
        return AllServiceItemFormat;
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

    public async MasterExportValidation(req: BaseRequest): Promise<any> {
        // let targetcontext: string = req.Data.targetcontext;
        let isERPValidation: boolean = true;
        let ValidatedJSONData = null;
        // if (targetcontext === 'ServiceItemMaster') {
        // }

        if (!ValidatedJSONData || ValidatedJSONData === null) {
            isERPValidation = false;
        }

        return isERPValidation;
    }

    public GetModel(): SStatic.Model<AppInfoInstance, AppInfoAttributes> {
        return this.Models.AppInfo;
    }
}
