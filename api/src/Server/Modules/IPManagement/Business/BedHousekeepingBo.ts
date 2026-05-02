import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BedHousekeepingInstance, BedHousekeepingAttributes } from '../Model/Interface/Index';
import { BedHousekeepingFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';

export class BedHousekeepingBo extends BaseBo<BedHousekeepingInstance, BedHousekeepingAttributes> {
    public async AddBedHousekeeping(req: BaseRequest): Promise<number> {
        let generateHouseKepId = 0;
        if (req.Data.HousekeepingStatusId === 2) {
            req.Data.RequestIdentifier = null;
            generateHouseKepId = 1;
            // await Sequence.Next(SequenceKeys.BedHousekeeping);
        }
        let result = await this.Save(req.Data);
        let houseKeepingId = result.dataValues.Id;
        if (generateHouseKepId === 1) {
            this.deferSequenceKey(generateHouseKepId, 'RequestIdentifier',
                this.getSequenceIdentifier(SequenceKeys.BedHousekeeping));
        }

        return houseKeepingId;
    }

    public async UpdateBedHousekeeping(req: BaseRequest): Promise<boolean> {
        let generateHouseKepId = 0;
        if (req.Data.HousekeepingStatusId === 2 || req.Data.RequestIdentifier === null) {
            req.Data.RequestIdentifier = null;
            generateHouseKepId = 1;
            // await Sequence.Next(SequenceKeys.BedHousekeeping);
        }
        if (generateHouseKepId === 1) {
            this.deferSequenceKey(generateHouseKepId, 'RequestIdentifier',
                this.getSequenceIdentifier(SequenceKeys.BedHousekeeping));
        }
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetBedHousekeepingById(req: BaseRequest): Promise<BedHousekeepingAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBedHousekeepings(apiReq?: ApiRequest<BedHousekeepingFilters>): Promise<ApiResponse<BedHousekeepingAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Assigned', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedById', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('HousekeepingStatus'));
        include.push(this.GetReference('HousekeepingActivity'));
        include.push(this.GetReference('RequestType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BedHousekeepingFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BedHousekeepingFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.HouseKeepingStatusId:
                        where['HouseKeepingStatusId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case BedHousekeepingFilters.RequestTypeId:
                        where['RequestTypeId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.RequestIdentifier:
                        where['RequestIdentifier'] = param.Value;
                        break;
                    case BedHousekeepingFilters.HousekeepingActivityId:
                        where['HousekeepingActivityId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    case BedHousekeepingFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.LocationId:
                        where['LocationId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.AssignedId:
                        where['AssignedId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case BedHousekeepingFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case BedHousekeepingFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteBedHousekeeping(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<BedHousekeepingInstance, BedHousekeepingAttributes> {
        return this.Models.BedHousekeeping;
    }
}
