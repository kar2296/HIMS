import { BaseService, BoFactory } from '../../Base/Index';
import { ServiceItemBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse, ISearchEnums } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceItemAttributes, ServiceItemFacilityMapAttributes } from '../Model/Interface/Index';
import { ServiceItemFilters } from '../Common/Filters.e';

export class ServiceItemService extends BaseService {
    private ServiceItemBo: ServiceItemBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceItemBo = BoFactory.GetBo(ServiceItemBo, this.Request);
    }

    public async AddServiceItem(req: BaseRequest): Promise<number> {
        return await this.ServiceItemBo.AddServiceItem(req);
    }

    public async UpdateServiceItem(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemBo.UpdateServiceItem(req);
    }

    public async GetServiceItemById(req: BaseRequest): Promise<ServiceItemAttributes> {
        return await this.ServiceItemBo.GetServiceItemById(req);
    }

    public async GettraiffServiceItems(apiReq?: ApiRequest<ServiceItemFilters>): Promise<ApiResponse<ServiceItemAttributes[]>> {
        return await this.ServiceItemBo.GettraiffServiceItems(apiReq);
    }

    public async GetServiceItems(apiReq?: ApiRequest<ServiceItemFilters>): Promise<ApiResponse<ServiceItemAttributes[]>> {
        return await this.ServiceItemBo.GetServiceItems(apiReq);
    }
    public async GetServiceItemsforSO(apiReq?: ApiRequest<ServiceItemFilters>): Promise<ApiResponse<ServiceItemAttributes[]>> {
        return await this.ServiceItemBo.GetServiceItemsforSO(apiReq);
    }
    public async GetMinServiceItems(apiReq?: ApiRequest<ServiceItemFilters>): Promise<ApiResponse<ServiceItemAttributes[]>> {
        return await this.ServiceItemBo.GetMinServiceItems(apiReq);
    }

    public async GetServiceItemImage(apiReq?: ApiRequest<ServiceItemFilters>): Promise<ApiResponse<ServiceItemAttributes[]>> {
        return await this.ServiceItemBo.GetServiceItemImage(apiReq);
    }

    public async DeleteServiceItem(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceItemBo.DeleteServiceItem(req);
    }

    public async MapFacilities(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemBo.MapFacilities(req);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<ServiceItemFacilityMapAttributes>> {
        return (await this.ServiceItemBo.GetFacilities(apiReq)) as Array<ServiceItemFacilityMapAttributes>;
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        return await this.ServiceItemBo.GetMaxId(req);
    }
    public async PrintServiceItems(apiReq?: ApiRequest<ServiceItemFilters>): Promise<any> {
        return await this.ServiceItemBo.PrintServiceItems(apiReq);
    }
    public async PrintServiceItemsOp(apiReq?: ApiRequest<ServiceItemFilters>): Promise<any> {
        return await this.ServiceItemBo.PrintServiceItemsOp(apiReq);
    }
    public async PrintServiceItemsIP(apiReq?: ApiRequest<ServiceItemFilters>): Promise<any> {
        return await this.ServiceItemBo.PrintServiceItemsIP(apiReq);
    }
    public async PrintServiceItemRateDetails(apiReq?: ApiRequest<ServiceItemFilters>): Promise<any> {
        return await this.ServiceItemBo.PrintServiceItemRateDetails(apiReq);
    }
    public async AddServiceMasterExcel(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemBo.AddServiceMasterExcel(req);
    }
}
