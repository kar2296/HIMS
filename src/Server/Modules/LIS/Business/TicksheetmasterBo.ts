import * as SStatic  from 'sequelize';
import {BaseBo} from '../../Base/Index';
import {WhereOptions,IncludeOptions} from '../../../Core/Index';
import { BaseRequest, ApiRequest,ApiResponse } from '../../../Common/Index';
import { TicksheetmasterInstance, TicksheetmasterAttributes} from '../Model/Interface/Index';
import { TicksheetFilters } from '../Common/Filters.e';

export class TicksheetmasterBo extends BaseBo<TicksheetmasterInstance, TicksheetmasterAttributes> {
    public async AddTicksheetmaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTicksheetmaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetTicksheetmasterById(req: BaseRequest): Promise<TicksheetmasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTicksheetmasters(apiReq?: ApiRequest<TicksheetFilters>): Promise<ApiResponse<TicksheetmasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('TicksheetType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Department, as:'Department', attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Department, as:'SubDepartment', attributes: ['DepartmentName'], required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case TicksheetFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case TicksheetFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case TicksheetFilters.status:
                    where['ActiveStatusId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTicksheetmaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TicksheetmasterInstance, TicksheetmasterAttributes> {
        return this.Models.Ticksheetmaster;
    }
}
