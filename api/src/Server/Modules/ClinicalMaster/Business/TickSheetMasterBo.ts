import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TickSheetMasterInstance, TickSheetMasterAttributes } from '../Model/Interface/Index';
import { TickSheetMasterFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../ClinicalMaster/Business/Index';

export class TickSheetMasterBo extends BaseBo<TickSheetMasterInstance, TickSheetMasterAttributes>  {
    public async AddTickSheetMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.TickSheetMasterDetailBo, this.Request);
        let masterId = result.dataValues.Id;
        await detailBO.ManageDetails(masterId, req.Data.Details);
        return result.dataValues.Id;
    }

    public async UpdateTickSheetMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.TickSheetMasterDetailBo, this.Request);
        let masterId = req.Data.Header.Id;
        await detailBO.ManageDetails(masterId, req.Data.Details);
        return result;
    }

    public async GetTickSheetMasterById(req: BaseRequest): Promise<TickSheetMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTickSheetMasters(apiReq?: ApiRequest<TickSheetMasterFilters>): Promise<ApiResponse<TickSheetMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let serviceratecategoryId = 11;
        // let additionalInfo: any = {};
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'ParentDepartment', required: false });
        include.push(this.GetReference('TickSheetType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('TickSheetMasterType'));
        include.push(this.GetReference('AccessibleType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TickSheetMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TickSheetMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case TickSheetMasterFilters.Name:
                        where['TickSheetName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case TickSheetMasterFilters.Department:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DepartmentId'] = { '$in': paramArr };
                        }
                        break;
                    case TickSheetMasterFilters.TickSheetType:
                        where['TickSheetTypeId'] = param.Value;
                        break;
                    case TickSheetMasterFilters.TickSheetMasterType:
                        where['TickSheetMasterTypeId'] = param.Value;
                        break;
                    case TickSheetMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case TickSheetMasterFilters.AdminTic:
                        (where as any)['$or'] = [{ 'DepartmentId': { '$eq': -1 } },
                        { 'DepartmentId': { '$eq': null } }];
                        break;
                    case TickSheetMasterFilters.AdditionalInfo:
                        // additionalInfo = param.Value;
                        serviceratecategoryId = param.Value;
                        break;
                    case TickSheetMasterFilters.PharmacyId:
                        storemasterId = param.Value;
                        break;
                    case TickSheetMasterFilters.AccessibleTypeId:
                        where['AccessibleTypeId'] = param.Value;
                        break;
                    case TickSheetMasterFilters.AllFacility:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.TickSheetMasterDetail, required: false,
            include: [
                {
                    model: this.Models.Testmaster, required: false,
                    include: [this.GetReference('TESTMASTERTYP'),
                    {
                        model: this.Models.ServiceItem,
                        attributes: ['Id', 'Name', 'ItemCode'],
                        required: false,
                        where: { 'MasterTypeId': 2 }, //TestMaster
                        include: [{
                            model: this.Models.ServiceItemTariffDetail,
                            attributes: ['Rate', 'DoctorShare'],
                            required: false,
                            where: { 'ServiceRateCategoryId': serviceratecategoryId }
                        }]
                    }
                    ]
                },

                { model: this.Models.DrugMaster, required: false, },
                this.GetReference('DurationPeriod'),
                {
                    model: this.Models.DietItemMaster, required: false, include: [
                        {
                            model: this.Models.ServiceItem,
                            attributes: ['Id', 'Name', 'ItemCode'],
                            required: false,
                            where: { 'MasterTypeId': 3 }, //DietItemMaster
                            include: [{
                                model: this.Models.ServiceItemTariffDetail,
                                attributes: ['ServiceRateCategoryId', 'Rate', 'DoctorShare'],
                                required: false,
                                // where: { 'ServiceRateCategoryId': info.ServiceRateCategoryId }
                            }]
                        }
                    ]
                },
                {
                    model: this.Models.ItemMaster, required: false,
                    include: [
                        { model: this.Models.UomMaster, as: 'SaleUom', required: false },
                        { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                        { model: this.Models.UomMaster, as: 'BaseUom', required: false },
                        {
                            model: this.Models.StockItem,
                            required: false,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': storemasterId }
                        }
                    ],
                },
                {
                    model: this.Models.ItemMaster, as: 'ItemStoreMaster',
                    attributes: ['Id', 'ItemMasterId', 'ItemCode', 'ItemName', 'MrPrice'],
                    required: false,
                    include: [
                        {
                            model: this.Models.StockItem,
                            required: false,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': storemasterId }
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, {
            where: where, include: include, attributes: apiReq.Attributes,
            order: [
                [this.Models.TickSheetMasterDetail, 'DisplayOrder', 'ASC']
            ]
        });
    }

    public async DeleteTickSheetMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TickSheetMasterInstance, TickSheetMasterAttributes> {
        return this.Models.TickSheetMaster;
    }

}
