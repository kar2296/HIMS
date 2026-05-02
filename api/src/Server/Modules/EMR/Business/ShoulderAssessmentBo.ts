import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ShoulderAssessmentInstance, ShoulderAssessmentAttributes } from '../Model/Interface/Index';
import { ShoulderAssessmentFilters } from '../Common/Filters.e';

export class ShoulderAssessmentBo extends BaseBo<ShoulderAssessmentInstance, ShoulderAssessmentAttributes> {
    public async AddShoulderAssessment(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateShoulderAssessment(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetShoulderAssessmentById(req: BaseRequest): Promise<ShoulderAssessmentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetShoulderAssessments(apiReq?: ApiRequest<ShoulderAssessmentFilters>):
        Promise<ApiResponse<ShoulderAssessmentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ShoulderAssessmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ShoulderAssessmentFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case ShoulderAssessmentFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ShoulderAssessmentFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteShoulderAssessment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintOrthoAssessment(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: req.Id,
            Data: {}
        };

        let shoulderAssessment: any = await this.GetShoulderAssessmentById(apiReq);
        shoulderAssessment.Sections = JSON.parse(shoulderAssessment.Content).data;
        let info = {
            Text: '',
            Title: 'Test Title',
            Sections: shoulderAssessment.Sections
        };

        console.log('info');
        console.log(info);

        let key = 'ortho';
        return await Report.Generate(key, { header: {}, body: info });
    }

    public GetModel(): SStatic.Model<ShoulderAssessmentInstance, ShoulderAssessmentAttributes> {
        return this.Models.ShoulderAssessment;
    }
}
