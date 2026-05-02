import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { RoomTypeMasterInstance, RoomTypeMasterAttributes } from '../Model/Interface/Index';
import { RoomTypeMasterFilters } from '../Common/Filters.e';

export class RoomTypeMasterBo extends BaseBo<RoomTypeMasterInstance, RoomTypeMasterAttributes> implements IOptionProvider {
    public async AddRoomTypeMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateRoomTypeMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetRoomTypeMasterById(req: BaseRequest): Promise<RoomTypeMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRoomTypeMasters(apiReq?: ApiRequest<RoomTypeMasterFilters>): Promise<ApiResponse<RoomTypeMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('RoomClassificationType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case RoomTypeMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case RoomTypeMasterFilters.RoomTypeName:
                        (where as any)[Op.or] = [{ RoomTypeName: { [Op.like]: (param.Value || '') + '%' } },
                        { Code: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case RoomTypeMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case RoomTypeMasterFilters.ServiceRateCategoryId:
                        where['ServiceRateCategoryId'] = param.Value;
                        break;
                    case RoomTypeMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteRoomTypeMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<RoomTypeMasterInstance, RoomTypeMasterAttributes> {
        return this.Models.RoomTypeMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<RoomTypeMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['RoomTypeName', 'Text'], 'RoomTypeName'];
        let val = await this.GetRoomTypeMasters(apiReq);
        return { [key]: val.Data };
    }
}
