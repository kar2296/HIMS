import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { Op } from 'sequelize';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OtRequestInstance, OtRequestAttributes } from '../Model/Interface/Index';
import { OtRequestFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';

export class OtRequestBo extends BaseBo<OtRequestInstance, OtRequestAttributes> {
    public async AddOtRequest(req: BaseRequest): Promise<number> {
        let generateOTReqId = 0;
        if (!req.Data.OTrequestNo && req.Data.OTRequestStatusId === 2) {
            req.Data.OTrequestNo = null;
            generateOTReqId = 1;
            // await Sequence.Next(SequenceKeys.OTrequestNoId);
        }
        let result = await this.Save(req.Data);
        let otReqId = result.dataValues.Id;
        if (generateOTReqId === 1) {
            this.deferSequenceKey(otReqId, 'OTrequestNo',
                this.getSequenceIdentifier(SequenceKeys.OTrequestNoId));
        }
        return otReqId;
    }

    public async UpdateOtRequest(req: BaseRequest): Promise<boolean> {
        let generateOTReqId = 0;
        if (!req.Data.OTrequestNo && req.Data.OTRequestStatusId === 2) {
            req.Data.OTrequestNo = null;
            generateOTReqId = 1;
            // await Sequence.Next(SequenceKeys.OTrequestNoId);
        }
        let result = await this.Update(req.Data);
        if (generateOTReqId === 1) {
            this.deferSequenceKey(req.Data.Id, 'OTrequestNo',
                this.getSequenceIdentifier(SequenceKeys.OTrequestNoId));
        }
        return result;
    }
    // public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
    //     let count = 0;
    //     switch (key) {
    //         case 'surgeryrequest':
    //             count = await this.Items.count({
    //                 where: {
    //                     'OTRequestStatusId': { '$in': [2] },  //COMPLETED
    //                     'ChiefSurgeonId': this.GetSession().UserId
    //                 }
    //             });
    //             break;
    //         default:
    //             count = 0;
    //             break;
    //     }
    //     return { count: count };
    // }

    public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
        let surgeryrequestcount = await this.Items.count({
            where: {
                'Status': 1,
                'OTRequestStatusId': { '$in': [2] },  //COMPLETED
                'ChiefSurgeonId': req.Data.DoctorId,
            }
        });
        return {
            'surgeryrequestcount': surgeryrequestcount,
        };
    }
    public async GetOtRequestById(req: BaseRequest): Promise<OtRequestAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOtRequests(apiReq?: ApiRequest<OtRequestFilters>): Promise<ApiResponse<OtRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let isReqPatientSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        include.push(this.GetReference('OTRequestStatus'));
        // include.push(this.GetReference('OTRoom'));
        include.push(this.GetReference('SurgeryType'));
        include.push({ model: this.Models.Procedure, attributes: ['ProcedureName'], required: false });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], as: 'OTRoom', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OtRequestFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OtRequestFilters.AnaesthesistId:
                        where['AnaesthesistId'] = param.Value;
                        break;
                    case OtRequestFilters.OTRequestStatusId:
                        where['OTRequestStatusId'] = param.Value;
                        break;
                    case OtRequestFilters.ProcedureId:
                        where['SurgeryId'] = param.Value;
                        break;
                    case OtRequestFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case OtRequestFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case OtRequestFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case OtRequestFilters.AnaesthesiaTypeId:
                        where['AnaesthesiaTypeId'] = param.Value;
                        break;
                    case OtRequestFilters.AssociateSurgeonId:
                        where['AssociateSurgeonId'] = param.Value;
                        break;
                    case OtRequestFilters.OTRequestedOn:
                        where['OTRequestedOn'] = { '$between': param.Value || '' };
                        break;
                    case OtRequestFilters.From:
                        where['OTRequestedOn'] = where['OTRequestedOn'] || {};
                        (where['OTRequestedOn'] as any)['$gte'] = param.Value;
                        break;
                    case OtRequestFilters.To:
                        where['OTRequestedOn'] = where['OTRequestedOn'] || {};
                        (where['OTRequestedOn'] as any)['$lte'] = param.Value;
                        break;
                    case OtRequestFilters.ChiefSurgeonId:
                        where['ChiefSurgeonId'] = param.Value;
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
        order.push(['OTRequestedOn', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async DeleteOtRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OtRequestInstance, OtRequestAttributes> {
        return this.Models.OtRequest;
    }

    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let SurgeryCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid
            }
        });
        return {
            'SurgeryCount': SurgeryCount
        };
    }
    public async GetOtDashboardInfo(req: BaseRequest): Promise<any> {
        let SurgeryCounts = await this.Items.count({
            where: {
                'Status': 1,
                'OTRequestStatusId': { '$in': [2] }
            }
        });
        let OTConformationCount = await this.Items.count({
            where: {
                'Status': 1,
                'OTRequestStatusId': { '$in': [3] }
            }
        });
        return {
            'SurgeryCounts': SurgeryCounts,
            'OTConformationCount': OTConformationCount
        };
    }
}
