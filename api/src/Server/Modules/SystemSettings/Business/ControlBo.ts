import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ControlInstance, ControlAttributes } from '../Model/Interface/Index';
import { ControlFilters } from '../Common/Filters.e';

export class ControlBo extends BaseBo<ControlInstance, ControlAttributes>  {
    public async AddControl(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateControl(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetControlById(req: BaseRequest): Promise<ControlAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetControls(apiReq?: ApiRequest<ControlFilters>): Promise<ApiResponse<ControlAttributes[]>> {
        let where: WhereOptions<any>= {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Control, as: 'ParentControl', required: false });
        // include.push({ model: this.Models.Control, attributes: ['ControlName'], required: false });
  apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ControlFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ControlFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ControlFilters.Context:
                        if (param.Value) {
                            include.push({
                                model: this.Models.Context,
                                where: { 'ContextName': param.Value }
                            });
                        }
                        break;
                    case ControlFilters.ApplyRoles:
                        if (param.Value) {
                            include.push({
                                model: this.Models.Role,
                                include: [
                                    {
                                        model: this.Models.Group,
                                        where: { 'GroupId': this.Session.UserGroupId }
                                    }
                                ]
                            });
                        }
                        break;
                    case ControlFilters.Display:
                        where['Display'] = { '$like': param.Value + '%' };
                        break;
                    case ControlFilters.ParentControlId:
                        where['ParentControlId'] = param.Value;
                        break;
                    case ControlFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['DisplayOrder', 'ASC']);
        return await this.FindAllItems(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteControl(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ControlFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Display', 'Text'],'Display'];
        let val = await this.GetControls(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ControlInstance, ControlAttributes> {
        return this.Models.Control;
    }

}
