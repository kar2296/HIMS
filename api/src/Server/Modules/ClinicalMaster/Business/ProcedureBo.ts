import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ProcedureInstance, ProcedureAttributes } from '../Model/Interface/Index';
import { ProcedureFilters } from '../Common/Filters.e';

export class ProcedureBo extends BaseBo<ProcedureInstance, ProcedureAttributes> {
    public async AddProcedure(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProcedure(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetProcedureById(req: BaseRequest): Promise<ProcedureAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetProcedures(apiReq?: ApiRequest<ProcedureFilters>): Promise<ApiResponse<ProcedureAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], as: 'Department', required: false });
        include.push(this.GetReference('ProcedureVersion'));
        include.push(this.GetReference('ProcedureType'));
        include.push(this.GetReference('ProcedureCategory'));
        include.push(this.GetReference('ProcedureSubCategory'));
        include.push(this.GetReference('ProcedureTechnique'));
        include.push(this.GetReference('ProcedureOperationType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProcedureFilters.Id:
                        where['Id'] = param.Value;
                        break;

                    case ProcedureFilters.Code:
                        (where as any)['$or'] = [{ 'ProcedureName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Code': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ProcedureFilters.ProcedureCodeScheme:
                        where['ProcedureCodeSchemeId'] = param.Value;
                        break;
                    case ProcedureFilters.ProcedureType:
                        where['ProcedureTypeId'] = param.Value;
                        break;
                    case ProcedureFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ProcedureFilters.ProcedureCategoryId:
                        where['ProcedureCategoryId'] = param.Value;
                        break;
                    case ProcedureFilters.Speciality:
                        where['Speciality'] = param.Value;
                        break;
                    case ProcedureFilters.IsCathlabProcedures:
                        where['IsCathlabProcedures'] = param.Value;
                        break;
                    case ProcedureFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeleteProcedure(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ProcedureInstance, ProcedureAttributes> {
        return this.Models.Procedure;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ProcedureFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ProcedureName', 'Text'], 'ProcedureName', 'Code', 'Description',
            'ProcedureTypeId'];
        let val = await this.GetProcedures(apiReq);
        return { [key]: val.Data };
    }
}
