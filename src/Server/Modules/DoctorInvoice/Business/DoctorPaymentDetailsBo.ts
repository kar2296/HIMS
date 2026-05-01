import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DoctorPaymentDetailsInstance, DoctorPaymentDetailsAttributes } from '../Model/Interface/Index';
import { DoctorPaymentDetailsFilters } from '../Common/Filters.e';
import * as doctorBo from '../../DoctorInvoice/Business/Index';

export class DoctorPaymentDetailsBo extends BaseBo<DoctorPaymentDetailsInstance,
    DoctorPaymentDetailsAttributes> {
    public async AddDoctorPaymentDetails(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Save(req.Data.Header);
        return result.dataValues.Id;
    }

    public async UpdateDoctorPaymentDetails(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async GetDoctorPaymentDetailsById(req: BaseRequest): Promise<DoctorPaymentDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageDoctorPaymentDetails(DoctorPaymentId: number, TotalPaymentAmount: number,
        details: DoctorPaymentDetailsAttributes[]) {
        details = details || [];
        let InvoiceBo = BoFactory.GetBo(doctorBo.DoctorInvoiceBo, this.Request);
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (Detail): Promise<void> => {
                let detail: any = Detail;
                detail.Id = detail.Id || 0;
                detail.DoctorPaymentId = DoctorPaymentId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let savedDetails = await this.Save(detail);
                    detail.Id = savedDetails.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
                let InvoiceInfo = await InvoiceBo.GetDoctorInvoiceById({ Id: detail.DoctorInvoiceId });
                if (detail.PaymentStatusId === 2 || detail.PaymentStatusId === 3) {
                    if (InvoiceInfo.IsFullyPaid === 0) {
                        InvoiceInfo.IsFullyPaid = detail['IsFullyPaid'];
                        InvoiceInfo.AmountPaid = detail['AmountPaid'];
                        InvoiceInfo.DueAmount = detail['DueAmount'];
                    }
                } else if (detail.PaymentStatusId === 4) {
                    InvoiceInfo.AmountPaid = 0;
                    InvoiceInfo.DueAmount = InvoiceInfo.InvoiceAmount;
                    InvoiceInfo.IsFullyPaid = 0;
                }
                await InvoiceBo.Update(InvoiceInfo);
            })(DetailItem);
        }));
        return true;
    }
    public async GetDoctorPaymentDetails(apiReq?: ApiRequest<DoctorPaymentDetailsFilters>):
        Promise<ApiResponse<DoctorPaymentDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('PaymentStatus'));
        include.push({
            model: this.Models.DoctorPayment, required: false,
            include: [
                this.GetReference('PaymentType'),
                {
                    model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
                    include: [
                        this.GetReference('Title')]
                }
            ]
        });
        include.push({
            model: this.Models.DoctorInvoice, required: false,
            include: [
                this.GetReference('DoctorInvoiceStatus')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DoctorPaymentDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DoctorPaymentDetailsFilters.DoctorPaymentId:
                        where['DoctorPaymentId'] = param.Value;
                        break;
                    case DoctorPaymentDetailsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case DoctorPaymentDetailsFilters.DoctorInvoiceId:
                        where['DoctorInvoiceId'] = param.Value;
                        break;
                    default:
                        throw ('Not Implemented');
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDoctorPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DoctorPaymentDetailsInstance, DoctorPaymentDetailsAttributes> {
        return this.Models.DoctorPaymentDetails;
    }
}
