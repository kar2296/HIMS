import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { MRDFileAttachmentInstance, MRDFileAttachmentAttributes } from '../Model/Interface/Index';
import { MRDFileAttachmentFilters } from '../Common/Filters.e';

export class MRDFileAttachmentsBo extends BaseBo<MRDFileAttachmentInstance, MRDFileAttachmentAttributes>  {
    public async AddMRDFileAttachment(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        //Handling for json 'null' value while save user with file upload
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateMRDFileAttachment(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetMRDFileAttachmentById(req: BaseRequest): Promise<MRDFileAttachmentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetMRDFileAttachments(apiReq?: ApiRequest<MRDFileAttachmentFilters>):
        Promise<ApiResponse<MRDFileAttachmentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('MRDFileType'));
        include.push(this.GetReference('EncounterType'));
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB'],
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case MRDFileAttachmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case MRDFileAttachmentFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case MRDFileAttachmentFilters.MRN:
                        where['MRN'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case MRDFileAttachmentFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case MRDFileAttachmentFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case MRDFileAttachmentFilters.AdmissionDate:
                        where['AdmissionDate'] = param.Value;
                        break;
                    case MRDFileAttachmentFilters.MRDFileTypeId:
                        where['MRDFileTypeId'] = param.Value;
                        break;
                    case MRDFileAttachmentFilters.VisitIdentifier:
                        where['VisitIdentifier'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case MRDFileAttachmentFilters.CapturedDate:
                        where['CapturedDate'] = param.Value;
                        break;
                    case MRDFileAttachmentFilters.From:
                        where['CapturedDate'] = where['CapturedDate'] || {};
                        (where['CapturedDate'] as any)['$gte'] = param.Value;
                        break;
                    case MRDFileAttachmentFilters.To:
                        where['CapturedDate'] = where['CapturedDate'] || {};
                        (where['CapturedDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }


    public async DeleteMRDFileAttachment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<MRDFileAttachmentInstance, MRDFileAttachmentAttributes> {
        return this.Models.MRDFileAttachments;
    }
}

