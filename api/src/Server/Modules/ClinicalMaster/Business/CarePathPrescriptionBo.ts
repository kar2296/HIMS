import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CarePathPrescriptionInstance, CarePathPrescriptionAttributes } from '../Model/Interface/Index';
import { CarePathPrescriptionFilters } from '../Common/Filters.e';

export class CarePathPrescriptionBo extends BaseBo<CarePathPrescriptionInstance,
    CarePathPrescriptionAttributes> implements IOptionProvider {
    public async AddCarePathPrescription(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCarePathPrescription(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCarePathPrescriptionById(req: BaseRequest): Promise<CarePathPrescriptionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCarePathPrescriptions(apiReq?: ApiRequest<CarePathPrescriptionFilters>):
        Promise<ApiResponse<CarePathPrescriptionAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.DrugMaster, attributes: ['DrugName'], required: false });
        include.push({ model: this.Models.GenericMaster, attributes: ['GenericName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('DrugRoute'));
        include.push({ model: this.Models.DrugFrequency, attributes: ['Name'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CarePathPrescriptionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CarePathPrescriptionFilters.CarePathId:
                        where['CarePathId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCarePathPrescription(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CarePathPrescriptionFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetCarePathPrescriptions(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CarePathPrescriptionInstance, CarePathPrescriptionAttributes> {
        return this.Models.CarePathPrescription;
    }
}
