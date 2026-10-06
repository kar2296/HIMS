import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TemplateMasterInstance, TemplateMasterAttributes } from '../Model/Interface/Index';
import { TemplateMasterFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../ClinicalMaster/Business/Index';

export class TemplateMasterBo extends BaseBo<TemplateMasterInstance, TemplateMasterAttributes> implements IOptionProvider {
    public async AddTemplateMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.TemplateMasterDetailBo, this.Request);
        let masterId = result.dataValues.Id;
        await detailBO.ManageDetails(masterId, req.Data.Details);
        return result.dataValues.Id;
    }

    public async UpdateTemplateMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.TemplateMasterDetailBo, this.Request);
        let masterId = req.Data.Header.Id;
        await detailBO.ManageDetails(masterId, req.Data.Details);
        return result;
    }

    public async GetTemplateMasterById(req: BaseRequest): Promise<TemplateMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTemplateMasters(apiReq?: ApiRequest<TemplateMasterFilters>): Promise<ApiResponse<TemplateMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.TemplateMasterDetail, required: false,
            // include: [{
            //     // model: this.Models.DrugMaster, required: false,
            //     include: this.GetReference('DurationPeriod')
            // }]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('TemplateType'));
        include.push(this.GetReference('AccessibleType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TemplateMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TemplateMasterFilters.Name:
                        where['Name'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case TemplateMasterFilters.TemplateType:
                        where['TemplateTypeId'] = param.Value;
                        break;
                    case TemplateMasterFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case TemplateMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case TemplateMasterFilters.User:
                        where['UserId'] = param.Value;
                        break;
                    case TemplateMasterFilters.AdminFav:
                        (where as any)['$or'] = [{ 'UserId': { '$eq': -1 } },
                        { 'UserId': { '$eq': null } }];
                        break;
                    case TemplateMasterFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case TemplateMasterFilters.AccessibleTypeId:
                        where['AccessibleTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteTemplateMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<TemplateMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Name', 'FacilityId',
            'DepartmentId', 'AccessibleTypeId', 'TemplateTypeId', 'UserId', 'ActiveStatusId'];
        let val = await this.GetTemplateMasters(apiReq);
        return { [key]: val.Data };
    }

    // public async GetOptions(key: string, apiReq?: ApiRequest<TemplateMasterFilters>): Promise<any> {
    //     apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'TemplateTypeId','FacilityId'];
    //     let val = await this.GetTemplateMasters(apiReq);
    //     return { [key]: val.Data };
    // }

    public GetModel(): SStatic.Model<TemplateMasterInstance, TemplateMasterAttributes> {
        return this.Models.TemplateMaster;
    }

}
