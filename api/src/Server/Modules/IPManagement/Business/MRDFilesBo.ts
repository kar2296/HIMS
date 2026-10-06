import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { MRDFilesInstance, MRDFilesAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import { MRDFilesFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';

export class MRDFilesBo extends BaseBo<MRDFilesInstance, MRDFilesAttributes> {
    public async AddMRDFiles(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        let MRDFilesId = result.dataValues.Id;
        if (req.Data.EncounterId) {
            let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encdata: any = {
                Data: {
                    Id: req.Data.EncounterId,
                    ISMRDReturn: true,
                    MRDIpFileId: MRDFilesId
                }
            };
            await encounterbo.Update(encdata.Data);
        }
        return MRDFilesId;
    }

    public async UpdateMRDFiles(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        if (req.Data.EncounterId && req.Data.MRDIPFileStatusId === 7) {
            let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encdata: any = {
                Data: {
                    Id: req.Data.EncounterId,
                    ISMRDReturn: false,
                    IsIncompleteMRD: true
                }
            };
            await encounterbo.Update(encdata.Data);
        }
        if (req.Data.EncounterId && req.Data.MRDIPFileStatusId === 1) {
            let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encdata: any = {
                Data: {
                    Id: req.Data.EncounterId,
                    ISMRDReturn: true,
                    IsIncompleteMRD: false
                }
            };
            await encounterbo.Update(encdata.Data);
        }
        return result;
    }

    public async GetMRDFilesById(req: BaseRequest): Promise<MRDFilesAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB'],
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReturnedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReceivedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetMRDFiless(apiReq?: ApiRequest<MRDFilesFilters>): Promise<ApiResponse<MRDFilesAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqPatientSearch: boolean = false;
        include.push(this.GetReference('MRDIPFileStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReturnedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReceivedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case MRDFilesFilters.Id:
                        where['MRDFilesId'] = param.Value;
                        break;
                    case MRDFilesFilters.PatientName:
                        (where as any)[Op.or] = [{ PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case MRDFilesFilters.VisitNo:
                        (where as any)[Op.or] = [{ VisitNo: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case MRDFilesFilters.DischargeDate:
                        where['DischargeDate'] = { '$between': param.Value || '' };
                        break;
                    case MRDFilesFilters.From:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$gte'] = param.Value;
                        break;
                    case MRDFilesFilters.To:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$lte'] = param.Value;
                        break;
                    case MRDFilesFilters.MRDIPFileStatusId:
                        where['MRDIPFileStatusId'] = param.Value;
                        break;
                    case MRDFilesFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case MRDFilesFilters.ReturnDate:
                        where['ReturnDate'] = { '$between': param.Value || '' };
                        break;
                    case MRDFilesFilters.ReturnFrom:
                        where['ReturnDate'] = where['ReturnDate'] || {};
                        (where['ReturnDate'] as any)['$gte'] = param.Value;
                        break;
                    case MRDFilesFilters.ReturnTo:
                        where['ReturnDate'] = where['ReturnDate'] || {};
                        (where['ReturnDate'] as any)['$lte'] = param.Value;
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
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title')]
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteMRDFiles(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<MRDFilesInstance, MRDFilesAttributes> {
        return this.Models.MRDFiles;
    }
    public async PrintMrdFileSubmittedReport(apiReq?: ApiRequest<MRDFilesFilters>): Promise<any> {
        let data = await this.GetMRDFiless(apiReq);
        let MRDFiles = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let DoctorName = apiReq.Data.DoctorName;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            MRDFiles: MRDFiles,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,
        };
        let pdfOption: any = null;
        let key = 'mrdfilesubmitdetailsreport';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
