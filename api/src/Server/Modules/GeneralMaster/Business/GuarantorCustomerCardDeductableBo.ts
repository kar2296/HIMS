import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { GuarantorCustomerCardDeductableInstance, GuarantorCustomerCardDeductableAttributes } from '../Model/Interface/Index';
import { GuarantorCustomerCardDeductableFilters } from '../Common/Filters.e';

export class GuarantorCustomerCardDeductableBo extends BaseBo<GuarantorCustomerCardDeductableInstance,
    GuarantorCustomerCardDeductableAttributes>  {
    public async AddGuarantorCustomerCardDeductable(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        if (req.Data) {
            if (req.Data.length > 1) {
                return req.Data[0].GuarantorId;
            } else {
                let result = await this.Save(req.Data);
                return result.dataValues.Id;
            }
        }
        return 0;
    }

    public async UpdateGuarantorCustomerCardDeductable(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageGuarantorCustomerCardDeductable(GuarantorCustomerCardId: number,
        details: GuarantorCustomerCardDeductableAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.GuarantorCustomerCardId = GuarantorCustomerCardId;
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

    public async GetGuarantorCustomerCardDeductableById(req: BaseRequest): Promise<GuarantorCustomerCardDeductableAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGuarantorCustomerCardDeductables(apiReq?: ApiRequest<GuarantorCustomerCardDeductableFilters>):
        Promise<ApiResponse<GuarantorCustomerCardDeductableAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('DeductableLoad'));
        include.push({ model: this.Models.CardMaster, attributes: ['CardName'], required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case GuarantorCustomerCardDeductableFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case GuarantorCustomerCardDeductableFilters.GuarantorId:
                    where['GuarantorId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteGuarantorCustomerCardDeductable(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GuarantorCustomerCardDeductableInstance, GuarantorCustomerCardDeductableAttributes> {
        return this.Models.GuarantorCustomerCardDeductable;
    }
}
