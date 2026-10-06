import * as SStatic  from 'sequelize';
import {BaseBo, IOptionProvider} from '../../Base/Index';
import {WhereOptions, IncludeOptions} from '../../../Core/Index';
import {BaseRequest, ApiRequest, ApiResponse} from '../../../Common/Index';
import { AttachmentTypeInstance, AttachmentTypeAttributes} from '../Model/Interface/Index';
import { AttachmentTypeFilters } from '../Common/Filters.e';

export class AttachmentTypeBo extends BaseBo<AttachmentTypeInstance, AttachmentTypeAttributes> implements IOptionProvider {
    public async AddAttachmentType(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAttachmentType(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAttachmentTypeById(req: BaseRequest): Promise<AttachmentTypeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAttachmentTypes(apiReq?: ApiRequest<AttachmentTypeFilters>): Promise<ApiResponse<AttachmentTypeAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if(this.IsValidParam(param)) {
                switch (param.Key) {
                    case AttachmentTypeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AttachmentTypeFilters.Name:
                        where['Name'] = { '$like': (param.Value || '') + '%'};
                        break;
                    case AttachmentTypeFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case AttachmentTypeFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAttachmentType(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AttachmentTypeFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Name', 'Description'];
        let val = await this.GetAttachmentTypes(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<AttachmentTypeInstance, AttachmentTypeAttributes> {
        return this.Models.AttachmentType;
    }
}
