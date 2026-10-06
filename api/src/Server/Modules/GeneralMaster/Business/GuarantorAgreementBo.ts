import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { GuarantorAgreementInstance, GuarantorAgreementAttributes } from '../Model/Interface/Index';
import { GuarantorAgreementFilters } from '../Common/Filters.e';

export class GuarantorAgreementBo extends BaseBo<GuarantorAgreementInstance, GuarantorAgreementAttributes>  {
    public async AddGuarantorAgreement(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        if (req.Data) {
            if (req.Data.length > 1) {
                await this.ManageGuarantorAgreement(req.Data);
                return req.Data[0].GuarantorId;
            } else {
                let result = await this.Save(req.Data);
                return result.dataValues.Id;
            }
        }
        return 0;
    }

    public async UpdateGuarantorAgreement(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        if (req.Data) {
            if (req.Data.length > 1) {
                await this.ManageGuarantorAgreement(req.Data);
                return req.Data[0].GuarantorId;
            } else {
                let result = await this.Update(req.Data);
                return result;
            }
        }
        return true;
    }

    public async ManageGuarantorAgreement(details: GuarantorAgreementAttributes[])
        : Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
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
    public async GetGuarantorAgreementById(req: BaseRequest): Promise<GuarantorAgreementAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGuarantorAgreements(apiReq?: ApiRequest<GuarantorAgreementFilters>):
        Promise<ApiResponse<GuarantorAgreementAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case GuarantorAgreementFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case GuarantorAgreementFilters.GuarantorId:
                    where['GuarantorId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeleteGuarantorAgreement(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GuarantorAgreementInstance, GuarantorAgreementAttributes> {
        return this.Models.GuarantorAgreement;
    }

}
