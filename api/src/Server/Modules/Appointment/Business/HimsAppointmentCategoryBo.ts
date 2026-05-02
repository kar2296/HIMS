import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { AppointmentCategoryInstance, AppointmentCategoryAttributes } from '../Model/Interface/Index';
import { AppointmentCategoryFilters } from '../Common/Filters.e';

export class AppointmentCategoryBo extends BaseBo<AppointmentCategoryInstance, AppointmentCategoryAttributes>
    implements IOptionProvider {

    public async AddAppointmentCategory(req: BaseRequest): Promise<number> {
        //req.Data.ActiveStatusId = await this.ResolveReference('ActiveStatus', req.Data.ActiveStatus);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAppointmentCategory(req: BaseRequest): Promise<boolean> {
        //req.Data.ActiveStatusId = await this.ResolveReference('ActiveStatus', req.Data.ActiveStatus);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAppointmentCategoryById(req: BaseRequest): Promise<AppointmentCategoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAppointmentCategorys(apiReq?: ApiRequest<AppointmentCategoryFilters>):
     Promise<ApiResponse<AppointmentCategoryAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('AppointmentCategoryType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AppointmentCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AppointmentCategoryFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case AppointmentCategoryFilters.AppointmentCategoryType:
                        where['AppointmentCategoryTypeId'] = param.Value;
                        break;
                    case AppointmentCategoryFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAppointmentCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AppointmentCategoryInstance, AppointmentCategoryAttributes> {
        return this.Models.AppointmentCategory;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AppointmentCategoryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Name', 'Color'];
        let val = await this.GetAppointmentCategorys(apiReq);
        return { [key]: val.Data };
    }
}
