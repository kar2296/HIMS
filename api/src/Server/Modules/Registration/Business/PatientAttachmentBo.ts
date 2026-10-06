import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientAttachmentInstance, PatientAttachmentAttributes } from '../Model/Interface/Index';
import { PatientAttachmentFilters } from '../Common/Filters.e';

export class PatientAttachmentBo extends BaseBo<PatientAttachmentInstance, PatientAttachmentAttributes>  {
    public async AddPatientAttachment(req: BaseRequest): Promise<number> {
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

    public async UpdatePatientAttachment(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAttachmentFile(req: BaseRequest, res: any): Promise<any> {
        let result = await res.download(req.Data.FilePath);
        return result;
    }

    public async GetPatientAttachmentById(req: BaseRequest): Promise<PatientAttachmentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientAttachments(apiReq?: ApiRequest<PatientAttachmentFilters>): Promise<ApiResponse<PatientAttachmentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientAttachmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientAttachmentFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientAttachmentFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientAttachmentFilters.ObjectTypeId:
                        where['ObjectTypeId'] = param.Value;
                        break;
                    case PatientAttachmentFilters.AttachmentTypeId:
                        where['AttachmentTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientAttachment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientAttachmentInstance, PatientAttachmentAttributes> {
        return this.Models.PatientAttachment;
    }

}
