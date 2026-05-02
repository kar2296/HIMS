import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientTransferInstance, PatientTransferAttributes } from '../Model/Interface/Index';
import { PatientTransferFilters } from '../Common/Filters.e';

export class PatientTransferBo extends BaseBo<PatientTransferInstance, PatientTransferAttributes>  {
    public async AddPatientTransfer(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientTransfer(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientTransferById(req: BaseRequest): Promise<PatientTransferAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName', 'LicenseNo', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetPatientTransfers(apiReq?: ApiRequest<PatientTransferFilters>):
        Promise<ApiResponse<PatientTransferAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('TransRefDischargeType'));
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName', 'LicenseNo', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Facility, required: false,
        });

        include.push({
            model: this.Models.Department, as: 'FromDepartment', required: false,
        });
        include.push({
            model: this.Models.Facility, as: 'FromFcility', required: false,
        });
        include.push({
            model: this.Models.Facility, as: 'ReferOtherFacility', required: false,
        });
        include.push({
            model: this.Models.Department, as: 'ReferOtherDepartment', required: false,
        });

        include.push({
            model: this.Models.Department, as: 'ReferralDeptartment', required: false,
        });
        include.push({
            model: this.Models.Department, as: 'FacilityDeptartment', required: false,
        });
        include.push({
            model: this.Models.Department, as: 'AdmissionDepartment', required: false,
        });
        include.push({
            model: this.Models.WardMaster, as: 'AdmissionWard', required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientTransferFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientTransferFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientTransferFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientTransferFilters.TransferDate:
                        where['TransferDate'] = param.Value;
                        break;
                    case PatientTransferFilters.ReferralDeptartmentId:
                        where['ReferralDeptartmentId'] = param.Value;
                        break;
                    case PatientTransferFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientTransferFilters.FacilityDeptartmentId:
                        where['FacilityDeptartmentId'] = param.Value;
                        break;
                    case PatientTransferFilters.TransRefDischargeTypeId:
                        where['TransRefDischargeTypeId'] = param.Value;
                        break;
                    case PatientTransferFilters.From:
                        where['TransferDate'] = where['TransferDate'] || {};
                        (where['TransferDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientTransferFilters.To:
                        where['TransferDate'] = where['TransferDate'] || {};
                        (where['TransferDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientTransferFilters.Reviewed:
                        where['Reviewed'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId', 'DOB'],
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['TransferDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientTransferInstance, PatientTransferAttributes> {
        return this.Models.PatientTransfer;
    }
}
