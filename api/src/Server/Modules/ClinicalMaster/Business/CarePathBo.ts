import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CarePathInstance, CarePathAttributes } from '../Model/Interface/Index';
import { CarePathFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class CarePathBo extends BaseBo<CarePathInstance, CarePathAttributes> implements IOptionProvider {
    public async AddCarePath(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        //this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCarePath(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        console.log('UpdateCarePath  ' + JSON.stringify(req.Data));
        //this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetItemLogo(req: BaseRequest): Promise<any> {
        let result = await readFileSync(req.Data.FilePath);
        return new Buffer(result).toString('base64');
    }
    public async GetCarePathById(req: BaseRequest): Promise<CarePathAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCarePaths(apiReq?: ApiRequest<CarePathFilters>): Promise<ApiResponse<CarePathAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('CarePathType'));
        include.push({
            model: this.Models.Diagnosis, attributes: ['DiagnosisName'], required: false,
            include: [this.GetReference('DiagnosisVersion')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CarePathFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CarePathFilters.Name:
                        (where as any)['$or'] = [{ 'Name': { '$like': (param.Value || '') + '%' } },
                        { 'Code': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case CarePathFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case CarePathFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case CarePathFilters.CarePathTypeId:
                        where['CarePathTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCarePath(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CarePathFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Code'];
        let val = await this.GetCarePaths(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CarePathInstance, CarePathAttributes> {
        return this.Models.CarePath;
    }
}
