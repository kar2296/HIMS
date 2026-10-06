import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { IPClearenceInstance, IPClearenceAttributes } from '../Model/Interface/Index';
import { IPClearenceFilters } from '../Common/Filters.e';

export class IPClearenceBo extends BaseBo<IPClearenceInstance, IPClearenceAttributes> {
    public async AddIPClearence(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        let IPClearenceId = result.dataValues.Id;
        return IPClearenceId;
    }

    public async UpdateIPClearence(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetIPClearenceById(req: BaseRequest): Promise<IPClearenceAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Department
        });
        include.push({
            model: this.Models.User, as: 'RequestedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ApprovedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
            required: false
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        include.push(this.GetReference('IPClearenceStatus'));
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB'],
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Encounter, required: false,
            include: [
                // {
                //     model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName',
                //         'SignPath', 'Qualification'], required: false,
                // },
                // { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                // {
                //     model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
                //     required: false
                // },
                // {
                //     model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                //     include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
                // },
                // {
                //     model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                //     include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
                // },
                this.GetReference('AdmissionStatus'),
            ]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetIPClearences(apiReq?: ApiRequest<IPClearenceFilters>): Promise<ApiResponse<IPClearenceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Department
        });
        include.push({
            model: this.Models.User, as: 'RequestedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ApprovedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
            required: false
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        include.push(this.GetReference('IPClearenceStatus'));
        include.push({
            model: this.Models.Encounter, required: false,
            include: [
                // {
                //     model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName',
                //         'SignPath', 'Qualification'], required: false,
                // },
                // { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                // {
                //     model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
                //     required: false
                // },
                // {
                //     model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                //     include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
                // },
                // {
                //     model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                //     include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
                // },
                this.GetReference('AdmissionStatus'),
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case IPClearenceFilters.Id:
                        where['IPClearenceId'] = param.Value;
                        break;
                    case IPClearenceFilters.PatientName:
                        (where as any)[Op.or] = [{ PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case IPClearenceFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case IPClearenceFilters.IPClearenceDate:
                        where['IPClearenceDate'] = { '$between': param.Value || '' };
                        break;
                    case IPClearenceFilters.From:
                        where['IPClearenceDate'] = where['IPClearenceDate'] || {};
                        (where['IPClearenceDate'] as any)['$gte'] = param.Value;
                        break;
                    case IPClearenceFilters.To:
                        where['IPClearenceDate'] = where['IPClearenceDate'] || {};
                        (where['IPClearenceDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case IPClearenceFilters.IPClearenceStatusId:
                        where['IPClearenceStatusId'] = param.Value;
                        break;
                        case IPClearenceFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                        case IPClearenceFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'Mobile'],
            required: false,
            where: patientWhere,
            include: [this.GetReference('Title')]
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteIPClearence(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<IPClearenceInstance, IPClearenceAttributes> {
        return this.Models.IPClearence;
    }
}
