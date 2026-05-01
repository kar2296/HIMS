import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions} from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BedtransportationlogInstance, BedtransportationlogAttributes } from '../Model/Interface/Index';
import { BedtransportationlogFilters } from '../Common/Filters.e';

export class BedtransportationlogBo extends BaseBo<BedtransportationlogInstance, BedtransportationlogAttributes> {
    public async AddBedtransportationlog(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateBedtransportationlog(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetBedtransportationlogById(req: BaseRequest): Promise<BedtransportationlogAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBedtransportationlogs(apiReq?: ApiRequest<BedtransportationlogFilters>):
    Promise<ApiResponse<BedtransportationlogAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any>= {};
        let isReqPatientSearch: boolean = false;
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BedtransportationlogFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }


    public async DeleteBedtransportationlog(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<BedtransportationlogInstance, BedtransportationlogAttributes> {
        return this.Models.Bedtransportationlog;
    }
}
