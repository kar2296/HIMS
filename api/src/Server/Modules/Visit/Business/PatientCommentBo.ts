import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientCommentInstance, PatientCommentAttributes } from '../Model/Interface/Index';
import { PatientCommentFilters } from '../Common/Filters.e';

export class PatientCommentBo extends BaseBo<PatientCommentInstance, PatientCommentAttributes> {
    public async AddPatientComment(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientComment(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientCommentById(req: BaseRequest): Promise<PatientCommentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientComments(apiReq?: ApiRequest<PatientCommentFilters>): Promise<ApiResponse<PatientCommentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, as: 'CommentUser', attributes: ['FirstName', 'LastName','TitleId'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('CommentsType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientCommentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientCommentFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientComment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientCommentInstance, PatientCommentAttributes> {
        return this.Models.PatientComment;
    }
}

