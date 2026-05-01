import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { RemarkInstance, RemarkAttributes } from '../Model/Interface/Index';
import { RemarkFilters } from '../Common/Filters.e';

export class RemarkBo extends BaseBo<RemarkInstance, RemarkAttributes> implements IOptionProvider {
    public async AddRemark(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateRemark(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetRemarkById(req: BaseRequest): Promise<RemarkAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRemarks(apiReq?: ApiRequest<RemarkFilters>): Promise<ApiResponse<RemarkAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Screen, attributes: ['ScreenName'], required: false });
        include.push(this.GetReference('RemarkType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case RemarkFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case RemarkFilters.Name:
                        (where as any)[Op.or] = [{ Remarks: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case RemarkFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case RemarkFilters.RemarkType:
                        where['RemarkTypeId'] = param.Value;
                        break;
                    case RemarkFilters.Screen:
                        where['ScreenId'] = param.Value;
                        break;
                    case RemarkFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteRemark(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<RemarkInstance, RemarkAttributes> {
        return this.Models.Remark;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<RemarkFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Remarks', 'Text'], 'Remarks', 'Code'];
        let val = await this.GetRemarks(apiReq);
        return { [key]: val.Data };
    }
}
