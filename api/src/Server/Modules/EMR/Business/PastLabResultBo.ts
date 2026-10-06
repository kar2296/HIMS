import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PastLabResultInstance, PastLabResultAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../EMR/Business/Index';
import { PastLabResultFilters } from '../Common/Filters.e';

export class PastLabResultBo extends BaseBo<PastLabResultInstance, PastLabResultAttributes> implements IOptionProvider {
    public async AddPastLabResult(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PastLabResultDetailBo, this.Request);
        let ClinicalResultId = result.dataValues.Id;
        await detailBO.ManagePastLabResultDetails(ClinicalResultId, req.Data.Details);
        return ClinicalResultId;
    }

    public async UpdatePastLabResult(req: BaseRequest): Promise<boolean> {
        let ClinicalResultId = req.Data.Header.Id;
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PastLabResultDetailBo, this.Request);
        await detailBO.ManagePastLabResultDetails(ClinicalResultId, req.Data.Details);
        return result;
    }

    public async GetPastLabResultById(req: BaseRequest): Promise<PastLabResultAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPastLabResults(apiReq?: ApiRequest<PastLabResultFilters>): Promise<ApiResponse<PastLabResultAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('YesNo'));
        // include.push({
        //     model: this.Models.PastLabResultDetail,
        //     attributes: ['Reference'], required: false,
        //     });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PastLabResultFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PastLabResultFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;

                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePastLabResult(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PastLabResultFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetPastLabResults(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PastLabResultInstance, PastLabResultAttributes> {
        return this.Models.PastLabResult;
    }
}
