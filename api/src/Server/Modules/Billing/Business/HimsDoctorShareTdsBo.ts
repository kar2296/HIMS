import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DoctorShareTdsInstance, DoctorShareTdsAttributes } from '../Model/Interface/Index';
import { DoctorShareTdsFilters } from '../Common/Filters.e';

export class DoctorShareTdsBo extends BaseBo<DoctorShareTdsInstance, DoctorShareTdsAttributes>  {
    public async AddDoctorShareTds(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        console.log(result);
        return 0;
    }

    public async UpdateDoctorShareTds(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async GetDoctorShareTdsById(req: BaseRequest): Promise<DoctorShareTdsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDoctorShareTds(apiReq?: ApiRequest<DoctorShareTdsFilters>):
        Promise<ApiResponse<DoctorShareTdsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('EncounterType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DoctorShareTdsFilters.Id:
                        where['PatientBillId'] = param.Value;
                        break;
                    case DoctorShareTdsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case DoctorShareTdsFilters.PatientBillDetailId:
                        where['PatientBillDetailId'] = param.Value;
                        break;
                    case DoctorShareTdsFilters.BillDateTime:
                        where['BillDateTime'] = param.Value;
                        break;
                    case DoctorShareTdsFilters.From:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case DoctorShareTdsFilters.To:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case DoctorShareTdsFilters.BillDoctorId:
                        where['BillDoctorId'] = param.Value;
                        break;
                    case DoctorShareTdsFilters.ShareDoctorId:
                        where['ShareDoctorId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }


    public async DeleteDoctorShareTds(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DoctorShareTdsInstance, DoctorShareTdsAttributes> {
        return this.Models.DoctorShareTds;
    }

}
