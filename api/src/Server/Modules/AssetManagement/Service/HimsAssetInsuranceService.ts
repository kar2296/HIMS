import { BaseService, BoFactory } from '../../Base/Index';
import { AssetInsuranceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssetInsuranceAttributes } from '../Model/Interface/Index';
import { AssetInsuranceFilters } from '../Common/Filters.e';

export class AssetInsuranceService extends BaseService {
    private AssetInsuranceBo: AssetInsuranceBo;
    constructor(req?: Request) {
        super(req);
        this.AssetInsuranceBo = BoFactory.GetBo(AssetInsuranceBo, this.Request);
    }

    public async AddAssetInsurance(req: BaseRequest): Promise<number> {
        return await this.AssetInsuranceBo.AddAssetInsurance(req);
    }

    public async UpdateAssetInsurance(req: BaseRequest): Promise<boolean> {
        return await this.AssetInsuranceBo.UpdateAssetInsurance(req);
    }

    public async GetAssetInsuranceById(req: BaseRequest): Promise<AssetInsuranceAttributes> {
        return await this.AssetInsuranceBo.GetAssetInsuranceById(req);
    }

    public async GetAssetInsurances(apiReq?: ApiRequest<AssetInsuranceFilters>): Promise<ApiResponse<AssetInsuranceAttributes[]>> {
        return await this.AssetInsuranceBo.GetAssetInsurances(apiReq);
    }

    public async DeleteAssetInsurance(req: BaseRequest): Promise<Boolean> {
        return await this.AssetInsuranceBo.DeleteAssetInsurance(req);
    }
    public async PrintAssetInsurance(apiReq?: ApiRequest<AssetInsuranceFilters>): Promise<any> {
        return await this.AssetInsuranceBo.PrintAssetInsurance(apiReq);
    }
    public async PrintAssetInsuranceReport(apiReq?: ApiRequest<AssetInsuranceFilters>): Promise<any> {
        return await this.AssetInsuranceBo.PrintAssetInsuranceReport(apiReq);
    }
}
