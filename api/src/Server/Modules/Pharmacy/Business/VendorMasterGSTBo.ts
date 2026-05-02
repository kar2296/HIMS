import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions } from '../../../Core/Index';
import { Paginator, BaseRequest, ApiRequest } from '../../../Common/Index';
import { VendorMasterGSTInstance, VendorMasterGSTAttributes } from '../Model/Interface/Index';
import { VendorMasterGSTFilters } from '../Common/Filters.e';

export class VendorMasterGSTBo extends BaseBo<VendorMasterGSTInstance, VendorMasterGSTAttributes> {
    public async AddVendorMasterGST(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVendorMasterGST(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVendorMasterGSTById(req: BaseRequest): Promise<VendorMasterGSTAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVendorMasterGSTs(apiReq?: ApiRequest<VendorMasterGSTFilters>): Promise<Array<VendorMasterGSTAttributes>> {
        let where: WhereOptions<any> = {};
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case VendorMasterGSTFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case VendorMasterGSTFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case VendorMasterGSTFilters.VendorMasterId:
                    where['VendorMasterId'] = param.Value;
                    break;
                case VendorMasterGSTFilters.VendorFacilityMapId:
                    where['VendorFacilityMapId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);
    }

    public async DeleteVendorMasterGST(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VendorMasterGSTInstance, VendorMasterGSTAttributes> {
        return this.Models.VendorMasterGST;
    }
}
