import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ExtravasationProformaInstance, ExtravasationProformaAttributes } from '../Model/Interface/Index';
import { ExtravasationProformaFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { readFileSync } from 'fs';
import { join } from 'path';

export class ExtravasationProformaBo extends BaseBo<ExtravasationProformaInstance, ExtravasationProformaAttributes> {
    public async AddExtravasationProforma(req: BaseRequest): Promise<number> {
        // let file = this.Request.file;
        // if (file) {
        //     req.Data.PhotoAfterextravasation = file.path;
        //     req.Data.PhotoAfterHealing = file.path;
        // }
        this.HandleNullDataViaFileUpload(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }
    public async UpdateExtravasationProforma(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.PhotoAfterextravasation = file.path;
            req.Data.PhotoAfterHealing = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async UploadPhoto(req: BaseRequest): Promise<boolean> {
        if (req.Data.UploadedFile === 'PhotoAfterextravasation') {
            let PhotoAfterextravasation = this.Request.file;
            if (PhotoAfterextravasation) {
                let filepath: string = PhotoAfterextravasation.path;
                req.Data.PhotoAfterextravasation = filepath;
            }
        } else if (req.Data.UploadedFile === 'PhotoAfterHealing') {
            let PhotoAfterHealing = this.Request.file;
            if (PhotoAfterHealing) {
                let filepath: string = PhotoAfterHealing.path;
                req.Data.PhotoAfterHealing = filepath;
            }
        }
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetExtravasationProformaById(req: BaseRequest):
        Promise<ExtravasationProformaAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('ExtravasationProformaType'));
        include.push(this.GetReference('ExtravasationProformaStatus'));
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }
    public async GetExtravasationProformas(apiReq?: ApiRequest<ExtravasationProformaFilters>):
        Promise<ApiResponse<ExtravasationProformaAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('ExtravasationProformaType'));
        include.push(this.GetReference('ExtravasationProformaStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ExtravasationProformaFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ExtravasationProformaFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ExtravasationProformaFilters.ExtravasationProformaStatusId:
                        where['ExtravasationProformaStatusId'] = param.Value;
                        break;
                    case ExtravasationProformaFilters.ExtravasationProformaTypeId:
                        where['ExtravasationProformaTypeId'] = param.Value;
                        break;
                    case ExtravasationProformaFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case ExtravasationProformaFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [
                            { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }
                        ];
                        isReqPatientSearch = true;
                        break;
                    case ExtravasationProformaFilters.FromDate:
                        where['ExtravasationDateTime'] = where['ExtravasationDateTime'] || {};
                        (where['ExtravasationDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case ExtravasationProformaFilters.ToDate:
                        where['ExtravasationDateTime'] = where['ExtravasationDateTime'] || {};
                        (where['ExtravasationDateTime'] as any)['$lte'] = param.Value;
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
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async PrintExtravasationProforma(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: ExtravasationProformaFilters.Id, Value: req.Id }]
        };
        let data = await this.GetExtravasationProformas(apiReq);
        let Data = data.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);

        let patientData = await patientBo.GetPatientById({ Id: Data.PatientId });
        //Get print preferences
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Data.FacilityId);
        //Preferences: printPreferencesData
        let info = {
            Patient: patientData,
            ExtravasationProforma: Data,
            Preferences: printPreferencesData,
        };
        let pdfOption: any = null;
        let key = 'extravasationproforma';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
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
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async DeleteExtravasationProforma(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ExtravasationProformaInstance, ExtravasationProformaAttributes> {
        return this.Models.ExtravasationProforma;
    }

    // public async GetPhotoAfterextravasation(req: BaseRequest): Promise<any> {
    //     if (req.Data && req.Data.PhotoAfterextravasation) {
    //         let fs = require('fs');
    //         if (fs.existsSync(req.Data.PhotoAfterextravasation)) {
    //             let fileBuff = await readFileSync(req.Data.PhotoAfterextravasation);
    //             let logoBase64 = new Buffer(fileBuff).toString('base64');
    //             return { Id: req.Data.Id, PhotoAfterextravasationImg: logoBase64 };
    //         }
    //     }
    //     return null;
    // }

    // public async GetPhotoAfterHealing(req: BaseRequest): Promise<any> {
    //     if (req.Data && req.Data.PhotoAfterHealing) {
    //         let fs = require('fs');
    //         if (fs.existsSync(req.Data.PhotoAfterHealing)) {
    //             let fileBuff = await readFileSync(req.Data.PhotoAfterHealing);
    //             let logoBase64 = new Buffer(fileBuff).toString('base64');
    //             return { Id: req.Data.Id, PhotoAfterHealingImg: logoBase64 };
    //         }
    //     }
    //     return null;
    // }
    public async GetPhotoAfterextravasation(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.PhotoAfterextravasation);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Logo: logoBase64 };
    }
    public async GetPhotoAfterHealing(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.PhotoAfterHealing);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Logo: logoBase64 };
    }
    public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
        let admissioncount = await this.Items.count({
            where: {
                'Status': 1,
                'ExtravasationProformaStatusId': { '$in': [2] },
                'DoctorId': req.Data.DoctorId,
            }
        });
        return {
            'admissioncount': admissioncount,
        };
    }

    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let AdmitCount = await this.Items.count({
            where: {
                'Status': 1,
                // 'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid
            }
        });
        return {
            'AdmitCount': AdmitCount
        };
    }
}
