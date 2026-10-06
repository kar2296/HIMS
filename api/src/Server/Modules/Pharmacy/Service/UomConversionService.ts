import { BaseService, BoFactory } from '../../Base/Index';
import { UomConversionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { UomConversionAttributes } from '../Model/Interface/Index';
import { UomConversionFilters } from '../Common/Filters.e';

export class UomConversionService extends BaseService {
    private UomConversionBo: UomConversionBo;
    constructor(req?: Request) {
        super(req);
        this.UomConversionBo = BoFactory.GetBo(UomConversionBo, this.Request);
    }

    public async AddUomConversion(req: BaseRequest): Promise<number> {
        return await this.UomConversionBo.AddUomConversion(req);
    }

    public async UpdateUomConversion(req: BaseRequest): Promise<boolean> {
        return await this.UomConversionBo.UpdateUomConversion(req);
    }

    public async ManageUomConversions(req: BaseRequest): Promise<boolean> {
        return await this.UomConversionBo.ManageUomConversions(req);
    }

    public async GetUomConversionById(req: BaseRequest): Promise<UomConversionAttributes> {
        return await this.UomConversionBo.GetUomConversionById(req);
    }

    public async GetUomConversions(apiReq?: ApiRequest<UomConversionFilters>): Promise<ApiResponse<UomConversionAttributes[]>> {
        return await this.UomConversionBo.GetUomConversions(apiReq);
    }

    public async DeleteUomConversion(req: BaseRequest): Promise<Boolean> {
        return await this.UomConversionBo.DeleteUomConversion(req);
    }
}
