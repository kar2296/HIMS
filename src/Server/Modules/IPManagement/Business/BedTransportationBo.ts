import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BedTransportationInstance, BedTransportationAttributes } from '../Model/Interface/Index';
import { BedTransportationFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';

export class BedTransportationBo extends BaseBo<BedTransportationInstance, BedTransportationAttributes> {
    public async AddBedTransportation(req: BaseRequest): Promise<number> {
        if (req.Data.TransportStatusId === 2)
            req.Data.TransportIdentifier = await Sequence.Next(SequenceKeys.BedTransportation);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateBedTransportation(req: BaseRequest): Promise<boolean> {
        if (req.Data.TransportStatusId === 2 || req.Data.TransportIdentifier === null)
            req.Data.TransportIdentifier = await Sequence.Next(SequenceKeys.BedTransportation);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetBedTransportationById(req: BaseRequest): Promise<BedTransportationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBedTransportations(apiReq?: ApiRequest<BedTransportationFilters>):
    Promise<ApiResponse<BedTransportationAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any>= {};
        let isReqPatientSearch: boolean = false;
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], as: 'FromWard', required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], as: 'FromRoom', required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], as: 'FromBed', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Assigned', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedById', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('TransportStatus'));
        include.push(this.GetReference('TransportActivity'));
        include.push(this.GetReference('RequestType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BedTransportationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BedTransportationFilters.TransportStatusId:
                        where['TransportStatusId'] = param.Value;
                        break;
                    case BedTransportationFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case BedTransportationFilters.RequestTypeId:
                        where['RequestTypeId'] = param.Value;
                        break;
                    case BedTransportationFilters.TransportIdentifier:
                        where['TransportIdentifier'] = param.Value;
                        break;
                    case BedTransportationFilters.TransportActivityId:
                        where['TransportActivityId'] = param.Value;
                        break;
                    case BedTransportationFilters.CreatedAt:
                        where['CreatedAt'] = param.Value;
                        break;
                    case BedTransportationFilters.FromLocationId:
                        where['FromLocationId'] = param.Value;
                        break;
                    case BedTransportationFilters.ToLocationId:
                        where['ToLocationId'] = param.Value;
                        break;
                    case BedTransportationFilters.FromWardId:
                        where['FromWardId'] = param.Value;
                        break;
                    case BedTransportationFilters.ToWardId:
                        where['ToWardId'] = param.Value;
                        break;
                    case BedTransportationFilters.FromRoomId:
                        where['FromRoomId'] = param.Value;
                        break;
                    case BedTransportationFilters.ToRoomId:
                        where['ToRoomId'] = param.Value;
                        break;
                    case BedTransportationFilters.FromBedId:
                        where['FromBedId'] = param.Value;
                        break;
                    case BedTransportationFilters.ToBedId:
                        where['ToBedId'] = param.Value;
                        break;
                    case BedTransportationFilters.AssignedId:
                        where['AssignedId'] = param.Value;
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

    public async DeleteBedTransportation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<BedTransportationInstance, BedTransportationAttributes> {
        return this.Models.BedTransportation;
    }
}
