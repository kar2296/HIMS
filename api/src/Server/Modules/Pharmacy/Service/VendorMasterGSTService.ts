import {BaseService, BoFactory} from '../../Base/Index';
import { VendorMasterGSTBo} from '../Business/Index';
import {ApiRequest, BaseRequest } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { VendorMasterGSTAttributes} from '../Model/Interface/Index';
import { VendorMasterGSTFilters } from '../Common/Filters.e';

export class VendorMasterGSTService extends BaseService {
    private VendorMasterGSTBo: VendorMasterGSTBo;
    constructor(req?: Request) {
        super(req);
        this.VendorMasterGSTBo = BoFactory.GetBo(VendorMasterGSTBo, this.Request);
    }

    public async AddVendorMasterGST(req: BaseRequest): Promise<number> {
        return await this.VendorMasterGSTBo.AddVendorMasterGST(req);
    }

    public async UpdateVendorMasterGST(req: BaseRequest): Promise<boolean> {
        return await this.VendorMasterGSTBo.UpdateVendorMasterGST(req);
    }

    public async GetVendorMasterGSTById(req: BaseRequest): Promise<VendorMasterGSTAttributes> {
        return await this.VendorMasterGSTBo.GetVendorMasterGSTById(req);
    }

    public async GetVendorMasterGSTs(apiReq?: ApiRequest<VendorMasterGSTFilters>): Promise<Array<VendorMasterGSTAttributes>> {
        return await this.VendorMasterGSTBo.GetVendorMasterGSTs(apiReq);
    }

    public async DeleteVendorMasterGST(req: BaseRequest): Promise<Boolean> {
        return await this.VendorMasterGSTBo.DeleteVendorMasterGST(req);
    }
}
