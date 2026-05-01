import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DoctorShareDetailsInstance, DoctorShareDetailsAttributes } from '../Model/Interface/Index';
import { DoctorShareDetailsFilters } from '../Common/Filters.e';

export class DoctorShareDetailsBo extends BaseBo<DoctorShareDetailsInstance, DoctorShareDetailsAttributes>  {
    public async AddDoctorShareDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async ManageDoctorShareDetails(DoctorShareId: number, details: DoctorShareDetailsAttributes[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.DoctorShareId = DoctorShareId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async UpdateDoctorShareDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDoctorShareDetailsById(req: BaseRequest): Promise<DoctorShareDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDoctorShareDetails(apiReq?: ApiRequest<DoctorShareDetailsFilters>):
        Promise<ApiResponse<DoctorShareDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('EncounterType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DoctorShareDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.DoctorShareId:
                        where['DoctorShareId'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.SharingTypeId:
                        where['SharingTypeId'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.ShareTypeId:
                        where['ShareTypeId'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.ActiveFrom:
                        where['ActiveFrom'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.ActiveTo:
                        where['ActiveTo'] = param.Value;
                        break;
                    case DoctorShareDetailsFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }


    public GetModel(): SStatic.Model<DoctorShareDetailsInstance, DoctorShareDetailsAttributes> {
        return this.Models.DoctorShareDetails;
    }

}
