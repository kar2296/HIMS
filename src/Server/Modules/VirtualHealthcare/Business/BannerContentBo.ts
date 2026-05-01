import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { BannerContentInstance, BannerContentAttributes } from '../Model/Interface/Index';
import { BannerContentFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class BannerContentBo extends BaseBo<BannerContentInstance, BannerContentAttributes> implements IOptionProvider {
    public async AddBannerContent(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.Attachment = file.path;
        }
        let result = await this.Save(req.Data);
        let TravelManagementId = result.dataValues.Id;
        return TravelManagementId;
    }

    public async UpdateBannerContent(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.Attachment = file.path;
        }
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetBannerContentById(req: BaseRequest): Promise<BannerContentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBannerContents(apiReq?: ApiRequest<BannerContentFilters>): Promise<ApiResponse<BannerContentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.VirtualCategory, attributes: ['CategoryName'], required: false });
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
                    case BannerContentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BannerContentFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case BannerContentFilters.CategoryId:
                        where['CategoryId'] = param.Value;
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

    public async GetAttachmentFile(req: BaseRequest): Promise<any> {
        if (req.Data && req.Data.Attachment) {
            let fs = require('fs');
            if (fs.existsSync(req.Data.Attachment)) {
                let fileBuff = await readFileSync(req.Data.Attachment);
                let logoBase64 = new Buffer(fileBuff).toString('base64');
                return { Id: req.Data.Id, Attachment: logoBase64 };
            }
        }
        return null;
    }


    public async DeleteBannerContent(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<BannerContentFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['BannerContentName', 'Text'], 'BannerContentName', 'BannerContentCode',
            'Description'];
        let val = await this.GetBannerContents(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<BannerContentInstance, BannerContentAttributes> {
        return this.Models.BannerContent;
    }
}
