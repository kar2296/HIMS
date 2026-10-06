import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OpticalGrnDetailInstance, OpticalGrnDetailAttributes } from '../Model/Interface/Index';
import { OpticalGrnDetailFilters } from '../Common/Filters.e';

export class OpticalGrnDetailBo extends BaseBo<OpticalGrnDetailInstance, OpticalGrnDetailAttributes>  {
    public async AddOpticalGrnDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOpticalGrnDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageOpticalGrnDetails(OpticalGrnId: number, request: any, details: OpticalGrnDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.OpticalGrnId = OpticalGrnId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    /*
                    if (request.Header.OpticalGrnStatusId === 2) {
                        let stockitemBO = BoFactory.GetBo(bo.OpticalStockItemBo, this.Request);
                        await stockitemBO.ManageOpticalGrnStockItem(OpticalGrnId, request, detail);
                    }
                    */
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                    /*
                    if (request.Header.OpticalGrnStatusId === 2) {
                        let stockitemBO = BoFactory.GetBo(bo.OpticalStockItemBo, this.Request);
                        await stockitemBO.ManageOpticalGrnStockItem(OpticalGrnId, request, detail);
                    }
                    */
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetOpticalGrnDetailById(req: BaseRequest): Promise<OpticalGrnDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOpticalGrnDetails(apiReq?: ApiRequest<OpticalGrnDetailFilters>):
        Promise<ApiResponse<OpticalGrnDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.OpticalItemMaster, required: false });
        include.push({ model: this.Models.VendorMaster, as: 'VendorMaster', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'StoreMaster', required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        //include.push({ model: this.Models.ItemVendorMap, as: 'VendorItem', required: false });
        //include.push({ model: this.Models.OpticalGrn, as: 'OpticalGrn', required: false });
        //include.push({ model: this.Models.PurchaseOrderDetail, as: 'PurchaseOrderDetail', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OpticalGrnDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OpticalGrnDetailFilters.OpticalGrnId:
                        where['OpticalGrnId'] = param.Value;
                        break;
                    case OpticalGrnDetailFilters.OpticalItemMasterId:
                        where['OpticalItemMasterId'] = param.Value;
                        break;
                    case OpticalGrnDetailFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteOpticalGrnDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OpticalGrnDetailInstance, OpticalGrnDetailAttributes> {
        return this.Models.OpticalGrnDetail;
    }

}
