import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { SurgeryRoomMasterInstance, SurgeryRoomMasterAttributes } from '../Model/Interface/Index';
import { SurgeryRoomFilters } from '../Common/Filters.e';

export class SurgeryRoomMasterBo extends BaseBo<SurgeryRoomMasterInstance, SurgeryRoomMasterAttributes> implements IOptionProvider {
    public async AddSurgeryRoomMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateSurgeryRoomMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetSurgeryRoomMasterById(req: BaseRequest): Promise<SurgeryRoomMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetSurgeryRoomMasters(apiReq?: ApiRequest<SurgeryRoomFilters>):
        Promise<ApiResponse<SurgeryRoomMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('SurgeryRoomType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case SurgeryRoomFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case SurgeryRoomFilters.CodeName:
                        (where as any)[Op.or] = [{ Name: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Code: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case SurgeryRoomFilters.SurgeryRoomTypeId:
                        where['SurgeryRoomTypeId'] = param.Value;
                        break;
                    case SurgeryRoomFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteSurgeryRoomMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<SurgeryRoomFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Name', 'Code', 'SurgeryRoomTypeId'];
        let val = await this.GetSurgeryRoomMasters(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<SurgeryRoomMasterInstance, SurgeryRoomMasterAttributes> {
        return this.Models.SurgeryRoomMaster;
    }
}
