import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../GeneralMaster/Business/Index';
import { GuarantorCustomerCardInstance, GuarantorCustomerCardAttributes } from '../Model/Interface/Index';
import { GuarantorCustomerCardFilters } from '../Common/Filters.e';

export class GuarantorCustomerCardBo extends BaseBo<GuarantorCustomerCardInstance, GuarantorCustomerCardAttributes> {
    public async AddGuarantorCustomerCard(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Save(req.Data.Header);
        if (result) {
            let guarantorDeductableBO = BoFactory.GetBo(bo.GuarantorCustomerCardDeductableBo, this.Request);
            let GuarantorCustomerCardId = result.dataValues.Id;
            await guarantorDeductableBO.ManageGuarantorCustomerCardDeductable(GuarantorCustomerCardId, req.Data.Details);

            return GuarantorCustomerCardId;
        }
        return 0;
    }

    public async UpdateGuarantorCustomerCard(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        if (result) {
            let guarantorDeductableBO = BoFactory.GetBo(bo.GuarantorCustomerCardDeductableBo, this.Request);
            let GuarantorCustomerCardId = req.Data.Header.Id;
            await guarantorDeductableBO.ManageGuarantorCustomerCardDeductable(GuarantorCustomerCardId, req.Data.Details);

            return GuarantorCustomerCardId;
        }
        return result;
    }

    public async GetGuarantorCustomerCardById(req: BaseRequest): Promise<GuarantorCustomerCardAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGuarantorCustomerCards(apiReq?: ApiRequest<GuarantorCustomerCardFilters>):
        Promise<ApiResponse<GuarantorCustomerCardAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('CardMasterType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GuarantorCustomerCardFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GuarantorCustomerCardFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case GuarantorCustomerCardFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Guarantor,
            required: true,
            include: [{ model: this.Models.GuarantorCardType, required: false }]
        });
        include.push({ model: this.Models.GuarantorCardType, required: true });
        include.push({ model: this.Models.GuarantorCustomer, required: true });
        include.push({ model: this.Models.GuarantorCustomerCardDeductable, required: true });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteGuarantorCustomerCard(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GuarantorCustomerCardInstance, GuarantorCustomerCardAttributes> {
        return this.Models.GuarantorCustomerCard;
    }
}
