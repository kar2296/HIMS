import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PMRInstance, PMRAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { PMRFilters } from '../Common/Filters.e';

export class PMRBo extends BaseBo<PMRInstance, PMRAttributes> implements IOptionProvider {
    public async AddPMR(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PMRDetailBo, this.Request);
        let PMRId = result.dataValues.Id;
        await detailBO.ManagePMRDetail(PMRId, req.Data.Details);
        return PMRId;
    }

    public async UpdatePMR(req: BaseRequest): Promise<boolean> {
        let PMRId = req.Data.Header.Id;
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PMRDetailBo, this.Request);
        await detailBO.ManagePMRDetail(PMRId, req.Data.Details);
        return result;
    }

    public async GetPMRById(req: BaseRequest): Promise<PMRAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPMRProcedures(apiReq?: ApiRequest<PMRFilters>):
        Promise<ApiResponse<PMRAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PMRFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PMRFilters.PMR:
                        (where as any)[Op.or] = [{ PMRCode : { [Op.like]: (param.Value || '') + '%' } },
                        { PMRName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case PMRFilters.PMRCategoryId:
                        where['PMRCategoryId'] = param.Value;
                        break;
                    case PMRFilters.ProcedureId:
                        where['ProcedureId'] = param.Value;
                        break;
                    case PMRFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case PMRFilters.Procedure:
                        (where as any)[Op.or] = [{ 'ProcedureCode': { '$like': (param.Value || '') + '%' } },
                        { 'ProcedureName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPMRs(apiReq?: ApiRequest<PMRFilters>):
        Promise<ApiResponse<PMRAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('PMRCategory'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.Procedure, required: false });
        include.push({ model: this.Models.Speciality, required: false });
        include.push({
            model: this.Models.PMRDetail,
            required: false,
            include: [
                { model: this.Models.ItemMaster, required: true },
                { model: this.Models.ItemCategory, required: false },
                { model: this.Models.ItemSubCategory, required: false },
                { model: this.Models.ProductType, required: false },
                { model: this.Models.ProductSubType, required: false }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PMRFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PMRFilters.PMR:
                        (where as any)[Op.or] = [{ PMRCode: { [Op.like]: (param.Value || '') + '%' } },
                        { PMRName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case PMRFilters.PMRCategoryId:
                        where['PMRCategoryId'] = param.Value;
                        break;
                    case PMRFilters.ProcedureId:
                        where['ProcedureId'] = param.Value;
                        break;
                    case PMRFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case PMRFilters.Procedure:
                        (where as any)[Op.or] = [{ ProcedureCode: { [Op.like]: (param.Value || '') + '%' } },
                        { ProcedureName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case PMRFilters.SpecialityId:
                        where['SpecialityId'] = param.Value;
                        break;
                    case PMRFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPMRItems(apiReq?: ApiRequest<PMRFilters>):
        Promise<ApiResponse<PMRAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        //let guarantorsearchid = -1;
        let currentdate = null;
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('PMRCategory'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.Procedure, required: false });
        include.push({ model: this.Models.Speciality, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PMRFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PMRFilters.PMR:
                        (where as any)[Op.or] = [{ PMRCode: { [Op.like]: (param.Value || '') + '%' } },
                        { PMRName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case PMRFilters.PMRCategoryId:
                        where['PMRCategoryId'] = param.Value;
                        break;
                    case PMRFilters.ProcedureId:
                        where['ProcedureId'] = param.Value;
                        break;
                    case PMRFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case PMRFilters.Procedure:
                        (where as any)[Op.or] = [{ ProcedureCode : { [Op.like]: (param.Value || '') + '%' } },
                        { ProcedureName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case PMRFilters.StoreMasterId:
                        storemasterId = param.Value;
                        break;
                    case PMRFilters.CurrentDate:
                        currentdate = param.Value;
                        break;
                    case PMRFilters.SpecialityId:
                        where['SpecialityId'] = param.Value;
                        break;
                    case PMRFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.PMRDetail,
            required: false,
            include: [
                {
                    model: this.Models.ItemMaster,
                    required: true,
                    include: [
                        {
                            model: this.Models.StockItem,
                            required: false,
                            where: { 'StoreMasterId': storemasterId },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: false,
                                    where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePMR(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<PMRFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['PMRName', 'Text'], 'PMRName',
            'ActiveStatusId', 'SpecialityId', 'FacilityId', 'PMRCategoryId', 'ProcedureId', 'ProcedureCode',
            'ProcedureName', 'ApprovedAt', 'ApprovedBy', 'UpdatedBy', 'UpdatedAt', 'CreatedBy', 'CreatedAt', 'IsActive'];
        let val = await this.GetPMRs(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<PMRInstance, PMRAttributes> {
        return this.Models.PMR;
    }
}
