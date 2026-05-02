import { BaseService, BoFactory } from '../../Base/Index';
import { ProductTypeBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ProductTypeAttributes } from '../Model/Interface/Index';
import { ProductTypeFilters } from '../Common/Filters.e';

export class ProductTypeService extends BaseService {
    private ProductTypeBo: ProductTypeBo;
    constructor(req?: Request) {
        super(req);
        this.ProductTypeBo = BoFactory.GetBo(ProductTypeBo, this.Request);
    }

    public async AddProductType(req: BaseRequest): Promise<number> {
        return await this.ProductTypeBo.AddProductType(req);
    }

    public async UpdateProductType(req: BaseRequest): Promise<boolean> {
        return await this.ProductTypeBo.UpdateProductType(req);
    }

    public async GetProductTypeById(req: BaseRequest): Promise<ProductTypeAttributes> {
        return await this.ProductTypeBo.GetProductTypeById(req);
    }

    public async GetProductTypes(apiReq?: ApiRequest<ProductTypeFilters>): Promise<ApiResponse<ProductTypeAttributes[]>> {
        return await this.ProductTypeBo.GetProductTypes(apiReq);
    }
    public async PrintProductTypeReport(apiReq?: ApiRequest<ProductTypeFilters>): Promise<any> {
        return await this.ProductTypeBo.PrintProductTypeReport(apiReq);
    }

    public async DeleteProductType(req: BaseRequest): Promise<Boolean> {
        return await this.ProductTypeBo.DeleteProductType(req);
    }
}
