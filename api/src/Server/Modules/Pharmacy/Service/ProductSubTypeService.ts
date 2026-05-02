import { BaseService, BoFactory } from '../../Base/Index';
import { ProductSubTypeBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ProductSubTypeAttributes } from '../Model/Interface/Index';
import { ProductSubTypeFilters } from '../Common/Filters.e';

export class ProductSubTypeService extends BaseService {
    private ProductSubTypeBo: ProductSubTypeBo;
    constructor(req?: Request) {
        super(req);
        this.ProductSubTypeBo = BoFactory.GetBo(ProductSubTypeBo, this.Request);
    }

    public async AddProductSubType(req: BaseRequest): Promise<number> {
        return await this.ProductSubTypeBo.AddProductSubType(req);
    }

    public async UpdateProductSubType(req: BaseRequest): Promise<boolean> {
        return await this.ProductSubTypeBo.UpdateProductSubType(req);
    }

    public async GetProductSubTypeById(req: BaseRequest): Promise<ProductSubTypeAttributes> {
        return await this.ProductSubTypeBo.GetProductSubTypeById(req);
    }

    public async GetProductSubTypes(apiReq?: ApiRequest<ProductSubTypeFilters>): Promise<ApiResponse<ProductSubTypeAttributes[]>> {
        return await this.ProductSubTypeBo.GetProductSubTypes(apiReq);
    }

    public async DeleteProductSubType(req: BaseRequest): Promise<Boolean> {
        return await this.ProductSubTypeBo.DeleteProductSubType(req);
    }
}
