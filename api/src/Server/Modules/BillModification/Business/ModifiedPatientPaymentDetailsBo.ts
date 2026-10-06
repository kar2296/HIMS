import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ModifiedPatientPaymentDetailsInstance, ModifiedPatientPaymentDetailsAttributes } from '../Model/Interface/Index';
//import { SequenceKeys } from '../../General/Common/Sequence.s';
import { ModifiedPatientPaymentDetailsFilters } from '../Common/Filters.e';
//import { EncounterFilters } from '../../Visit/Common/Filters.e';
//import { BoFactory } from '../../Base/Business/Index';

export class ModifiedPatientPaymentDetailsBo extends BaseBo<ModifiedPatientPaymentDetailsInstance,
    ModifiedPatientPaymentDetailsAttributes>  {
    public async AddModifiedPatientPaymentDetails(req: BaseRequest): Promise<number> {
        return 0;
    }

    public async UpdateModifiedPatientPaymentDetails(req: BaseRequest): Promise<boolean> {
        return true;
    }

    public async ManageModifiedPatientPaymentDetails(ModifiedPatientBillId: number, details: ModifiedPatientPaymentDetailsAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ModifiedPatientBillId = ModifiedPatientBillId;
                //detail.ReceiptDateTime = new Date();
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetModifiedPatientPaymentDetailsById(req: BaseRequest): Promise<ModifiedPatientPaymentDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetModifiedPatientPaymentDetails(apiReq?: ApiRequest<ModifiedPatientPaymentDetailsFilters>):
        Promise<ApiResponse<ModifiedPatientPaymentDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'], required: false,
        });
        include.push(this.GetReference('PaymentType'));
        include.push(this.GetReference('ReceiptStatus'));
        include.push(this.GetReference('CardType'));
        include.push(this.GetReference('Bank'));
        include.push(this.GetReference('ReceiptType'));
        include.push(this.GetReference('GuarantorType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ModifiedPatientPaymentDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ModifiedPatientPaymentDetailsFilters.ModifiedPatientBillId:
                        where['ModifiedPatientBillId'] = param.Value;
                        break;
                    case ModifiedPatientPaymentDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ModifiedPatientPaymentDetailsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case ModifiedPatientPaymentDetailsFilters.IsPharmacyReceipt:
                        where['IsPharmacyReceipt'] = param.Value;
                        break;
                    case ModifiedPatientPaymentDetailsFilters.IsConsolidatePay:
                        where['IsConsolidatePay'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteModifiedPatientPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ModifiedPatientPaymentDetailsInstance, ModifiedPatientPaymentDetailsAttributes> {
        return this.Models.ModifiedPatientPaymentDetails;
    }
}
