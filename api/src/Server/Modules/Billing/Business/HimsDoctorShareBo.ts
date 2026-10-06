import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import { DoctorShareInstance, DoctorShareAttributes } from '../Model/Interface/Index';
import { DoctorShareFilters } from '../Common/Filters.e';

export class DoctorShareBo extends BaseBo<DoctorShareInstance, DoctorShareAttributes>  {
    public async AddDoctorShare(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.DoctorShareDetailsBo, this.Request);
            let DoctorShareId = result.dataValues.Id;
            await detailBO.ManageDoctorShareDetails(DoctorShareId, req.Data.Details);
            return DoctorShareId;
        }
        return -1;
    }

    public async UpdateDoctorShare(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.DoctorShareDetailsBo, this.Request);
            let DoctorShareId = req.Data.Header.Id;
            await detailBO.ManageDoctorShareDetails(DoctorShareId, req.Data.Details);
            return DoctorShareId;
        }
        return true;
    }

    public async GetDoctorShareById(req: BaseRequest): Promise<DoctorShareAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }


    public async GetDoctorShare(apiReq?: ApiRequest<DoctorShareFilters>):
        Promise<ApiResponse<DoctorShareAttributes[]>> {
        let isShareDetailsRequired = false;
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        let detailswhere: WhereOptions<any> = {};
        include.push(this.GetReference('DoctorClass'));
        include.push(this.GetReference('ShareType'));
        include.push(this.GetReference('EncounterType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DoctorShareFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DoctorShareFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case DoctorShareFilters.DoctorClassId:
                        where['DoctorClassId'] = param.Value;
                        break;
                    case DoctorShareFilters.ShareTypeId:
                        where['ShareTypeId'] = param.Value;
                        break;
                    case DoctorShareFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case DoctorShareFilters.ActiveFrom:
                        where['ActiveFrom'] = param.Value;
                        break;
                    case DoctorShareFilters.ActiveTo:
                        where['ActiveTo'] = param.Value;
                        break;
                    case DoctorShareFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.DoctorShareDetails,
            required: isShareDetailsRequired,
            where: detailswhere,
            include: [
                { model: this.Models.ServiceCategory, required: false }]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }


    public async DeleteDoctorShare(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DoctorShareInstance, DoctorShareAttributes> {
        return this.Models.DoctorShare;
    }

}
