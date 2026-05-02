import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PastLabResultDetailInstance, PastLabResultDetailAttributes } from '../Model/Interface/Index';
import { PastLabResultDetailFilters } from '../Common/Filters.e';

export class PastLabResultDetailBo extends BaseBo<PastLabResultDetailInstance, PastLabResultDetailAttributes> implements IOptionProvider {
    public async AddPastLabResultDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePastLabResultDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
     public async ManagePastLabResultDetails(ClinicalResultId: number, details: PastLabResultDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ClinicalResultId = ClinicalResultId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }
    public async GetPastLabResultDetailById(req: BaseRequest): Promise<PastLabResultDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPastLabResultDetails(apiReq?: ApiRequest<PastLabResultDetailFilters>)
        : Promise<ApiResponse<PastLabResultDetailAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        // include.push(this.GetReference('AllergyType'));
        // include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PastLabResultDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PastLabResultDetailFilters.ClinicalResultId:
                        where['ClinicalResultId'] = param.Value;
                        break;
                    case PastLabResultDetailFilters.TestId:
                        where['TestId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePastLabResultDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PastLabResultDetailFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetPastLabResultDetails(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PastLabResultDetailInstance, PastLabResultDetailAttributes> {
        return this.Models.PastLabResultDetail;
    }
}
