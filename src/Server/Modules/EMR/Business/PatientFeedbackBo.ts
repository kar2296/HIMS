import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientFeedbackInstance, PatientFeedbackAttributes } from '../Model/Interface/Index';
import * as bo from '../../EMR/Business/Index';
import { readFileSync, writeFileSync } from 'fs';
import { AppConfig } from '../../../../config/index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientFeedbackFilters } from '../Common/Filters.e';

export class PatientFeedbackBo extends BaseBo<PatientFeedbackInstance, PatientFeedbackAttributes>  {

    public async AddPatientFeedback(req: BaseRequest): Promise<number> {
        if (req.Data.signdata && req.Data.signdata !== '') {
            let datetimestamp = Date.now();
            let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.Name + '-sign-' + datetimestamp + '.png';
            await writeFileSync(signFilePath, new Buffer(req.Data.signdata, 'base64'));
            req.Data.SignPath = signFilePath;
        }
        let result = await this.Save(req.Data);
        let detailBO = BoFactory.GetBo(bo.PatientFeedbackDetailsBo, this.Request);
        let PatientFeedbackId = result.dataValues.Id;
        await detailBO.ManagePatientFeedbackDetails(PatientFeedbackId, req.Data.Details);
        return PatientFeedbackId;
    }

    public async UpdatePatientFeedback(req: BaseRequest): Promise<boolean> {
        if (req.Data.signdata && req.Data.signdata !== '') {
            let datetimestamp = Date.now();
            let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.Name + '-sign-' + datetimestamp + '.png';
            await writeFileSync(signFilePath, new Buffer(req.Data.signdata, 'base64'));
            req.Data.SignPath = signFilePath;
        }
        let result = await this.Update(req.Data);
        let detailBO = BoFactory.GetBo(bo.PatientFeedbackDetailsBo, this.Request);
        let PatientFeedbackId = req.Data.Id;
        await detailBO.ManagePatientFeedbackDetails(PatientFeedbackId, req.Data.Details);
        return result;
    }
    public async GetFeedbackSignPic(req: BaseRequest): Promise<any> {
        let result = await readFileSync(req.Data.SignPath);
        return new Buffer(result).toString('base64');
    }
    public async GetPatientFeedbackById(req: BaseRequest): Promise<PatientFeedbackAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientFeedbacks(apiReq?: ApiRequest<PatientFeedbackFilters>): Promise<ApiResponse<PatientFeedbackAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.WardMaster, attributes: ['WardName'], required: false,
        });
        include.push({
            model: this.Models.Patient, attributes: ['Id', 'TitleId', 'FirstName', 'LastName', 'MRN'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['Id', 'PatientId', 'PatientMrn', 'DoctorId', 'DoctorName', 'VisitTypeId', 'EncounterTypeId'], required: false,
            include: [this.GetReference('VisitType'), this.GetReference('EncounterType'),
            { model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false, },
            { model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false },
            { model: this.Models.WardMaster, attributes: ['WardName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false,
        });
        include.push({
            model: this.Models.PatientFeedbackDetails, required: false,
        });
        include.push(this.GetReference('FeedbackType'));
        include.push(this.GetReference('PatientFeedbackStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientFeedbackFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientFeedbackFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientFeedbackFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientFeedbackFilters.FeedbackTypeId:
                        where['FeedbackTypeId'] = param.Value;
                        break;
                    case PatientFeedbackFilters.FeedbackOn:
                        where['FeedbackOn'] = { '$between': param.Value };
                        break;
                    case PatientFeedbackFilters.From:
                        where['FeedbackOn'] = where['FeedbackOn'] || {};
                        (where['FeedbackOn'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFeedbackFilters.To:
                        where['FeedbackOn'] = where['FeedbackOn'] || {};
                        (where['FeedbackOn'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case PatientFeedbackFilters.PatientFeedbackStatusId:
                        where['PatientFeedbackStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPatientFeedbackInfoDashBoard(req: BaseRequest): Promise<any> {
        console.log('***************************************', req.Data);
        let TodayFeedbackCount = await this.Items.count({
            where: {
                'Status': 1,
                'PatientFeedbackStatusId': { '$in': [2, 3] },
                'FacilityId': req.Data.FacilityId,
                'FeedbackOn': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
            }
        });
        let OverallFeedbackCount = await this.Items.count({
            where: {
                'Status': 1,
                'PatientFeedbackStatusId': { '$in': [2, 3] },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let IPFeedbackCount = await this.Items.count({
            where: {
                'Status': 1,
                'PatientFeedbackStatusId': { '$in': [2, 3] },
                'FeedbackOn': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'FeedbackTypeId': 1
            }
        });
        let OPFeedbackCount = await this.Items.count({
            where: {
                'Status': 1,
                'PatientFeedbackStatusId': { '$in': [2, 3] },
                'FeedbackOn': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'FeedbackTypeId': 2
            }
        });
        return {
            'TodayFeedbackCount': TodayFeedbackCount,
            'OverallFeedbackCount': OverallFeedbackCount,
            'IPFeedbackCount': IPFeedbackCount,
            'OPFeedbackCount': OPFeedbackCount
        };
    }


    public async DeletePatientFeedback(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientFeedbackInstance, PatientFeedbackAttributes> {
        return this.Models.PatientFeedback;
    }

}
