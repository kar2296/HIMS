import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { IPPackageInstance, IPPackageAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../ClinicalMaster/Business/Index';
import { IPPackageFilters } from '../Common/Filters.e';

export class IPPackageBo extends BaseBo<IPPackageInstance, IPPackageAttributes>  {

    public async AddIPPackage(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        let IPPackageId = result.dataValues.Id;
        let detailBO = BoFactory.GetBo(bo.IPPackageDetailBo, this.Request);
        await detailBO.ManageIPPackageDetails(IPPackageId, req.Data.Details);
        return IPPackageId;
    }

    public async AddIPPackageByTariff(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        let IPPackageId = result.dataValues.Id;
        let detailBO = BoFactory.GetBo(bo.IPPackageTariffDetailBo, this.Request);
        await detailBO.ManageIPPackageTariffDetails(IPPackageId, req.Data.Details);
        return IPPackageId;
    }

    public async UpdateIPPackage(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.IPPackageDetailBo, this.Request);
        let IPPackageId = req.Data.Header.Id;
        await detailBO.ManageIPPackageDetails(IPPackageId, req.Data.Details);
        return result;
    }

    public async UpdateIPPackageByTariff(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.IPPackageTariffDetailBo, this.Request);
        let IPPackageId = req.Data.Header.Id;
        await detailBO.ManageIPPackageTariffDetails(IPPackageId, req.Data.Details);
        return result;
    }

    public async GetIPPackageById(req: BaseRequest): Promise<IPPackageAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetIPPackages(apiReq?: ApiRequest<IPPackageFilters>): Promise<ApiResponse<IPPackageAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.IPPackageDetail,
            required: false,
            include: [
                { model: this.Models.IPPackageServiceInclusion, required: false },
                { model: this.Models.IPPackageServiceExclusion, required: false }
            ]
        });
        include.push({
            model: this.Models.Guarantor,
            attributes: ['Id', 'GuarantorId', 'GuarantorName', 'GuarantorTypeId', 'TpaId'],
            include: [this.GetReference('GuarantorType')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push({
            model: this.Models.ServiceRateCategory,
            attributes: ['Id', 'ServiceRateCategory', 'Description'],
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case IPPackageFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case IPPackageFilters.PackageCode:
                        (where as any)['$or'] = [{ 'IPPackageCode': { '$like': (param.Value || '') + '%' } },
                        { 'IPPackageName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case IPPackageFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case IPPackageFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case IPPackageFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case IPPackageFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case IPPackageFilters.ActiveFrom:
                        where['ActiveFrom'] = where['ActiveFrom'] || {};
                        (where['ActiveFrom'] as any)['$gte'] = param.Value;
                        break;
                    case IPPackageFilters.ActiveTo:
                        where['ActiveTo'] = where['ActiveTo'] || {};
                        (where['ActiveTo'] as any)['$gte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetTariffIPPackages(apiReq?: ApiRequest<IPPackageFilters>): Promise<ApiResponse<IPPackageAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.IPPackageTariffDetail,
            required: false,
            include: [
                {
                    model: this.Models.IPPackageDetail, required: false,
                    include: [
                        { model: this.Models.IPPackageServiceInclusion, required: false },
                        { model: this.Models.IPPackageServiceExclusion, required: false }
                    ]
                },
            ]
        });
        // include.push({
        //     model: this.Models.Guarantor,
        //     attributes: ['Id', 'GuarantorId', 'GuarantorName', 'GuarantorTypeId', 'TpaId'],
        //     include: [this.GetReference('GuarantorType')]
        // });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        // include.push({
        //     model: this.Models.ServiceRateCategory,
        //     attributes: ['Id', 'ServiceRateCategory', 'Description'],
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case IPPackageFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case IPPackageFilters.PackageCode:
                        (where as any)['$or'] = [{ 'IPPackageCode': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'IPPackageName': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case IPPackageFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case IPPackageFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case IPPackageFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case IPPackageFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case IPPackageFilters.ActiveFrom:
                        where['ActiveFrom'] = where['ActiveFrom'] || {};
                        (where['ActiveFrom'] as any)['$gte'] = param.Value;
                        break;
                    case IPPackageFilters.ActiveTo:
                        where['ActiveTo'] = where['ActiveTo'] || {};
                        (where['ActiveTo'] as any)['$gte'] = param.Value;
                        break;
                    case IPPackageFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteIPPackage(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }


    public GetModel(): SStatic.Model<IPPackageInstance, IPPackageAttributes> {
        return this.Models.IPPackage;
    }

}
