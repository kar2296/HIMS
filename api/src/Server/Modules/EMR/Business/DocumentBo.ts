import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DocumentInstance, DocumentAttributes } from '../Model/Interface/Index';
import { DocumentFilters } from '../Common/Filters.e';
// import { BoFactory } from '../../Base/Business/Index';
// import * as hrmBO from '../../HRM/Business/Index';

export class DocumentBo extends BaseBo<DocumentInstance, DocumentAttributes>  {
    public async AddDocument(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let file = this.Request.file;
        if (file) {
            req.Data.DocumentPath = file.path;
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }
    public async UpdateDocument(req: BaseRequest): Promise<boolean> {
        // console.log('******************************************', req.Data);
        let file = this.Request.file;
        if (file) {
            req.Data.DocumentPath = file.path;
        }
        // this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDocumentById(req: BaseRequest): Promise<DocumentAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['Id', 'FirstName', 'MiddleName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetDocuments(apiReq?: ApiRequest<DocumentFilters>): Promise<ApiResponse<DocumentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AnnouncementFor'));
        include.push(this.GetReference('DocumentAttachmentType'));
        include.push(this.GetReference('DocumentStatus'));
        include.push({ model: this.Models.Department, attributes: ['Id', 'DepartmentCode', 'DepartmentName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['Id', 'FirstName', 'MiddleName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DocumentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DocumentFilters.GlobalWord:
                        (where as any)['$or'] = [
                            { 'DocumentTitle': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Comments': { '$like': '%' + (param.Value || '') + '%' } }
                        ];
                        break;
                    case DocumentFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case DocumentFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case DocumentFilters.DocumentStatusId:
                        where['DocumentStatusId'] = param.Value;
                        break;
                    case DocumentFilters.DepartmentId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DepartmentId'] = { '$in': paramArr };
                        }
                        break;
                    case DocumentFilters.DocumentForId:
                        where['DocumentForId'] = param.Value;
                        break;
                    case DocumentFilters.DocumentDate:
                        where['DocumentDate'] = { '$between': param.Value };
                        break;
                    case DocumentFilters.From:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$gte'] = param.Value;
                        break;
                    case DocumentFilters.To:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$lte'] = param.Value;
                        break;
                    case DocumentFilters.ExpiryDate:
                        where['ExpiryDate'] = { '$between': param.Value };
                        break;
                    case DocumentFilters.ExpiryDateFrom:
                        where['ExpiryDate'] = where['ExpiryDate'] || {};
                        (where['ExpiryDate'] as any)['$gte'] = param.Value;
                        break;
                    case DocumentFilters.ExpiryDateTo:
                        where['ExpiryDate'] = where['ExpiryDate'] || {};
                        (where['ExpiryDate'] as any)['$lte'] = param.Value;
                        break;


                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDocument(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DocumentInstance, DocumentAttributes> {
        return this.Models.Document;
    }
}
