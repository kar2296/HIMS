import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualMedicineOrderDetailInstance, VirtualMedicineOrderDetailAttributes } from '../Model/Interface/Index';
import { VirtualMedicineOrderDetailFilters } from '../Common/Filters.e';

export class VirtualMedicineOrderDetailBo extends BaseBo<VirtualMedicineOrderDetailInstance, VirtualMedicineOrderDetailAttributes> {
    public async AddVirtualMedicineOrderDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVirtualMedicineOrderDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageVirtualMedicineOrderDetail(MedicineOrderid: number,
        details: VirtualMedicineOrderDetailAttributes[]): Promise<boolean> {
        details = details;
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.MedicineOrderId = MedicineOrderid;
                if (detail.Status === 2 && Number(detail.Id) !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (Number(detail.Id) === 0) {
                    await this.Save(detail);
                } else if (Number(detail.Id) > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetVirtualMedicineOrderDetailById(req: BaseRequest): Promise<VirtualMedicineOrderDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVirtualMedicineOrderDetails(apiReq?: ApiRequest<VirtualMedicineOrderDetailFilters>):
        Promise<ApiResponse<VirtualMedicineOrderDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        // include.push({ model: this.Models.VirtualMedicineOrder,attributes: ['Id', 'DoctorId', 'PatientId'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualMedicineOrderDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualMedicineOrderDetailFilters.MedicineOrderId:
                        where['MedicineOrderId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualMedicineOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public GetModel(): SStatic.Model<VirtualMedicineOrderDetailInstance, VirtualMedicineOrderDetailAttributes> {
        return this.Models.VirtualMedicineOrderDetail;
    }
}
