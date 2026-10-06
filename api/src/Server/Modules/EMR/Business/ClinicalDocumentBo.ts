import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ClinicalDocumentInstance, ClinicalDocumentAttributes } from '../Model/Interface/Index';
import { ClinicalDocumentFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class ClinicalDocumentBo extends BaseBo<ClinicalDocumentInstance, ClinicalDocumentAttributes>  {
    public async AddClinicalDocument(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        // //Handling for json 'null' value while save user with file upload
        // for (var idx in req.Data) {
        //     var strValue = req.Data[idx];
        //     if (strValue === 'null') {
        //         req.Data[idx] = null;
        //     }
        // }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async AddMultipleDocument(req: BaseRequest): Promise<number> {
        let files: any = this.Request.files;
        if (files) {
            for (var idx in files) {
                var file = files[idx];
                // if (strValue === 'null') {
                //     req.Data[idx] = null;
                // }
                console.log(file);
                req.Data.FilePath = file.path;
                req.Data.Name = file.originalname;
                this.HandleNullDataViaFileUpload(req.Data);
                this.HandleActiveState(req.Data);
                await this.Save(req.Data);
            }
        }
        return 1;
    }

    public async UpdateClinicalDocument(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        // for (var idx in req.Data) {
        //     var strValue = req.Data[idx];
        //     if (strValue === 'null') {
        //         req.Data[idx] = null;
        //     }
        // }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetClinicalDocumentById(req: BaseRequest): Promise<ClinicalDocumentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetClinicalDocuments(apiReq?: ApiRequest<ClinicalDocumentFilters>): Promise<ApiResponse<ClinicalDocumentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('YesNo'));
        include.push(this.GetReference('DocumentType'));
        include.push({ model: this.Models.Encounter, as: 'Encounter', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ClinicalDocumentFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ClinicalDocumentFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case ClinicalDocumentFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                case ClinicalDocumentFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                case ClinicalDocumentFilters.ConsultationId:
                    where['ConsultationId'] = param.Value;
                    break;
                case ClinicalDocumentFilters.CreatedDate:
                    where['CreatedDate'] = { '$between': param.Value || '' };
                    break;
                case ClinicalDocumentFilters.From:
                    where['CreatedDate'] = where['CreatedDate'] || {};
                    (where['CreatedDate'] as any)['$gte'] = param.Value;
                    break;
                case ClinicalDocumentFilters.To:
                    where['CreatedDate'] = where['CreatedDate'] || {};
                    (where['CreatedDate'] as any)['$lte'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteClinicalDocument(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetAttachmentFile(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.FilePath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, FilePath: photoBase64 };
    }

    public GetModel(): SStatic.Model<ClinicalDocumentInstance, ClinicalDocumentAttributes> {
        return this.Models.ClinicalDocument;
    }

    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let DocumentCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid
            }
        });
        return {
            'DocumentCount': DocumentCount
        };
    }

}
