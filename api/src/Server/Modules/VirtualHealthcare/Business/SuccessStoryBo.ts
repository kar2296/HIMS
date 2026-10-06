import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { SuccessStoryInstance, SuccessStoryAttributes } from '../Model/Interface/Index';
import { SuccessStoryFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class SuccessStoryBo extends BaseBo<SuccessStoryInstance, SuccessStoryAttributes> implements IOptionProvider {
    public async AddSuccessStory(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.Attachment = file.path;
        }
        let result = await this.Save(req.Data);
        let SuccessStoryId = result.dataValues.Id;
        return SuccessStoryId;
    }

    public async UpdateSuccessStory(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.Attachment = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetSuccessStoryById(req: BaseRequest): Promise<SuccessStoryAttributes> {
        let result = await this.GetById(req.Id);
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('SuccessCategory'));
        include.push(this.GetReference('ActiveStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        return this.GetAttribute(result);
    }

    public async GetSuccessStorys(apiReq?: ApiRequest<SuccessStoryFilters>): Promise<ApiResponse<SuccessStoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('SuccessCategory'));
        include.push(this.GetReference('ActiveStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case SuccessStoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case SuccessStoryFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case SuccessStoryFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case SuccessStoryFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case SuccessStoryFilters.CreatedId:
                        where['CreatedId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    // public async GetAttachmentFile(req: BaseRequest, res: any): Promise<any> {
    //     let result = await res.download(req.Data.Attachment);
    //     return result;
    // }

    // public async GetAttachmentFile(req: BaseRequest): Promise<any> {
    //     let fileBuff = await readFileSync(req.Data.Attachment);
    //     let photoBase64 = new Buffer(fileBuff).toString('base64');
    //     return { Id: req.Data.Id, Attachment: photoBase64 };
    // }
    public async GetAttachmentFile(req: BaseRequest): Promise<any> {
        let fs = require('fs');
        if (fs.existsSync(req.Data.Attachment)) {
            let fileBuff = await readFileSync(req.Data.Attachment);
            let logoBase64 = new Buffer(fileBuff).toString('base64');
            return { Id: req.Data.Id, Attachment: logoBase64 };
        }
    }


    public async DeleteSuccessStory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<SuccessStoryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['SuccessStoryName', 'Text'], 'SuccessStoryName', 'SuccessStoryCode',
            'Description'];
        let val = await this.GetSuccessStorys(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<SuccessStoryInstance, SuccessStoryAttributes> {
        return this.Models.SuccessStory;
    }
}
