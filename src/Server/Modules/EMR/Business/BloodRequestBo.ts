import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BloodRequestInstance, BloodRequestAttributes } from '../Model/Interface/Index';
import { BloodRequestFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';

export class BloodRequestBo extends BaseBo<BloodRequestInstance, BloodRequestAttributes>  {
    public async AddBloodRequest(req: BaseRequest): Promise<number> {
        if (req.Data.BloodBankStatusId === 2)
            req.Data.BloodRequestNo = await Sequence.Next(SequenceKeys.BloodRequestId);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateBloodRequest(req: BaseRequest): Promise<boolean> {
        if (req.Data.BloodBankStatusId === 2 || req.Data.BloodRequestNo === null)
            req.Data.BloodRequestNo = await Sequence.Next(SequenceKeys.BloodRequestId);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetBloodRequestById(req: BaseRequest): Promise<BloodRequestAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName', 'LicenseNo', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetBloodRequests(apiReq?: ApiRequest<BloodRequestFilters>):
        Promise<ApiResponse<BloodRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('BloodPriority'));
        include.push(this.GetReference('BloodBankStatus'));
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName', 'LicenseNo', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        // include.push({
        //     model: this.Models.Encounter,
        //     required: true,
        //     include: [
        //         { model: this.Models.WardMaster, required: false },
        //         { model: this.Models.WardRoomMaster, required: false },
        //         { model: this.Models.WardRoomBedMaster, required: false }
        //     ]
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BloodRequestFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BloodRequestFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case BloodRequestFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case BloodRequestFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case BloodRequestFilters.BloodRequestDate:
                        where['BloodRequestDate'] = param.Value;
                        break;
                    case BloodRequestFilters.From:
                        where['BloodRequestDate'] = where['BloodRequestDate'] || {};
                        (where['BloodRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case BloodRequestFilters.To:
                        where['BloodRequestDate'] = where['BloodRequestDate'] || {};
                        (where['BloodRequestDate'] as any)['$lte'] = param.Value;
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
        order.push(['BloodRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteBloodRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<BloodRequestInstance, BloodRequestAttributes> {
        return this.Models.BloodRequest;
    }
}
