import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ExaminationMasterInstance, ExaminationMasterAttributes } from '../Model/Interface/Index';
import { ExaminationMasterFilters } from '../Common/Filters.e';

export class ExaminationMasterBo extends BaseBo<ExaminationMasterInstance, ExaminationMasterAttributes> implements IOptionProvider {
    public async AddExaminationMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateExaminationMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetExaminationMasterById(req: BaseRequest): Promise<ExaminationMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetExaminationMasters(apiReq?: ApiRequest<ExaminationMasterFilters>):
        Promise<ApiResponse<ExaminationMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ExaminationMasterType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ExaminationMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ExaminationMasterFilters.Name:
                        (where as any)['$or'] = [{ 'Name': { '$like': (param.Value || '') + '%' } },
                        { 'Code': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case ExaminationMasterFilters.ExaminationMasterType:
                        where['ExaminationMasterTypeId'] = param.Value;
                        break;
                    case ExaminationMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteExaminationMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ExaminationMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Name'];
        let val = await this.GetExaminationMasters(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ExaminationMasterInstance, ExaminationMasterAttributes> {
        return this.Models.ExaminationMaster;
    }
}
