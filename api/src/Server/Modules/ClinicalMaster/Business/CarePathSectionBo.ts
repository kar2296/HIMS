import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CarePathSectionInstance, CarePathSectionAttributes } from '../Model/Interface/Index';
import { CarePathSectionFilters } from '../Common/Filters.e';

export class CarePathSectionBo extends BaseBo<CarePathSectionInstance, CarePathSectionAttributes> implements IOptionProvider {
    public async AddCarePathSection(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCarePathSection(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCarePathSectionById(req: BaseRequest): Promise<CarePathSectionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCarePathSections(apiReq?: ApiRequest<CarePathSectionFilters>):
        Promise<ApiResponse<CarePathSectionAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
         include.push({ model: this.Models.SectionMaster, attributes: ['Name'], required: false });
        include.push(this.GetReference('ActiveStatus'));
         include.push(this.GetReference('SectionType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CarePathSectionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CarePathSectionFilters.CarePathId:
                        where['CarePathId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCarePathSection(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CarePathSectionFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetCarePathSections(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CarePathSectionInstance, CarePathSectionAttributes> {
        return this.Models.CarePathSection;
    }
}
