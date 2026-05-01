import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CssdGroupItemInstance, CssdGroupItemAttributes } from '../Model/Interface/Index';
import { CssdGroupItemFilters } from '../Common/Filters.e';

export class CssdGroupItemBo extends BaseBo<CssdGroupItemInstance, CssdGroupItemAttributes> implements IOptionProvider {
    public async AddCssdGroupItem(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCssdGroupItem(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCssdGroupItemById(req: BaseRequest): Promise<CssdGroupItemAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCssdGroupItems(apiReq?: ApiRequest<CssdGroupItemFilters>): Promise<ApiResponse<CssdGroupItemAttributes[]>> {
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
                    case CssdGroupItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CssdGroupItemFilters.Name:
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

    public async DeleteCssdGroupItem(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CssdGroupItemFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetCssdGroupItems(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CssdGroupItemInstance, CssdGroupItemAttributes> {
        return this.Models.CssdGroupItem;
    }
}
