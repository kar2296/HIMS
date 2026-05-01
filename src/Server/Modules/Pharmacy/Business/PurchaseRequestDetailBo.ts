import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PurchaseRequestDetailInstance, PurchaseRequestDetailAttributes } from '../Model/Interface/Index';
import { PurchaseRequestDetailFilters } from '../Common/Filters.e';

export class PurchaseRequestDetailBo extends BaseBo<PurchaseRequestDetailInstance, PurchaseRequestDetailAttributes>  {
    public async AddPurchaseRequestDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePurchaseRequestDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePurchaseRequestDetails(PurchaseRequestId: number, details: PurchaseRequestDetailAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.PurchaseRequestId = PurchaseRequestId;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetPurchaseRequestDetailById(req: BaseRequest): Promise<PurchaseRequestDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPurchaseRequestDetails(apiReq?: ApiRequest<PurchaseRequestDetailFilters>):
        Promise<ApiResponse<PurchaseRequestDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        include.push({ model: this.Models.VendorMaster, as: 'VendorMaster', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'FromStore', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({ model: this.Models.ItemVendorMap, attributes: ['MaxQty', 'MinQty'], as: 'VendorItem', required: false });
        include.push({
            model: this.Models.PurchaseRequest, as: 'PurchaseRequest', required: false,
            include: [this.GetReference('PrStatus')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PurchaseRequestDetailFilters.Id:
                        where['PurchaseRequestId'] = param.Value;
                        break;
                    case PurchaseRequestDetailFilters.PurchaseRequestId:
                        where['PurchaseRequestId'] = param.Value;
                        break;
                    case PurchaseRequestDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case PurchaseRequestDetailFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePurchaseRequestDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PurchaseRequestDetailInstance, PurchaseRequestDetailAttributes> {
        return this.Models.PurchaseRequestDetail;
    }
}
