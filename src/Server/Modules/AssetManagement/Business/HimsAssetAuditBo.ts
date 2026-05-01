import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AssetAuditInstance, AssetAuditAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from './Index';
import { AssetAuditFilters } from '../Common/Filters.e';

export class AssetAuditBo extends BaseBo<AssetAuditInstance, AssetAuditAttributes> implements IOptionProvider {
    public async AddAssetAudit(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data.Header);
        let auditId = result.dataValues.Id;
        let detailBO = BoFactory.GetBo(bo.AssetAuditDetailBo, this.Request);
        await detailBO.ManageDetails(auditId, req.Data.Details);
        return result.dataValues.Id;
    }

    public async UpdateAssetAudit(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.AssetAuditDetailBo, this.Request);
        let auditId = req.Data.Header.Id;
        await detailBO.ManageDetails(auditId, req.Data.Details);
        return result;
    }

    public async GetAssetAuditById(req: BaseRequest): Promise<AssetAuditAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssetAudits(apiReq?: ApiRequest<AssetAuditFilters>): Promise<ApiResponse<AssetAuditAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuditName', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('LOCATION'));
        include.push(this.GetReference('AuditStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssetAuditFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssetAuditFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case AssetAuditFilters.LOCATIONId:
                        where['LOCATIONId'] = param.Value;
                        break;
                    case AssetAuditFilters.StartDate:
                        where['StartDate'] = param.Value;
                        break;
                    case AssetAuditFilters.AuditName:
                        where['AuditNameId'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case AssetAuditFilters.AuditStatusId:
                        where['AuditStatusId'] = param.Value;
                        break;
                    case AssetAuditFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case AssetAuditFilters.From:
                        where['StartDate'] = where['StartDate'] || {};
                        (where['StartDate'] as any)['$gte'] = param.Value;
                        break;
                    case AssetAuditFilters.To:
                        where['StartDate'] = where['StartDate'] || {};
                        (where['StartDate'] as any)['$lte'] = param.Value;
                        break;
                    case AssetAuditFilters.AuditNameId:
                        where['AuditNameId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteAssetAudit(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<AssetAuditFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetAssetAudits(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<AssetAuditInstance, AssetAuditAttributes> {
        return this.Models.AssetAudit;
    }
    public async GetAssetInfoDashBoard(req: BaseRequest): Promise<any> {
        /* Without Orders group by Subdeptarment */
        let AssetAuditCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });

        return {
            'AssetAuditCount': AssetAuditCount
        };

    }
}
