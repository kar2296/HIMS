import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FacilityDefaultServiceInstance, FacilityDefaultServiceAttributes } from '../Model/Interface/Index';
import { FacilityDefaultServiceFilters } from '../Common/Filters.e';

export class FacilityDefaultServiceBo extends BaseBo<FacilityDefaultServiceInstance, FacilityDefaultServiceAttributes>  {
    public async AddFacilityDefaultService(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFacilityDefaultService(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageFacilityDefaultService(req: BaseRequest): Promise<boolean> {
        let list: FacilityDefaultServiceAttributes[] = req.Data || [];
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

    public async GetFacilityDefaultServiceById(req: BaseRequest): Promise<FacilityDefaultServiceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFacilityDefaultServices(apiReq?: ApiRequest<FacilityDefaultServiceFilters>):
        Promise<ApiResponse<FacilityDefaultServiceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.ServiceItem, attributes: ['Name', 'ItemCode'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FacilityDefaultServiceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FacilityDefaultServiceFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case FacilityDefaultServiceFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case FacilityDefaultServiceFilters.EncounterTypeId:
                        where['PatientTypeId'] = param.Value;
                        break;
                    case FacilityDefaultServiceFilters.VisitTypeId:
                        where['VisitTypeId'] = param.Value;
                        break;
                    case FacilityDefaultServiceFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case FacilityDefaultServiceFilters.StatusId:
                        where['StatusId'] = param.Value;
                        break;
                    case FacilityDefaultServiceFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFacilityDefaultService(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FacilityDefaultServiceInstance, FacilityDefaultServiceAttributes> {
        return this.Models.FacilityDefaultService;
    }

}
