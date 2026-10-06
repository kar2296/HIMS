import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PrivilegeCardInstance, PrivilegeCardAttributes } from '../Model/Interface/Index';
import { PrivilegeCardFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as billingBO from '../../Billing/Business/Index';

export class PrivilegeCardBo extends BaseBo<PrivilegeCardInstance, PrivilegeCardAttributes> implements IOptionProvider {
    public async AddPrivilegeCard(req: BaseRequest): Promise<number> {
        // this.HandleActiveState(req.Data);
        // let patientId: number;
        // let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        // if (req.Data.IsNewPatient) {
        //     req.Data.Mobile = req.Data.MobileNo;
        //     patientId = await patientBO.AddPatient(req);
        //     req.Data.PatientId = patientId;
        // }
        // if (!req.Data.IsNewPatient) {
        //     await patientBO.UpdatePatient(req.Data);
        // }
        let result = await this.Save(req.Data.Header);
        let privilegecardId = result.dataValues.Id;
        if (result) {
            let detailBO = BoFactory.GetBo(billingBO.PrivilegeCardDetailBo, this.Request);
            await detailBO.ManagePrivilegeCardDetails(privilegecardId, req.Data.Details);
        }
        return result.dataValues.Id;
    }

    public async UpdatePrivilegeCard(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let privilegecardId = req.Data.Header.Id;
        if (result) {
            let detailBO = BoFactory.GetBo(billingBO.PrivilegeCardDetailBo, this.Request);
            await detailBO.ManagePrivilegeCardDetails(privilegecardId, req.Data.Details);
        }
        return result;
    }

    public async GetPrivilegeCardById(req: BaseRequest): Promise<PrivilegeCardAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPrivilegeCards(apiReq?: ApiRequest<PrivilegeCardFilters>): Promise<ApiResponse<PrivilegeCardAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('PromotionSchemeType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PrivilegeCardFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PrivilegeCardFilters.CardTypeId:
                        where['CardTypeId'] = param.Value;
                        break;
                    case PrivilegeCardFilters.ValidTo:
                        where['ValidTo'] = { '$between': param.Value };
                        break;
                    case PrivilegeCardFilters.From:
                        where['ValidTo'] = where['ValidTo'] || {};
                        (where['ValidTo'] as any)['$gte'] = param.Value;
                        break;
                    case PrivilegeCardFilters.To:
                        where['ValidTo'] = where['ValidTo'] || {};
                        (where['ValidTo'] as any)['$lte'] = param.Value;
                        break;
                    case PrivilegeCardFilters.CreatedFrom:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case PrivilegeCardFilters.CreatedTo:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case PrivilegeCardFilters.CardNo:
                        (where as any)['$or'] = [{ 'CardNo': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePrivilegeCard(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PrivilegeCardFilters>): Promise<any> {
        let val = await this.GetPrivilegeCards(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<PrivilegeCardInstance, PrivilegeCardAttributes> {
        return this.Models.PrivilegeCard;
    }
}
