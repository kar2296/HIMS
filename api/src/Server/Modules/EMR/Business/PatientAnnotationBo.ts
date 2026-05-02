import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientAnnotationInstance, PatientAnnotationAttributes } from '../Model/Interface/Index';
import { PatientAnnotationFilters } from '../Common/Filters.e';
import { readFileSync, writeFileSync } from 'fs';
import { AppConfig } from '../../../../config/index';

export class PatientAnnotationBo extends BaseBo<PatientAnnotationInstance, PatientAnnotationAttributes>  {
    public async AddPatientAnnotation(req: BaseRequest): Promise<number> {
        //File upload code starts
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        console.log(req.Data);
        //webcam photo code starts
        if (req.Data.iswebcamphoto === true || req.Data.iswebcamphoto === 'true') {
            let base64String = req.Data.webcamphoto;
            let filePath = AppConfig.UploadFilePath + '.png';
            await writeFileSync(filePath, new Buffer(base64String, 'base64'));
            req.Data.FilePath = filePath;
        }
        //webcam photo code ends

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

    public async UpdatePatientAnnotation(req: BaseRequest): Promise<boolean> {
        //File upload code starts
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        //webcam photo code starts
        if (req.Data.iswebcamphoto === true || req.Data.iswebcamphoto === 'true') {
            let base64String = req.Data.webcamphoto;
            let filePath = AppConfig.UploadFilePath + '.png';
            await writeFileSync(filePath, new Buffer(base64String, 'base64'));
            req.Data.FilePath = filePath;
        }
        //webcam photo code ends

        //Handling for json 'null' value while save user with file upload
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAnnotationFile(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.FilePath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Photo: photoBase64 };
    }

    public async GetPatientAnnotationById(req: BaseRequest): Promise<PatientAnnotationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientAnnotations(apiReq?: ApiRequest<PatientAnnotationFilters>): Promise<ApiResponse<PatientAnnotationAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AnnotationType'));
        include.push(this.GetReference('AnnotationStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if(this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientAnnotationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientAnnotationFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientAnnotationFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientAnnotationFilters.AnnotationTypeId:
                        where['AnnotationTypeId'] = param.Value;
                        break;
                    case PatientAnnotationFilters.AnnotationStatusId:
                        where['AnnotationStatusId'] = param.Value;
                        break;
                    case PatientAnnotationFilters.PerformedBy:
                        where['PerformedBy'] = param.Value;
                        break;
                    case PatientAnnotationFilters.PerformedDate:
                        where['PerformedDate'] = param.Value;
                        break;
                    case PatientAnnotationFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientAnnotationFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientAnnotation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientAnnotationInstance, PatientAnnotationAttributes> {
        return this.Models.PatientAnnotation;
    }

}
