import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TickSheetInstance, TickSheetAttributes } from '../Model/Interface/Index';
import { TickSheetFilters } from '../Common/Filters.e';

export class TickSheetBo extends BaseBo<TickSheetInstance, TickSheetAttributes>  {
    public async AddTickSheet(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTickSheet(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetTickSheetById(req: BaseRequest): Promise<TickSheetAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTickSheets(apiReq?: ApiRequest<TickSheetFilters>): Promise<ApiResponse<TickSheetAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'],as :'ParentDepartment', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'],as :'SubDepartment', required: false });
        include.push(this.GetReference('TickSheetType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('TickSheetMasterType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TickSheetFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TickSheetFilters.Name:
                        where['TickSheetName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case TickSheetFilters.Department:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DepartmentId'] = { '$in': paramArr };
                        }
                        break;
                    case TickSheetFilters.TickSheetType:
                        where['TickSheetTypeId'] = param.Value;
                        break;
                    case TickSheetFilters.TickSheetMasterType:
                        where['TickSheetMasterTypeId'] = param.Value;
                        break;
                    case TickSheetFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case TickSheetFilters.AdminTic:
                        (where as any)['$or'] = [{ 'DepartmentId': { '$eq': -1 } },
                                        { 'DepartmentId': { '$eq': null } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTickSheet(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TickSheetInstance, TickSheetAttributes> {
        return this.Models.TickSheet;
    }

}
