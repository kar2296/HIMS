import { BaseService, BoFactory } from '../../Base/Index';
import { LISInterfaceBo } from '../Business/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LISInterfaceResultAttributes } from '../Model/Interface/Index';
import { LISInterfaceResultsFilters } from '../Common/Filters.e';
import { Request } from '../../../Core/Index';

export class LISInterfaceService extends BaseService {
    private LISInterfaceBo: LISInterfaceBo;
    constructor(req?: Request) {
        super(req);
        this.LISInterfaceBo = BoFactory.GetBo(LISInterfaceBo, this.Request);
    }

    public async GetEquipmentList(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceBo.GetEquipmentList(req);
    }

    public async AddLISResult(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceBo.AddLISResult(req);
    }

    public async AddLISImage(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceBo.AddLISImage(req);
    }

    public async GetLISResults(apiReq?: ApiRequest<LISInterfaceResultsFilters>):
        Promise<ApiResponse<LISInterfaceResultAttributes[]>> {
        return await this.LISInterfaceBo.GetLISResults(apiReq);
    }

    public async GetLISImages(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceBo.GetLISImages(req);
    }

    public async GetLISRequest(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceBo.GetLISRequest(req);
    }

    public async UpdateLISRequest(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceBo.UpdateLISRequest(req);
    }

    public async DeleteLISResults(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceBo.DeleteLISResults(req);
    }

}
