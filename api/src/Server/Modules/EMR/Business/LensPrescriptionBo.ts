import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { LensPrescriptionInstance, LensPrescriptionAttributes } from '../Model/Interface/Index';
import { LensPrescriptionFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import { join } from 'path';
import { BoFactory } from '../../Base/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';

export class LensPrescriptionBo extends BaseBo<LensPrescriptionInstance, LensPrescriptionAttributes> {
    public async AddLensPrescription(req: BaseRequest): Promise<number> {
        if (req.Data.LensPrescriptionStatusId === 2)
            req.Data.LensIdentifier = await Sequence.Next(SequenceKeys.LensPrescriptionId);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateLensPrescription(req: BaseRequest): Promise<boolean> {
        if (req.Data.LensPrescriptionStatusId === 2 || req.Data.LensIdentifier === null)
            req.Data.LensIdentifier = await Sequence.Next(SequenceKeys.LensPrescriptionId);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetLensPrescriptionById(req: BaseRequest): Promise<LensPrescriptionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLensPrescriptions(apiReq?: ApiRequest<LensPrescriptionFilters>): Promise<ApiResponse<LensPrescriptionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'NationalityIdentifier'],
            required: false,
            include: [
                this.GetReference('Title'), this.GetReference('Gender')
            ],
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'LicenseNo', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('LensPrescriptionStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LensPrescriptionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LensPrescriptionFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case LensPrescriptionFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case LensPrescriptionFilters.LensPrescriptionStatusId:
                        where['LensPrescriptionStatusId'] = param.Value;
                        break;
                    case LensPrescriptionFilters.LensPrescriptionDate:
                        where['LensPrescriptionDate'] = param.Value;
                        break;
                    case LensPrescriptionFilters.From:
                        where['LensPrescriptionDate'] = where['LensPrescriptionDate'] || {};
                        (where['LensPrescriptionDate'] as any)['$gte'] = param.Value;
                        break;
                    case LensPrescriptionFilters.To:
                        where['LensPrescriptionDate'] = where['LensPrescriptionDate'] || {};
                        (where['LensPrescriptionDate'] as any)['$lte'] = param.Value;
                        break;
                    case LensPrescriptionFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case LensPrescriptionFilters.LensIdentifier:
                        where['LensIdentifier'] = { '$like': (param.Value || '') + '%' };
                        // where['LensIdentifier'] = param.Value;
                        break;
                    case LensPrescriptionFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case LensPrescriptionFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['LensPrescriptionDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteLensPrescription(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<LensPrescriptionInstance, LensPrescriptionAttributes> {
        return this.Models.LensPrescription;
    }
    public async PrintLensPrescription(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: LensPrescriptionFilters.Id, Value: req.Id }]
        };
        let data = await this.GetLensPrescriptions(apiReq);
        let lensprescription = data.Data;
        let log = data.Data[0];
        let printPreferencesData = null;
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(log.FacilityId);
        let info = {
            lensprescription: lensprescription,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'lensprescription';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
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
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let LensPrescribeCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid,
                'LensPrescriptionStatusId': { '$in': [2] },  //Created
            }
        });
        return {
            'LensPrescribeCount': LensPrescribeCount
        };
    }
}
