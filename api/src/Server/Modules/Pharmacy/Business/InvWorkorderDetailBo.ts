import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { InvWorkorderDetailInstance, InvWorkorderDetailAttributes } from '../Model/Interface/Index';
import { InvWorkorderDetailFilters } from '../Common/Filters.e';

export class InvWorkorderDetailBo extends BaseBo<InvWorkorderDetailInstance, InvWorkorderDetailAttributes>  {
    public async AddInvWorkorderDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateInvWorkorderDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageInvWorkorderDetails
        (InvWorkorderId: number, details: InvWorkorderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.InvWorkorderId = InvWorkorderId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetInvWorkorderDetailById(req: BaseRequest): Promise<InvWorkorderDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetInvWorkorderDetails(apiReq?: ApiRequest<InvWorkorderDetailFilters>):
        Promise<ApiResponse<InvWorkorderDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.InvWorkorder, as: 'InvWorkorder', required: false });
        include.push(this.GetReference('DiscountMode'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case InvWorkorderDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case InvWorkorderDetailFilters.InvWorkorderId:
                        where['InvWorkorderId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteInvWorkorderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<InvWorkorderDetailInstance, InvWorkorderDetailAttributes> {
        return this.Models.InvWorkorderDetail;
    }

}
