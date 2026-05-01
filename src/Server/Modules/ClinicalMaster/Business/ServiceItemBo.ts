import * as SStatic from 'sequelize';
import { BaseBo, MapBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { ServiceItemInstance, ServiceItemAttributes } from '../Model/Interface/Index';
import { ServiceItemFilters } from '../Common/Filters.e';
import * as generalMasterBO from '../../GeneralMaster/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as lisbo from '../../LIS/Business/Index';
import { join } from 'path';
import { readFileSync } from 'fs';

export class ServiceItemBo extends BaseBo<ServiceItemInstance, ServiceItemAttributes> {
    public async AddServiceItem(req: BaseRequest): Promise<number> {
        let duplicate = await this.FindAll({
            where: {
                'ItemCode': req.Data['ItemCode']
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }
        let file = this.Request.file;
        if (file) {
            req.Data.Imagepath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);

        let apiDeptReq = { // New ServiceItem - Primary FacilityId. map to serviceitemfacilitymap table.
            Id: 0,
            Data: [{ 'ServiceItemId': result.dataValues.Id, 'FacilityId': req.Data.FacilityId }]
        };
        await this.MapFacilities(apiDeptReq);

        if (result && req.Data.IsOrderable) {
            let TestData: any = {
                Data: {
                    Id: 0,
                    OrganizationId: this.Session.OrganizationId,
                    FacilityId: req.Data.FacilityId,
                    TESTMASTERTYPId: req.Data.OrderTypeId,
                    Code: req.Data.ItemCode,
                    Name: req.Data.Name,
                    Description: req.Data.Description,
                    Mnemonics: req.Data.Description,
                    DepartmentId: req.Data.DepartmentId,
                    SubDepartmentId: req.Data.SubDepartmentId,
                    IsActive: true,
                    IsDirectBill: true,
                    Status: 1,
                    ActiveStatusId: 2,
                    TestFromLocationId: 1,
                    // SampletypeId: 1,
                    ServItemId: result.dataValues.Id
                },
            };
            let lisBO = BoFactory.GetBo(lisbo.TestmasterBo, this.Request);
            await lisBO.AddTestmaster(TestData);
        }
        if (result && req.Data.IsOrderable) {
            let AnalyteData: any = {
                Data: {
                    Id: 0,
                    OrganizationId: this.Session.OrganizationId,
                    FacilityId: req.Data.FacilityId,
                    AnalyteTypeId: req.Data.OrderTypeId,
                    Code: req.Data.ItemCode,
                    Name: req.Data.Name,
                    Description: req.Data.Description,
                    Mnemonics: req.Data.Description,
                    DepartmentId: req.Data.DepartmentId,
                    SubDepartmentId: req.Data.SubDepartmentId,
                    IsActive: true,
                    Status: 1,
                    ActiveStatusId: 2,
                    Valuetype_e: 1,
                    // SampletypeId: 1,
                },
            };
            let lisBO = BoFactory.GetBo(lisbo.AnalytemasterBo, this.Request);
            await lisBO.AddAnalytemaster(AnalyteData);
        }
        return result.dataValues.Id;
    }

    public async UpdateServiceItem(req: BaseRequest): Promise<boolean> {
        // let duplicate = await this.FindAll({
        //     where: {
        //         'ItemCode': req.Data['ItemCode'],
        //         'Id': { '$ne': req.Data['Id'] }
        //     }
        // });
        // if (duplicate && duplicate.length > 0) {
        //     throw { code: 'ALREADYEXIST' };
        // }
        let file = this.Request.file;
        if (file) {
            req.Data.Imagepath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetServiceItemImage(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.Imagepath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Image: photoBase64 };
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        let MaxId = 0;
        let maxidInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('ServiceItemId')), 'ServiceItemId'],
            ],
            where: {
                Status: 1
            }
        });
        if (maxidInstance) {
            let patient: any = this.GetAttribute(maxidInstance);
            let lastServiceItemId = patient['ServiceItemId'];
            if (lastServiceItemId) MaxId = lastServiceItemId;
        }

        return ++MaxId;
    }

    public async GetServiceItemById(req: BaseRequest): Promise<ServiceItemAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetHolidayTariff(FacilityId: number): Promise<number> {
        let restaddnlper: number = 0;
        try {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            let printPreferencesData =
                await facilityPreferenceBO.GetPrintPreferences('billing', null, FacilityId);
            let allsunday = printPreferencesData.allsunday;
            let allmonday = printPreferencesData.allmonday;
            let alltuesday = printPreferencesData.alltuesday;
            let allwednesday = printPreferencesData.allwednesday;
            let allthursday = printPreferencesData.allthursday;
            let allfriday = printPreferencesData.allfriday;
            let allsaturday = printPreferencesData.allsaturday;
            let addnlper = printPreferencesData.holidayprecentage;
            if (allsunday || allmonday || alltuesday || allwednesday || allthursday ||
                allfriday || allsaturday) {
                let currentDate = new Date();
                switch (currentDate.getDay()) {
                    case 0:
                        if (allsunday && allsunday === '1')
                            restaddnlper = Number(addnlper);
                        break;
                    case 1:
                        if (allmonday && allmonday === '1')
                            restaddnlper = Number(addnlper);
                        break;
                    case 2:
                        if (alltuesday && alltuesday === '1')
                            restaddnlper = Number(addnlper);
                        break;
                    case 3:
                        if (allwednesday && allwednesday === '1')
                            restaddnlper = Number(addnlper);
                        break;
                    case 4:
                        if (allthursday && allthursday === '1')
                            restaddnlper = Number(addnlper);
                        break;
                    case 5:
                        if (allfriday && allfriday === '1')
                            restaddnlper = Number(addnlper);
                        break;
                    case 6:
                        if (allsaturday && allsaturday === '1')
                            restaddnlper = Number(addnlper);
                        break;
                }
            }
        } catch (ex) { console.log(ex); restaddnlper = 0; }
        return restaddnlper;
    }

    public async GetNightTariff(FacilityId: number): Promise<number> {
        try {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            let printPreferencesData =
                await facilityPreferenceBO.GetPrintPreferences('billing', null, FacilityId);
            let startTime = printPreferencesData.nightshiftstartfrom;
            let endTime = printPreferencesData.nightshiftendfrom;
            let addnlper = printPreferencesData.addnlpercentfornight;
            if (startTime && endTime && addnlper) {
                let bValidTime = await this.TimeValidation(startTime, endTime);
                if (bValidTime) {
                    return Number(addnlper);
                }
            }
        } catch (ex) { console.log(ex); }
        //console.log(printPreferencesData);
        return 0;
    }

    public async TimeValidation(startTime: any, endTime: any): Promise<boolean> {
        let sResult = false;
        try {
            let currentDate = new Date();
            let starthour: number = 0;
            let endhour: number = 0;
            let startDate = new Date(currentDate.getTime());
            if (startTime.split(':').length > 0) {
                starthour = Number(startTime.split(':')[0]);
                startDate.setHours(starthour);
            }
            if (startTime.split(':').length > 1)
                startDate.setMinutes(startTime.split(':')[1]);
            else startDate.setMinutes(0);
            if (startTime.split(':').length > 2)
                startDate.setSeconds(startTime.split(':')[2]);
            else startDate.setSeconds(0);

            let endDate = new Date(currentDate.getTime());
            if (endTime.split(':').length > 0) {
                endhour = Number(endTime.split(':')[0]);
                endDate.setHours(endhour);
            }
            if (endTime.split(':').length > 1)
                endDate.setMinutes(endTime.split(':')[1]);
            else endDate.setMinutes(0);
            if (endTime.split(':').length > 2)
                endDate.setSeconds(endTime.split(':')[2]);
            else endDate.setSeconds(59);

            if (starthour > endhour)
                endDate.setDate(currentDate.getDate() + 1);

            sResult = startDate < currentDate && endDate > currentDate;

        } catch (ex) { sResult = false; }
        return sResult;
    }

    public async GetServiceItems(apiReq?: ApiRequest<ServiceItemFilters>): Promise<ApiResponse<ServiceItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let serviceItemTariffDetailWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], as: 'ParentCategory', required: false });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], as: 'SubCategory', required: false });
        include.push({ model: this.Models.ServiceItemPackageMap, required: false });
        include.push({ model: this.Models.GstMaster, required: false });
        include.push({ model: this.Models.VirtualCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.VirtualSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ServiceGroup, attributes: ['ServiceGroupName'], required: false });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
        let GuarantorId_ = 1000;
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        await guarantorBO.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceItemFilters.Code:
                        (where as any)['$or'] = [{ 'Name': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'ShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'ItemCode': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceItemFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case ServiceItemFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ServiceItemFilters.MasterItemId:
                        where['MasterItemId'] = param.Value;
                        break;
                    case ServiceItemFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.FacilityId:
                        include.push({
                            model: this.Models.Facility,
                            attributes: ['FacilityName'],
                            where: { 'FacilityId': param.Value }
                        });
                        break;
                    case ServiceItemFilters.MasterTypeId:
                        where['MasterTypeId'] = param.Value;
                        break;
                    case ServiceItemFilters.SubDepartmentId:
                        where['SubDepartmentId'] = param.Value;
                        break;
                    case ServiceItemFilters.MasterName:
                        (where as any)['$or'] = [{ 'MasterName': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceItemFilters.IsPackage:
                        where['IsPackage'] = param.Value;
                        break;
                    case ServiceItemFilters.IsSaveServiceDetails:
                        where['IsSaveServiceDetails'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipment:
                        where['IsEquipment'] = param.Value;
                        break;
                    case ServiceItemFilters.Guarantor:
                        // if (param.Value !== GuarantorId_) {
                        include.push({
                            model: this.Models.GuarantorSupplementary,
                            attributes: ['Id', 'ServiceItemId'],
                            required: false,
                            where: {
                                'GuarantorId': param.Value
                            },
                            as: 'Supplementary'
                        });
                        // }
                        break;
                    case ServiceItemFilters.IsOrderable:
                        where['IsOrderable'] = param.Value;
                        break;
                    case ServiceItemFilters.IsRateEditable:
                        where['IsRateEditable'] = param.Value;
                        break;
                    case ServiceItemFilters.IsZeroBill:
                        where['IsZeroBill'] = param.Value;
                        break;
                    case ServiceItemFilters.IsSurgicalProcedure:
                        where['IsSurgicalProcedure'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipmentHour:
                        where['IsEquipmentHour'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipmentDaily:
                        where['IsEquipmentDaily'] = param.Value;
                        break;
                    case ServiceItemFilters.IsBedChargeHour:
                        where['IsBedChargeHour'] = param.Value;
                        break;
                    case ServiceItemFilters.IsBedChargeDaily:
                        where['IsBedChargeDaily'] = param.Value;
                        break;
                    case ServiceItemFilters.IsNightCharge:
                        where['IsNightCharge'] = param.Value;
                        break;
                    case ServiceItemFilters.CanDiscountProportionate:
                        where['CanDiscountProportionate'] = param.Value;
                        break;
                    case ServiceItemFilters.IsInstrument:
                        where['IsInstrument'] = param.Value;
                        break;
                    case ServiceItemFilters.NameStartwith:
                        (where as any)['$or'] = [{ 'Name': { '$like': '' + (param.Value || '') + '%' } },
                        { 'ShortCode': { '$eq': param.Value } }];
                        break;
                    case ServiceItemFilters.IsPhysiotheraphy:
                        where['IsPhysiotheraphy'] = param.Value;
                        break;
                    case ServiceItemFilters.IsExecutableProcedure:
                        where['IsExecutableProcedure'] = param.Value;
                        break;
                    case ServiceItemFilters.ServiceRateCategory:
                        // serviceratecategoryid = param.Value;
                        serviceItemTariffDetailWhere['ServiceRateCategoryId'] = param.Value;
                        // isReqTariffDetails = true;
                        // serviceItemTariffDetailJoin['ServiceRateCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.IsVirtualService:
                        where['IsVirtualService'] = param.Value;
                        break;
                    case ServiceItemFilters.VirtualCategoryId:
                        where['VirtualCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.VirtualsubCategoryId:
                        where['VirtualsubCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.Facility:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            // paramArr.push(-1);
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        // where['FacilityId'] = param.Value;
                        break;
                    case ServiceItemFilters.IsExcelUpload:
                        where['IsExcelUpload'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push(serviceItemTariffDetailJoin);
        include.push({
            model: this.Models.ServiceItemTariffDetail,
            where: serviceItemTariffDetailWhere,
            required: false,
            include: [
                { model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory', 'Description'], required: false }
            ]
        });
        // include.push(ServiceItemAliasJoin);
        let ServiceItemRes: any = await this.FindAndCountAll(apiReq,
            { where: where, include: include, attributes: apiReq.Attributes });

        let HolidayTariffAmt = 0;
        try {
            if (this && this.Session && this.Session.FacilityId)
                HolidayTariffAmt = await this.GetHolidayTariff(this.Session.FacilityId);
            ServiceItemRes.Data.forEach((item: any) => {
                item.HolidayTariffAmt = 0;
                if (item.IsHolidayCharge && HolidayTariffAmt) {
                    item.HolidayTariffAmt = HolidayTariffAmt;
                    let HolidayPerAmt = HolidayTariffAmt / 100;
                    item.ServiceItemTariffDetails.forEach((tariffdetail: any) => {
                        if (tariffdetail && tariffdetail.Rate && tariffdetail.Rate > 0) {
                            tariffdetail.Rate =
                                Number(tariffdetail.Rate) + (tariffdetail.Rate * HolidayPerAmt);
                        }
                    });
                }
            });
        } catch (ex) { console.log(ex); }

        if (HolidayTariffAmt === 0) {
            let NightTariffAmt = 0;
            try {
                if (this && this.Session && this.Session.FacilityId)
                    NightTariffAmt = await this.GetNightTariff(this.Session.FacilityId);

                ServiceItemRes.Data.forEach((item: any) => {
                    item.NightTariffAmt = 0;
                    if (item.IsNightCharge && NightTariffAmt) {
                        item.NightTariffAmt = NightTariffAmt;
                        let NightPerAmt = NightTariffAmt / 100;
                        item.ServiceItemTariffDetails.forEach((tariffdetail: any) => {
                            if (tariffdetail && tariffdetail.Rate && tariffdetail.Rate > 0) {
                                tariffdetail.Rate =
                                    Number(tariffdetail.Rate) + (tariffdetail.Rate * NightPerAmt);
                            }
                        });
                    }
                });
            } catch (ex) { console.log(ex); }
        }

        return ServiceItemRes;
    }

    //GetServiceItems for SurgeryOrder
    public async GetServiceItemsforSO(apiReq?: ApiRequest<ServiceItemFilters>): Promise<ApiResponse<ServiceItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let serviceItemTariffDetailWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], as: 'ParentCategory', required: false });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], as: 'SubCategory', required: false });
        include.push({ model: this.Models.ServiceItemPackageMap, required: false });
        include.push({ model: this.Models.GstMaster, required: false });
        include.push({ model: this.Models.VirtualCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.VirtualSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ServiceGroup, attributes: ['ServiceGroupName'], required: false });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
        let GuarantorId_ = 1000;
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        await guarantorBO.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceItemFilters.Code:
                        (where as any)['$or'] = [{ 'Name': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'ShortCode': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceItemFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case ServiceItemFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ServiceItemFilters.MasterItemId:
                        where['MasterItemId'] = param.Value;
                        break;
                    case ServiceItemFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.FacilityId:
                        include.push({
                            model: this.Models.Facility,
                            attributes: ['FacilityName'],
                            where: { 'FacilityId': param.Value }
                        });
                        break;
                    case ServiceItemFilters.MasterTypeId:
                        where['MasterTypeId'] = param.Value;
                        break;
                    case ServiceItemFilters.SubDepartmentId:
                        where['SubDepartmentId'] = param.Value;
                        break;
                    case ServiceItemFilters.MasterName:
                        (where as any)['$or'] = [{ 'MasterName': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceItemFilters.IsPackage:
                        where['IsPackage'] = param.Value;
                        break;
                    case ServiceItemFilters.IsSaveServiceDetails:
                        where['IsSaveServiceDetails'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipment:
                        where['IsEquipment'] = param.Value;
                        break;
                    case ServiceItemFilters.Guarantor:
                        // if (param.Value !== GuarantorId_) {
                        include.push({
                            model: this.Models.GuarantorSupplementary,
                            attributes: ['Id', 'ServiceItemId'],
                            required: false,
                            where: {
                                'GuarantorId': param.Value
                            },
                            as: 'Supplementary'
                        });
                        // }
                        break;
                    case ServiceItemFilters.IsOrderable:
                        where['IsOrderable'] = param.Value;
                        break;
                    case ServiceItemFilters.IsRateEditable:
                        where['IsRateEditable'] = param.Value;
                        break;
                    case ServiceItemFilters.IsZeroBill:
                        where['IsZeroBill'] = param.Value;
                        break;
                    case ServiceItemFilters.IsSurgicalProcedure:
                        where['IsSurgicalProcedure'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipmentHour:
                        where['IsEquipmentHour'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipmentDaily:
                        where['IsEquipmentDaily'] = param.Value;
                        break;
                    case ServiceItemFilters.IsBedChargeHour:
                        where['IsBedChargeHour'] = param.Value;
                        break;
                    case ServiceItemFilters.IsBedChargeDaily:
                        where['IsBedChargeDaily'] = param.Value;
                        break;
                    case ServiceItemFilters.IsNightCharge:
                        where['IsNightCharge'] = param.Value;
                        break;
                    case ServiceItemFilters.CanDiscountProportionate:
                        where['CanDiscountProportionate'] = param.Value;
                        break;
                    case ServiceItemFilters.IsInstrument:
                        where['IsInstrument'] = param.Value;
                        break;
                    case ServiceItemFilters.NameStartwith:
                        (where as any)['$or'] = [{ 'Name': { '$like': '' + (param.Value || '') + '%' } },
                        { 'ShortCode': { '$eq': param.Value } }];
                        break;
                    case ServiceItemFilters.IsPhysiotheraphy:
                        where['IsPhysiotheraphy'] = param.Value;
                        break;
                    case ServiceItemFilters.IsExecutableProcedure:
                        where['IsExecutableProcedure'] = param.Value;
                        break;
                    case ServiceItemFilters.ServiceRateCategory:
                        // serviceratecategoryid = param.Value;
                        serviceItemTariffDetailWhere['ServiceRateCategoryId'] = param.Value;
                        // isReqTariffDetails = true;
                        // serviceItemTariffDetailJoin['ServiceRateCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.IsVirtualService:
                        where['IsVirtualService'] = param.Value;
                        break;
                    case ServiceItemFilters.VirtualCategoryId:
                        where['VirtualCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.VirtualsubCategoryId:
                        where['VirtualsubCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push(serviceItemTariffDetailJoin);
        // include.push({
        //     model: this.Models.ServiceItemTariffDetail,
        //     where: serviceItemTariffDetailWhere,
        //     required: false,
        //     include: [
        //         { model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory', 'Description'], required: false }
        //     ]
        // });
        // include.push(ServiceItemAliasJoin);
        let ServiceItemRes: any = await this.FindAndCountAll(apiReq,
            { where: where, include: include, attributes: apiReq.Attributes });



        // let HolidayTariffAmt = 0;
        // try {
        //     if (this && this.Session && this.Session.FacilityId)
        //         HolidayTariffAmt = await this.GetHolidayTariff(this.Session.FacilityId);
        //     ServiceItemRes.Data.forEach((item: any) => {
        //         item.HolidayTariffAmt = 0;
        //         if (item.IsHolidayCharge && HolidayTariffAmt) {
        //             item.HolidayTariffAmt = HolidayTariffAmt;
        //             let HolidayPerAmt = HolidayTariffAmt / 100;
        //             item.ServiceItemTariffDetails.forEach((tariffdetail: any) => {
        //                 if (tariffdetail && tariffdetail.Rate && tariffdetail.Rate > 0) {
        //                     tariffdetail.Rate =
        //                         Number(tariffdetail.Rate) + (tariffdetail.Rate * HolidayPerAmt);
        //                 }
        //             });
        //         }
        //     });
        // } catch (ex) { console.log(ex); }

        // if (HolidayTariffAmt === 0) {
        //     let NightTariffAmt = 0;
        //     try {
        //         if (this && this.Session && this.Session.FacilityId)
        //             NightTariffAmt = await this.GetNightTariff(this.Session.FacilityId);

        //         ServiceItemRes.Data.forEach((item: any) => {
        //             item.NightTariffAmt = 0;
        //             if (item.IsNightCharge && NightTariffAmt) {
        //                 item.NightTariffAmt = NightTariffAmt;
        //                 let NightPerAmt = NightTariffAmt / 100;
        //                 item.ServiceItemTariffDetails.forEach((tariffdetail: any) => {
        //                     if (tariffdetail && tariffdetail.Rate && tariffdetail.Rate > 0) {
        //                         tariffdetail.Rate =
        //                             Number(tariffdetail.Rate) + (tariffdetail.Rate * NightPerAmt);
        //                     }
        //                 });
        //             }
        //         });
        //     } catch (ex) { console.log(ex); }
        // }

        return ServiceItemRes;
    }
    public async GettraiffServiceItems(apiReq?: ApiRequest<ServiceItemFilters>): Promise<ApiResponse<ServiceItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let serviceItemTariffDetailWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], as: 'ParentCategory', required: false });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], as: 'SubCategory', required: false });
        include.push({ model: this.Models.ServiceItemPackageMap, required: false });
        include.push({ model: this.Models.GstMaster, required: false });
        include.push({ model: this.Models.VirtualCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.VirtualSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ServiceGroup, attributes: ['ServiceGroupName'], required: false });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
        let GuarantorId_ = 1000;
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        await guarantorBO.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceItemFilters.Code:
                        (where as any)['$or'] = [{ 'Name': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'ShortCode': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceItemFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case ServiceItemFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ServiceItemFilters.MasterItemId:
                        where['MasterItemId'] = param.Value;
                        break;
                    case ServiceItemFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.FacilityId:
                        include.push({
                            model: this.Models.Facility,
                            attributes: ['FacilityName'],
                            where: { 'FacilityId': param.Value }
                        });
                        break;
                    case ServiceItemFilters.MasterTypeId:
                        where['MasterTypeId'] = param.Value;
                        break;
                    case ServiceItemFilters.SubDepartmentId:
                        where['SubDepartmentId'] = param.Value;
                        break;
                    case ServiceItemFilters.MasterName:
                        (where as any)['$or'] = [{ 'MasterName': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceItemFilters.IsPackage:
                        where['IsPackage'] = param.Value;
                        break;
                    case ServiceItemFilters.IsSaveServiceDetails:
                        where['IsSaveServiceDetails'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipment:
                        where['IsEquipment'] = param.Value;
                        break;
                    case ServiceItemFilters.Guarantor:
                        if (param.Value !== GuarantorId_) {
                            include.push({
                                model: this.Models.GuarantorSupplementary,
                                attributes: ['Id', 'ServiceItemId'],
                                required: false,
                                where: {
                                    'GuarantorId': param.Value
                                },
                                as: 'Supplementary'
                            });
                        }
                        break;
                    case ServiceItemFilters.IsOrderable:
                        where['IsOrderable'] = param.Value;
                        break;
                    case ServiceItemFilters.IsRateEditable:
                        where['IsRateEditable'] = param.Value;
                        break;
                    case ServiceItemFilters.IsZeroBill:
                        where['IsZeroBill'] = param.Value;
                        break;
                    case ServiceItemFilters.IsSurgicalProcedure:
                        where['IsSurgicalProcedure'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipmentHour:
                        where['IsEquipmentHour'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipmentDaily:
                        where['IsEquipmentDaily'] = param.Value;
                        break;
                    case ServiceItemFilters.IsBedChargeHour:
                        where['IsBedChargeHour'] = param.Value;
                        break;
                    case ServiceItemFilters.IsBedChargeDaily:
                        where['IsBedChargeDaily'] = param.Value;
                        break;
                    case ServiceItemFilters.IsNightCharge:
                        where['IsNightCharge'] = param.Value;
                        break;
                    case ServiceItemFilters.CanDiscountProportionate:
                        where['CanDiscountProportionate'] = param.Value;
                        break;
                    case ServiceItemFilters.IsInstrument:
                        where['IsInstrument'] = param.Value;
                        break;
                    case ServiceItemFilters.NameStartwith:
                        (where as any)['$or'] = [{ 'Name': { '$like': '' + (param.Value || '') + '%' } },
                        { 'ShortCode': { '$eq': param.Value } }];
                        break;
                    case ServiceItemFilters.IsPhysiotheraphy:
                        where['IsPhysiotheraphy'] = param.Value;
                        break;
                    case ServiceItemFilters.IsExecutableProcedure:
                        where['IsExecutableProcedure'] = param.Value;
                        break;
                    case ServiceItemFilters.ServiceRateCategory:
                        // serviceratecategoryid = param.Value;
                        serviceItemTariffDetailWhere['ServiceRateCategoryId'] = param.Value;
                        // isReqTariffDetails = true;
                        // serviceItemTariffDetailJoin['ServiceRateCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.IsVirtualService:
                        where['IsVirtualService'] = param.Value;
                        break;
                    case ServiceItemFilters.VirtualCategoryId:
                        where['VirtualCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.VirtualsubCategoryId:
                        where['VirtualsubCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case ServiceItemFilters.IncludeRate:
                        let info = param.Value;
                        include.push({
                            model: this.Models.ServiceItemTariffDetail,
                            where: {
                                'FacilityId': info.FacilityId
                            },
                            required: false,
                            include: [
                                {
                                    model: this.Models.ServiceRateCategory,
                                    attributes: ['ServiceRateCategory', 'Description'], required: false
                                }
                            ]
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push(serviceItemTariffDetailJoin);

        // include.push(ServiceItemAliasJoin);
        let ServiceItemRes: any = await this.FindAndCountAll(apiReq,
            { where: where, include: include, attributes: apiReq.Attributes });



        let HolidayTariffAmt = 0;
        try {
            if (this && this.Session && this.Session.FacilityId)
                HolidayTariffAmt = await this.GetHolidayTariff(this.Session.FacilityId);
            ServiceItemRes.Data.forEach((item: any) => {
                item.HolidayTariffAmt = 0;
                if (item.IsHolidayCharge && HolidayTariffAmt) {
                    item.HolidayTariffAmt = HolidayTariffAmt;
                    let HolidayPerAmt = HolidayTariffAmt / 100;
                    item.ServiceItemTariffDetails.forEach((tariffdetail: any) => {
                        if (tariffdetail && tariffdetail.Rate && tariffdetail.Rate > 0) {
                            tariffdetail.Rate =
                                Number(tariffdetail.Rate) + (tariffdetail.Rate * HolidayPerAmt);
                        }
                    });
                }
            });
        } catch (ex) { console.log(ex); }

        if (HolidayTariffAmt === 0) {
            let NightTariffAmt = 0;
            try {
                if (this && this.Session && this.Session.FacilityId)
                    NightTariffAmt = await this.GetNightTariff(this.Session.FacilityId);

                ServiceItemRes.Data.forEach((item: any) => {
                    item.NightTariffAmt = 0;
                    if (item.IsNightCharge && NightTariffAmt) {
                        item.NightTariffAmt = NightTariffAmt;
                        let NightPerAmt = NightTariffAmt / 100;
                        item.ServiceItemTariffDetails.forEach((tariffdetail: any) => {
                            if (tariffdetail && tariffdetail.Rate && tariffdetail.Rate > 0) {
                                tariffdetail.Rate =
                                    Number(tariffdetail.Rate) + (tariffdetail.Rate * NightPerAmt);
                            }
                        });
                    }
                });
            } catch (ex) { console.log(ex); }
        }

        return ServiceItemRes;
    }
    public async GetMinServiceItems(apiReq?: ApiRequest<ServiceItemFilters>): Promise<ApiResponse<ServiceItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let serviceItemTariffDetailWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], as: 'ParentCategory', required: false });
        // include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], as: 'SubCategory', required: false });
        // include.push({ model: this.Models.ServiceItemPackageMap, required: false });
        // include.push({ model: this.Models.GstMaster, required: false });
        // include.push({ model: this.Models.VirtualCategory, attributes: ['CategoryName'], required: false });
        // include.push({ model: this.Models.VirtualSubCategory, attributes: ['SubCategoryName'], required: false });
        // include.push(this.GetReference('ActiveStatus'));
        // include.push({ model: this.Models.ServiceGroup, attributes: ['ServiceGroupName'], required: false });
        // include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        // include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
        // let GuarantorId_ = 1000;
        // let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        // await guarantorBO.GetCurrentGuarantorId().then(function (result) {
        //     GuarantorId_ = result;
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceItemFilters.Code:
                        (where as any)['$or'] = [{ 'Name': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'ShortCode': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceItemFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case ServiceItemFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ServiceItemFilters.MasterItemId:
                        where['MasterItemId'] = param.Value;
                        break;
                    case ServiceItemFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.FacilityId:
                        include.push({
                            model: this.Models.Facility,
                            attributes: ['FacilityName'],
                            where: { 'FacilityId': param.Value }
                        });
                        break;
                    case ServiceItemFilters.MasterTypeId:
                        where['MasterTypeId'] = param.Value;
                        break;
                    case ServiceItemFilters.SubDepartmentId:
                        where['SubDepartmentId'] = param.Value;
                        break;
                    case ServiceItemFilters.MasterName:
                        (where as any)['$or'] = [{ 'MasterName': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceItemFilters.IsPackage:
                        where['IsPackage'] = param.Value;
                        break;
                    case ServiceItemFilters.IsSaveServiceDetails:
                        where['IsSaveServiceDetails'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipment:
                        where['IsEquipment'] = param.Value;
                        break;
                    // case ServiceItemFilters.Guarantor:
                    //     if (param.Value !== GuarantorId_) {
                    //         include.push({
                    //             model: this.Models.GuarantorSupplementary,
                    //             attributes: ['Id', 'ServiceItemId'],
                    //             required: false,
                    //             where: {
                    //                 'GuarantorId': param.Value
                    //             },
                    //             as: 'Supplementary'
                    //         });
                    //     }
                    //     break;
                    case ServiceItemFilters.IsOrderable:
                        where['IsOrderable'] = param.Value;
                        break;
                    case ServiceItemFilters.IsRateEditable:
                        where['IsRateEditable'] = param.Value;
                        break;
                    case ServiceItemFilters.IsZeroBill:
                        where['IsZeroBill'] = param.Value;
                        break;
                    case ServiceItemFilters.IsSurgicalProcedure:
                        where['IsSurgicalProcedure'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipmentHour:
                        where['IsEquipmentHour'] = param.Value;
                        break;
                    case ServiceItemFilters.IsEquipmentDaily:
                        where['IsEquipmentDaily'] = param.Value;
                        break;
                    case ServiceItemFilters.IsBedChargeHour:
                        where['IsBedChargeHour'] = param.Value;
                        break;
                    case ServiceItemFilters.IsBedChargeDaily:
                        where['IsBedChargeDaily'] = param.Value;
                        break;
                    case ServiceItemFilters.IsNightCharge:
                        where['IsNightCharge'] = param.Value;
                        break;
                    case ServiceItemFilters.CanDiscountProportionate:
                        where['CanDiscountProportionate'] = param.Value;
                        break;
                    case ServiceItemFilters.IsInstrument:
                        where['IsInstrument'] = param.Value;
                        break;
                    case ServiceItemFilters.NameStartwith:
                        (where as any)['$or'] = [{ 'Name': { '$like': '' + (param.Value || '') + '%' } },
                        { 'ShortCode': { '$eq': param.Value } }];
                        break;
                    case ServiceItemFilters.IsPhysiotheraphy:
                        where['IsPhysiotheraphy'] = param.Value;
                        break;
                    case ServiceItemFilters.IsExecutableProcedure:
                        where['IsExecutableProcedure'] = param.Value;
                        break;
                    case ServiceItemFilters.ServiceRateCategory:
                        // serviceratecategoryid = param.Value;
                        serviceItemTariffDetailWhere['ServiceRateCategoryId'] = param.Value;
                        // isReqTariffDetails = true;
                        // serviceItemTariffDetailJoin['ServiceRateCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.IsVirtualService:
                        where['IsVirtualService'] = param.Value;
                        break;
                    case ServiceItemFilters.VirtualCategoryId:
                        where['VirtualCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.VirtualsubCategoryId:
                        where['VirtualsubCategoryId'] = param.Value;
                        break;
                    case ServiceItemFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push(serviceItemTariffDetailJoin);
        // include.push({
        //     model: this.Models.ServiceItemTariffDetail,
        //     where: serviceItemTariffDetailWhere,
        //     required: false,
        //     include: [
        //         { model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory', 'Description'], required: false }
        //     ]
        // });
        // // include.push(ServiceItemAliasJoin);
        let ServiceItemRes: any = await this.FindAndCountAll(apiReq,
            { where: where, include: include, attributes: ['Id', 'IsDoctorDisplay'] });



        // let HolidayTariffAmt = 0;
        // try {
        //     if (this && this.Session && this.Session.FacilityId)
        //         HolidayTariffAmt = await this.GetHolidayTariff(this.Session.FacilityId);
        //     ServiceItemRes.Data.forEach((item: any) => {
        //         item.HolidayTariffAmt = 0;
        //         if (item.IsHolidayCharge && HolidayTariffAmt) {
        //             item.HolidayTariffAmt = HolidayTariffAmt;
        //             let HolidayPerAmt = HolidayTariffAmt / 100;
        //             item.ServiceItemTariffDetails.forEach((tariffdetail: any) => {
        //                 if (tariffdetail && tariffdetail.Rate && tariffdetail.Rate > 0) {
        //                     tariffdetail.Rate =
        //                         Number(tariffdetail.Rate) + (tariffdetail.Rate * HolidayPerAmt);
        //                 }
        //             });
        //         }
        //     });
        // } catch (ex) { console.log(ex); }

        // if (HolidayTariffAmt === 0) {
        //     let NightTariffAmt = 0;
        //     try {
        //         if (this && this.Session && this.Session.FacilityId)
        //             NightTariffAmt = await this.GetNightTariff(this.Session.FacilityId);

        //         ServiceItemRes.Data.forEach((item: any) => {
        //             item.NightTariffAmt = 0;
        //             if (item.IsNightCharge && NightTariffAmt) {
        //                 item.NightTariffAmt = NightTariffAmt;
        //                 let NightPerAmt = NightTariffAmt / 100;
        //                 item.ServiceItemTariffDetails.forEach((tariffdetail: any) => {
        //                     if (tariffdetail && tariffdetail.Rate && tariffdetail.Rate > 0) {
        //                         tariffdetail.Rate =
        //                             Number(tariffdetail.Rate) + (tariffdetail.Rate * NightPerAmt);
        //                     }
        //                 });
        //             }
        //         });
        //     } catch (ex) { console.log(ex); }
        // }

        return ServiceItemRes;
    }

    public async DeleteServiceItem(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ServiceItemInstance, ServiceItemAttributes> {
        return this.Models.ServiceItem;
    }

    public async MapFacilities(req: BaseRequest) {
        let mapbo = new MapBo((this.Models.ServiceItemFacilityMap as any), 'ServiceItemId', 'FacilityId', super.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo((this.Models.ServiceItemFacilityMap as any), 'ServiceItemId', 'FacilityId', super.Request);
        return await mapbo.GetMaps(apiReq);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ServiceItemFilters>): Promise<any> {
        if (key === 'Instruments') {
            apiReq.Params.push({ Key: ServiceItemFilters.IsInstrument, Value: true });
        }
        if (key === 'ProcedureTests') {
            apiReq.Params.push({ Key: ServiceItemFilters.IsExecutableProcedure, Value: true });
        }
        apiReq.Attributes = apiReq.Attributes;
        let val = await this.GetServiceItems(apiReq);
        return { [key]: val.Data };
    }
    public async PrintServiceItems(apiReq?: ApiRequest<ServiceItemFilters>): Promise<any> {
        let data = await this.GetServiceItems(apiReq);
        let ServiceItem = data.Data;
        let Department = apiReq.Data.Department;
        let Category = apiReq.Data.Category;
        let FacilityName = apiReq.Data.FacilityName;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let ServiceItemData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ServiceItemData.FacilityId);
        let info = {
            ServiceItem: ServiceItem,
            Preferences: printPreferencesData,
            Department: Department,
            Category: Category,
            FacilityName: FacilityName,
            ActiveStatus: ActiveStatus
        };
        let pdfOption: any = null;
        let key = 'packagedetailsreport';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintServiceItemsOp(apiReq?: ApiRequest<ServiceItemFilters>): Promise<any> {
        let data = await this.GetServiceItems(apiReq);
        let ServiceItem = data.Data;
        let Department = apiReq.Data.Department;
        let Category = apiReq.Data.Category;
        let SubCategory = apiReq.Data.SubCategory;
        let FacilityName = apiReq.Data.FacilityName;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let ServiceItemData = data.Data[0];
        let item: any = {};
        let ServiceOPDetails: any = [];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ServiceItemData.FacilityId);
        for (let idx in ServiceItem) {
            item = ServiceItem[idx];
            if (item.ServiceItemTariffDetails.length > 0) {
                item.Rate = item.ServiceItemTariffDetails[0].Rate;
            }
            ServiceOPDetails.push(item);
        }
        let info = {
            ServiceItem: ServiceItem,
            Preferences: printPreferencesData,
            Department: Department,
            Category: Category,
            FacilityName: FacilityName,
            ActiveStatus: ActiveStatus,
            ServiceOPDetails: ServiceOPDetails,
            SubCategory: SubCategory
        };
        let pdfOption: any = null;
        let key = 'opserviceitemreport';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintServiceItemsIP(apiReq?: ApiRequest<ServiceItemFilters>): Promise<any> {
        let data = await this.GetServiceItems(apiReq);
        let ServiceItem = data.Data;
        let Department = apiReq.Data.Department;
        let Category = apiReq.Data.Category;
        let SubCategory = apiReq.Data.SubCategory;
        let FacilityName = apiReq.Data.FacilityName;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let ServiceItemData = data.Data[0];
        let item: any = {};
        let ServiceOPDetails: any = [];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ServiceItemData.FacilityId);
        for (let idx in ServiceItem) {
            item = ServiceItem[idx];
            if (item.ServiceItemTariffDetails.length > 0) {
                item.Rate = item.ServiceItemTariffDetails[0].Rate;
            }
            ServiceOPDetails.push(item);
        }
        let info = {
            ServiceItem: ServiceItem,
            Preferences: printPreferencesData,
            Department: Department,
            Category: Category,
            FacilityName: FacilityName,
            ActiveStatus: ActiveStatus,
            ServiceOPDetails: ServiceOPDetails,
            SubCategory: SubCategory
        };
        let pdfOption: any = null;
        let key = 'ipserviceitemreport';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintServiceItemRateDetails(apiReq?: ApiRequest<ServiceItemFilters>): Promise<any> {
        let data = await this.GetServiceItems(apiReq);
        let ServiceItem = data.Data;
        let Department = apiReq.Data.Department;
        let Category = apiReq.Data.Category;
        let FacilityName = apiReq.Data.FacilityName;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let ServiceItemData = data.Data[0];
        // let item: any = {};
        let ServiceOPDetails: any = [];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ServiceItemData.FacilityId);
        let info = {
            ServiceItem: ServiceItem,
            Preferences: printPreferencesData,
            Department: Department,
            Category: Category,
            FacilityName: FacilityName,
            ActiveStatus: ActiveStatus,
            ServiceOPDetails: ServiceOPDetails,
        };
        let pdfOption: any = null;
        let key = 'serviceitemreport';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async AddServiceMasterExcel(req: BaseRequest): Promise<boolean> {
        let details: ServiceItemAttributes[] = req.Data || [];
        const filteredDetails: any[] = [];

        for (const DetailItem of details) {
            let codeduplicate = await this.FindAll({
                where: { ItemCode: DetailItem.ItemCode }
            });

            if (!codeduplicate || codeduplicate.length === 0) {
                filteredDetails.push(DetailItem);
            } else {
                console.warn('Duplicate ItemCode found: ' + DetailItem.ItemCode + '. Skipping this row.');
            }
        }

        if (filteredDetails.length === 0) {
            console.warn('No new items to insert.');
            return false; // No items to insert
        }

        let successCount = 0;

        await Promise.all(filteredDetails.map(async (DetailItem: any) => {
            try {
                await this.Save(DetailItem);
                successCount++;
            } catch (error) {
                console.error('Error saving detail:', DetailItem, error);
            }
        }));
        return successCount > 0;
    }

}
