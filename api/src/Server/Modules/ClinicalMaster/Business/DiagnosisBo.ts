import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DiagnosisInstance, DiagnosisAttributes } from '../Model/Interface/Index';
import { DiagnosisFilters } from '../Common/Filters.e';
import { SNOMEDCTBo } from '../../LIS/Business/SNOMEDCTBo';

export class DiagnosisBo extends BaseBo<DiagnosisInstance, DiagnosisAttributes> implements IOptionProvider {
    public async AddDiagnosis(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDiagnosis(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDiagnosisById(req: BaseRequest): Promise<DiagnosisAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDiagnosiss(apiReq?: ApiRequest<DiagnosisFilters>): Promise<ApiResponse<DiagnosisAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DiagnosisVersion'));
        include.push(this.GetReference('DiagnosisCategory'));
        include.push(this.GetReference('DiagnosisType'));
        include.push(this.GetReference('Side'));
        include.push(this.GetReference('Grade'));
        include.push(this.GetReference('TestMasterPosition'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DiagnosisFilters.Id:
                        where['Id'] = param.Value;
                        break;

                    case DiagnosisFilters.Code:
                        (where as any)['$or'] = [{ 'DiagnosisName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Code': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case DiagnosisFilters.DiagnosisCodeScheme:
                        where['DiagnosisCodeSchemeId'] = param.Value;
                        break;
                    case DiagnosisFilters.DiagnosisVersion:
                        where['DiagnosisVersionId'] = param.Value;
                        break;
                    case DiagnosisFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case DiagnosisFilters.TypeId:
                        where['TypeId'] = param.Value;
                        break;
                    case DiagnosisFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case DiagnosisFilters.GenderId:
                        where['GenderId'] = param.Value;
                        break;
                    case DiagnosisFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case DiagnosisFilters.AgeFrom:
                        where['AgeFrom'] = where['AgeFrom'] || {};
                        (where['AgeFrom'] as any)['$gte'] = param.Value;
                        break;
                    case DiagnosisFilters.AgeTo:
                        where['AgeTo'] = where['AgeTo'] || {};
                        (where['AgeTo'] as any)['$lte'] = param.Value;
                        break;
                    case DiagnosisFilters.NoDept:
                        where['DepartmentId'] = null;
                        break;
                    case DiagnosisFilters.IsActive:
                        where['IsActive'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDiagnosis(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DiagnosisInstance, DiagnosisAttributes> {
        return this.Models.Diagnosis;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DiagnosisFilters>): Promise<any> {
        apiReq.Params = apiReq.Params || [];
        if (key === 'EyeDiagnosis') {
            apiReq.Params.push({ Key: DiagnosisFilters.TypeId, Value: 1 },
                { Key: DiagnosisFilters.ActiveStatus, Value: 2 });
        }
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DiagnosisName', 'Text'], 'DiagnosisName', ['Code', 'Code'], 'Description'];
        let val = await this.GetDiagnosiss(apiReq);
        return { [key]: val.Data };
    }

    public async GetSNOMEDCT(apiReq?: ApiRequest<any>): Promise<Boolean> {
        return await SNOMEDCTBo.GetSNOMEDCT(apiReq);
    }

    public async GetSNOMEDCTByConceptId(apiReq?: ApiRequest<any>): Promise<Boolean> {
        return await SNOMEDCTBo.GetSNOMEDCTByConceptId(apiReq);
    }
}
