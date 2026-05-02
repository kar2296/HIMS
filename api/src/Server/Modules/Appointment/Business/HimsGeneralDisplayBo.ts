import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { GeneralDisplayInstance, GeneralDisplayAttributes } from '../Model/Interface/Index';
import { GeneraldisplayFilters } from '../Common/Filters.e';

export class GeneralDisplayBo extends BaseBo<GeneralDisplayInstance, GeneralDisplayAttributes> {
    public async AddGeneralDisplay(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGeneralDisplay(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetGeneralDisplayById(req: BaseRequest): Promise<GeneralDisplayAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetListofContents(req: BaseRequest): Promise<number[]> {
        let result: Array<number> = [];
        let response = await this.FindAll({
            where: {
                GeneralDisplayStatusId: 2,
                DisplayNoId: req.Id
            },
            attributes: ['Id']
        });
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            result.push(attribs.Id);
        });
        return result;
    }

    public async GetGeneralDisplays(apiReq?: ApiRequest<GeneraldisplayFilters>):
        Promise<ApiResponse<GeneralDisplayAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('LOCATION'));
        include.push(this.GetReference('DisplayNo'));
        include.push(this.GetReference('GeneralDisplayStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GeneraldisplayFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    // case GeneraldisplayFilters.Displaydate:
                    //     where['Displaydate'] = param.Value;
                    //     break;
                    case GeneraldisplayFilters.Displaydate:
                        where['Displaydate'] = { '$between': param.Value };
                        break;
                    case GeneraldisplayFilters.LOCATIONId:
                        where['LOCATIONId'] = param.Value;
                        break;
                    case GeneraldisplayFilters.DisplayNo:
                        where['DisplayNoId'] = param.Value;
                        break;
                    case GeneraldisplayFilters.GeneralDisplayStatus:
                        where['GeneralDisplayStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteGeneralDisplay(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GeneralDisplayInstance, GeneralDisplayAttributes> {
        return this.Models.GeneralDisplay;
    }
    public async GetOPDDashBoardInfo(req: BaseRequest): Promise<any> {
        let GeneralBoardCount = await this.Items.count({
            where: {
                'Status': 1,
                'GeneralDisplayStatusId': 2,
                'CreatedAt': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // 'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'GeneralBoardCount': GeneralBoardCount,
        };
    }
}
