import { BaseService, BoFactory } from '../../Base/Index';
import { VendorMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse, ISearchEnums } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VendorMasterAttributes } from '../Model/Interface/Index';
import { VendorMasterFilters } from '../Common/Filters.e';
import { VendorErpMapAttributes, VendorFacilityMapAttributes } from '../Model/Interface/Index';
import { VendorErpFilters, VendorFacilityFilters } from '../Common/Filters.e';
import { VendorContactAttributes } from '../Model/Interface/Index';
import { VendorContactFilters } from '../Common/Filters.e';

export class VendorMasterService extends BaseService {
    private VendorMasterBo: VendorMasterBo;
    constructor(req?: Request) {
        super(req);
        this.VendorMasterBo = BoFactory.GetBo(VendorMasterBo, this.Request);
    }

    public async AddVendorMaster(req: BaseRequest): Promise<number> {
        return await this.VendorMasterBo.AddVendorMaster(req);
    }

    public async AddVendorMasterExcel(req: BaseRequest): Promise<number> {
        return await this.VendorMasterBo.AddVendorMasterExcel(req);
    }

    public async UpdateVendorMaster(req: BaseRequest): Promise<boolean> {
        return await this.VendorMasterBo.UpdateVendorMaster(req);
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        return await this.VendorMasterBo.GetMaxId(req);
    }

    public async GetVendorMasterById(req: BaseRequest): Promise<VendorMasterAttributes> {
        return await this.VendorMasterBo.GetVendorMasterById(req);
    }

    public async GetVendorMasters(apiReq?: ApiRequest<VendorMasterFilters>): Promise<ApiResponse<VendorMasterAttributes[]>> {
        return await this.VendorMasterBo.GetVendorMasters(apiReq);
    }

    public async DeleteVendorMaster(req: BaseRequest): Promise<Boolean> {
        return await this.VendorMasterBo.DeleteVendorMaster(req);
    }

    public async AddVendorErpMap(req: BaseRequest): Promise<number> {
        return await this.VendorMasterBo.AddVendorErpMap(req);
    }

    public async UpdateVendorErpMap(req: BaseRequest): Promise<boolean> {
        return await this.VendorMasterBo.UpdateVendorErpMap(req);
    }

    public async GetVendorErpMapById(req: BaseRequest): Promise<VendorErpMapAttributes> {
        return await this.VendorMasterBo.GetVendorErpMapById(req);
    }
    public async GetAttachment(req: BaseRequest): Promise<VendorMasterAttributes> {
        return await this.VendorMasterBo.GetAttachment(req);
    }
    public async GetVendorErpMaps(apiReq?: ApiRequest<VendorErpFilters>): Promise<ApiResponse<VendorErpMapAttributes[]>> {
        return await this.VendorMasterBo.GetVendorErpMaps(apiReq);
    }

    public async DeleteVendorErpMap(req: BaseRequest): Promise<Boolean> {
        return await this.VendorMasterBo.DeleteVendorErpMap(req);
    }

    public async AddVendorContact(req: BaseRequest): Promise<number> {
        return await this.VendorMasterBo.AddVendorContact(req);
    }

    public async UpdateVendorContact(req: BaseRequest): Promise<boolean> {
        return await this.VendorMasterBo.UpdateVendorContact(req);
    }

    public async GetVendorContactById(req: BaseRequest): Promise<VendorContactAttributes> {
        return await this.VendorMasterBo.GetVendorContactById(req);
    }

    public async GetVendorContacts(apiReq?: ApiRequest<VendorContactFilters>): Promise<ApiResponse<VendorContactAttributes[]>> {
        return await this.VendorMasterBo.GetVendorContacts(apiReq);
    }

    public async DeleteVendorContact(req: BaseRequest): Promise<Boolean> {
        return await this.VendorMasterBo.DeleteVendorContact(req);
    }

    public async MapFacilities(req: BaseRequest): Promise<Boolean> {
        return await this.VendorMasterBo.MapFacilities(req);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<VendorFacilityMapAttributes>> {
        return await this.VendorMasterBo.GetFacilities(apiReq);
    }

    public async GetVendorFacilityMaps(apiReq?: ApiRequest<VendorFacilityFilters>): Promise<ApiResponse<VendorFacilityMapAttributes[]>> {
        return await this.VendorMasterBo.GetVendorFacilityMaps(apiReq);
    }
    public async PrintSupplierMasterReport(apiReq?: ApiRequest<VendorMasterFilters>): Promise<any> {
        return await this.VendorMasterBo.PrintSupplierMasterReport(apiReq);
    }
    public async PrintManufacturerMasterReport(apiReq?: ApiRequest<VendorMasterFilters>): Promise<any> {
        return await this.VendorMasterBo.PrintManufacturerMasterReport(apiReq);
    }
}
