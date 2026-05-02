import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { SystemExaminationInstance, SystemExaminationAttributes } from '../Model/Interface/Index';
import { SystemExaminationFilters } from '../Common/Filters.e';

export class SystemExaminationBo extends BaseBo<SystemExaminationInstance, SystemExaminationAttributes> implements IOptionProvider {
    public async AddSystemExamination(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateSystemExamination(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetSystemExaminationById(req: BaseRequest): Promise<SystemExaminationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetSystemExaminations(apiReq?: ApiRequest<SystemExaminationFilters>): Promise<ApiResponse<SystemExaminationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('SysExaminationType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case SystemExaminationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case SystemExaminationFilters.Code:
                        (where as any)['$or'] = [{ 'Name': { '$like': (param.Value || '') + '%' } },
                        { 'Code': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case SystemExaminationFilters.SysExaminationTypeId:
                        where['SysExaminationTypeId'] = param.Value;
                        break;
                    case SystemExaminationFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteSystemExamination(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<SystemExaminationInstance, SystemExaminationAttributes> {
        return this.Models.SystemExamination;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<SystemExaminationFilters>): Promise<any> {
        apiReq.Params = apiReq.Params || [];
        if (key === 'CVS') {
            apiReq.Params.push({ Key: SystemExaminationFilters.SysExaminationTypeId, Value: 1 },
                { Key: SystemExaminationFilters.ActiveStatusId, Value: 2 });
        } else if (key === 'RS') {
            apiReq.Params.push({ Key: SystemExaminationFilters.SysExaminationTypeId, Value: 2 },
                { Key: SystemExaminationFilters.ActiveStatusId, Value: 2 });
        } else if (key === 'Abdomen') {
            apiReq.Params.push({ Key: SystemExaminationFilters.SysExaminationTypeId, Value: 3 },
                { Key: SystemExaminationFilters.ActiveStatusId, Value: 2 });
        } else if (key === 'CNS') {
            apiReq.Params.push({ Key: SystemExaminationFilters.SysExaminationTypeId, Value: 4 },
                { Key: SystemExaminationFilters.ActiveStatusId, Value: 2 });
        } else if (key === 'FitForDonating') {
            apiReq.Params.push({ Key: SystemExaminationFilters.SysExaminationTypeId, Value: 5 },
                { Key: SystemExaminationFilters.ActiveStatusId, Value: 2 });
        } else if (key === 'Rejected') {
            apiReq.Params.push({ Key: SystemExaminationFilters.SysExaminationTypeId, Value: 6 },
                { Key: SystemExaminationFilters.ActiveStatusId, Value: 2 });
        }
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'],];
        let val = await this.GetSystemExaminations(apiReq);
        return { [key]: val.Data };

    }
}
