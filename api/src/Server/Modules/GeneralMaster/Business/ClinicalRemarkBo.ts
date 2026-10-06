import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ClinicalRemarkInstance, ClinicalRemarkAttributes } from '../Model/Interface/Index';
import { ClinicalRemarkFilters } from '../Common/Filters.e';

export class ClinicalRemarkBo extends BaseBo<ClinicalRemarkInstance, ClinicalRemarkAttributes> implements IOptionProvider {
    public async AddClinicalRemark(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateClinicalRemark(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetClinicalRemarkById(req: BaseRequest): Promise<ClinicalRemarkAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetClinicalRemarks(apiReq?: ApiRequest<ClinicalRemarkFilters>): Promise<ApiResponse<ClinicalRemarkAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ClinicalRemarkType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ClinicalRemarkFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ClinicalRemarkFilters.Remarks:
                        where['ClinicalRemarks'] = param.Value;
                        break;
                    case ClinicalRemarkFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case ClinicalRemarkFilters.RemarkType:
                        where['ClinicalRemarkTypeId'] = param.Value;
                        break;
                    case ClinicalRemarkFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteClinicalRemark(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ClinicalRemarkInstance, ClinicalRemarkAttributes> {
        return this.Models.ClinicalRemark;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ClinicalRemarkFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ClinicalRemarks', 'Text'], 'ClinicalRemarks', 'Code'];
        let val = await this.GetClinicalRemarks(apiReq);
        return { [key]: val.Data };
    }
}
