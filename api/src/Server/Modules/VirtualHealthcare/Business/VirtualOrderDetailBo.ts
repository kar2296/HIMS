import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualOrderDetailInstance, VirtualOrderDetailAttributes } from '../Model/Interface/Index';
import { VirtualOrderDetailFilters } from '../Common/Filters.e';

export class VirtualOrderDetailBo extends BaseBo<VirtualOrderDetailInstance, VirtualOrderDetailAttributes> {
    public async AddVirtualOrderDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVirtualOrderDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageVirtualOrderDetail(virtualorderid: number, details: VirtualOrderDetailAttributes[]): Promise<boolean> {
        details = details;
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.VirtualOrderId = virtualorderid;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetVirtualOrderDetailById(req: BaseRequest): Promise<VirtualOrderDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVirtualOrderDetails(apiReq?: ApiRequest<VirtualOrderDetailFilters>):
        Promise<ApiResponse<VirtualOrderDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.VirtualOrder, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualOrderDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualOrderDetailFilters.VirtualOrderId:
                        where['VirtualOrderId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public GetModel(): SStatic.Model<VirtualOrderDetailInstance, VirtualOrderDetailAttributes> {
        return this.Models.VirtualOrderDetail;
    }
}
