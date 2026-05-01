import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { GuarantorCardTypeInstance, GuarantorCardTypeAttributes } from '../Model/Interface/Index';
import { GuarantorCardTypeFilters } from '../Common/Filters.e';
import * as generalMasterBO from '../../GeneralMaster/Business/Index';

export class GuarantorCardTypeBo extends BaseBo<GuarantorCardTypeInstance, GuarantorCardTypeAttributes> {
    public async AddGuarantorCardType(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        console.log(req.Data);
        if (req.Data) {
            if (req.Data.length > 0) {
                await this.ManageGuarantorCardType(req.Data);
                return req.Data[0].GuarantorId;
            }
        }
        return 0;
        // this.HandleActiveState(req.Data);
        // let result = true;
        // for(let idx in req.Data)
        //  await this.Save(req.Data[idx]);
        // await this.ManageGuarantorCardType(req.Data.);
        // return result;
    }

    public async UpdateGuarantorCardType(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        // await this.ManageGuarantorCardType(req.Data.Details);
        return result;
    }
    public async ManageGuarantorCardType(details: GuarantorCardTypeAttributes[])
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
    public async GetGuarantorCardTypeById(req: BaseRequest): Promise<GuarantorCardTypeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGuarantorCardTypes(apiReq?: ApiRequest<GuarantorCardTypeFilters>): Promise<ApiResponse<GuarantorCardTypeAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GuarantorCardTypeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GuarantorCardTypeFilters.TPAId:
                        where['TPAId'] = param.Value;
                        break;
                    case GuarantorCardTypeFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case GuarantorCardTypeFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteGuarantorCardType(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GuarantorCardTypeInstance, GuarantorCardTypeAttributes> {
        return this.Models.GuarantorCardType;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<GuarantorCardTypeFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'GuarantorId', 'CardMasterId', 'CardMasterTypeId',
            'Code', ['CardName', 'Text'], 'CardName', 'Description', 'ActiveStatusId', 'Rev'];
        let val = await this.GetGuarantorCardTypes(apiReq);
        return { [key]: val.Data };
    }

    public async GetSelfGuarantorCardType(): Promise<GuarantorCardTypeAttributes> {
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        let GuarantorId_ = 1000;
        await guarantorBO.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        let result = await this.GetById(GuarantorId_); //1000 is self GuarantorCardType primary id
        return this.GetAttribute(result);
    }
}
