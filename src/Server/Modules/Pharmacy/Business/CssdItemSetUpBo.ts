import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CssdItemSetUpInstance, CssdItemSetUpAttributes } from '../Model/Interface/Index';
import { CssdItemSetUpFilters } from '../Common/Filters.e';

export class CssdItemSetUpBo extends BaseBo<CssdItemSetUpInstance, CssdItemSetUpAttributes> implements IOptionProvider {
    public async AddCssdItemSetUp(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCssdItemSetUp(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCssdItemSetUpById(req: BaseRequest): Promise<CssdItemSetUpAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCssdItemSetUps(apiReq?: ApiRequest<CssdItemSetUpFilters>): Promise<ApiResponse<CssdItemSetUpAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        // include.push({
        //     model: this.Models.Diagnosis, attributes: ['DiagnosisName'], required: false,
        //     include: [this.GetReference('DiagnosisVersion')]
        // });
        // include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        // include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CssdItemSetUpFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CssdItemSetUpFilters.Name:
                        (where as any)[Op.or] = [{ ItemName: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCssdItemSetUp(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CssdItemSetUpFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetCssdItemSetUps(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CssdItemSetUpInstance, CssdItemSetUpAttributes> {
        return this.Models.CssdItemSetUp;
    }
}
