import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ClaimCoveringletterDetailsFilters } from '../Common/Filters.e';
import { ClaimCoveringletterDetailsInstance, ClaimCoveringletterDetailsAttributes } from '../Model/Interface/Index';

export class ClaimCoveringletterDetailsBo extends BaseBo<ClaimCoveringletterDetailsInstance, ClaimCoveringletterDetailsAttributes>  {
    public async AddClaimCoveringletterDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateClaimCoveringletterDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageClaimCoveringletterDetails(ClaimCoveringletterId: number, details: ClaimCoveringletterDetailsAttributes[])
        : Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ClaimCoveringletterId = ClaimCoveringletterId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetClaimCoveringletterDetailsById(req: BaseRequest): Promise<ClaimCoveringletterDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetClaimCoveringletterDetails(apiReq?: ApiRequest<ClaimCoveringletterDetailsFilters>):
        Promise<ApiResponse<ClaimCoveringletterDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let coveringletterWhere: WhereOptions<any> = {};
        let isReqPatientSearch, isCoveringletterSearch: boolean = false;
        // include.push({
        //     model: this.Models.PatientBills, attributes: ['BillDateTime', 'BillNumber', 'BillAmount', 'BillDiscount',
        //         'GuarantorId', 'OutStandingAmount'],
        //     required: false, include: [
        //         {
        //             model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
        //             include: [
        //                 this.GetReference('Title')
        //             ]
        //         }
        //     ]
        // });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ClaimCoveringletterDetailsFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ClaimCoveringletterDetailsFilters.ClaimCoveringletterId:
                    where['ClaimCoveringletterId'] = param.Value;
                    break;
                case ClaimCoveringletterDetailsFilters.ClaimCoveringletterId:
                    where['ClaimCoveringletterId'] = param.Value;
                    break;
                case ClaimCoveringletterDetailsFilters.GuarantorId:
                    where['GuarantorId'] = param.Value;
                    break;
                case ClaimCoveringletterDetailsFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                case ClaimCoveringletterDetailsFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                case ClaimCoveringletterDetailsFilters.IsClaimCoveringLetter:
                    coveringletterWhere['IsClaimCoveringLetter'] = param.Value;
                    isCoveringletterSearch = true;
                    break;
                case ClaimCoveringletterDetailsFilters.ClaimSubmissionId:
                    coveringletterWhere['ClaimSubmissionId'] = param.Value;
                    isCoveringletterSearch = true;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.ClaimCoveringletter,
            attributes: ['Id', 'GuarantorId', 'GuarantorTypeId', 'PatientId', 'EncounterId', 'FacilityId', 'ClaimSubmissionId',
                'Comments', 'LetterDate', 'ClaimSubmissionDetailId', 'ClaimSubmissionStatusId', 'IsClaimCoveringLetter', 'DispatchedOn'],
            required: isCoveringletterSearch,
            where: coveringletterWhere
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteClaimCoveringletterDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ClaimCoveringletterDetailsInstance, ClaimCoveringletterDetailsAttributes> {
        return this.Models.ClaimCoveringletterDetails;
    }

}
