import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ServiceItemPerformingDoctorInstance, ServiceItemPerformingDoctorAttributes } from '../Model/Interface/Index';
import { ServiceItemPerformingDoctorFilters } from '../Common/Filters.e';

export class ServiceItemPerformingDoctorBo extends BaseBo<ServiceItemPerformingDoctorInstance, ServiceItemPerformingDoctorAttributes>  {
    public async AddServiceItemPerformingDoctor(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateServiceItemPerformingDoctor(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageServiceItemPerformingDoctor(req: BaseRequest): Promise<boolean> {
        let list: ServiceItemPerformingDoctorAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetServiceItemPerformingDoctorById(req: BaseRequest): Promise<ServiceItemPerformingDoctorAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetServiceItemPerformingDoctors(apiReq?: ApiRequest<ServiceItemPerformingDoctorFilters>):
        Promise<ApiResponse<ServiceItemPerformingDoctorAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Team'));
        // include.push({ model: this.Models.ServiceItem, attributes: ['DepartmentId', 'Name'], required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ServiceItemPerformingDoctorFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ServiceItemPerformingDoctorFilters.DoctorName:
                    where['DoctorName'] = param.Value;
                    break;
                case ServiceItemPerformingDoctorFilters.VisitTypeId:
                    where['VisitTypeId'] = param.Value;
                    break;
                case ServiceItemPerformingDoctorFilters.StatusId:
                    where['StatusId:'] = param.Value;
                    break;
                case ServiceItemPerformingDoctorFilters.FacilityId:
                    where['FacilityId'] = param.Value;
                    break;
                case ServiceItemPerformingDoctorFilters.ServiceItemId:
                    where['ServiceItemId'] = param.Value;
                    break;
                case ServiceItemPerformingDoctorFilters.ServiceRateCategoryId:
                    where['ServiceRateCategoryId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteServiceItemPerformingDoctor(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ServiceItemPerformingDoctorFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DoctorName', 'Text'], 'DoctorId', 'FacilityId', 'DoctorShareValue',
            'ShareTypeId', 'DoctorShare'];
        let val = await this.GetServiceItemPerformingDoctors(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ServiceItemPerformingDoctorInstance, ServiceItemPerformingDoctorAttributes> {
        return this.Models.ServiceItemPerformingDoctor;
    }

}
