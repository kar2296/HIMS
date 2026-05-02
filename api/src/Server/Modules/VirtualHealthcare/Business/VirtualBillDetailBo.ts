import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualBillDetailInstance, VirtualBillDetailAttributes } from '../Model/Interface/Index';
import { VirtualBillDetailFilters } from '../Common/Filters.e';

export class VirtualBillDetailBo extends BaseBo<VirtualBillDetailInstance, VirtualBillDetailAttributes> {
    public async AddVirtualBillDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVirtualBillDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageVirtualBillDetail(VirtualBillId: number, details: VirtualBillDetailAttributes[]): Promise<boolean> {
        details = details;
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.VirtualBillId = VirtualBillId;
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

    public async GetVirtualBillDetailById(req: BaseRequest): Promise<VirtualBillDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVirtualBillDetails(apiReq?: ApiRequest<VirtualBillDetailFilters>):
        Promise<ApiResponse<VirtualBillDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        // include.push({ model: this.Models.BioMedicalWaste, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualBillDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualBillDetailFilters.VirtualBillId:
                        where['VirtualBillId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualBillDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public GetModel(): SStatic.Model<VirtualBillDetailInstance, VirtualBillDetailAttributes> {
        return this.Models.VirtualBillDetail;
    }
}
