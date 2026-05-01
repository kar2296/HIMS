import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DoctorInvoiceDetailsInstance, DoctorInvoiceDetailsAttributes } from '../Model/Interface/Index';
import { DoctorInvoiceDetailsFilters } from '../Common/Filters.e';
import * as billBo from '../../Billing/Business/Index';


export class DoctorInvoiceDetailsBo extends BaseBo<DoctorInvoiceDetailsInstance,
    DoctorInvoiceDetailsAttributes> {
    public async AddDoctorInvoiceDetails(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Save(req.Data.Header);
        return result.dataValues.Id;
    }

    public async UpdateDoctorInvoiceDetails(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async GetDoctorInvoiceDetailsById(req: BaseRequest): Promise<DoctorInvoiceDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageInvoiceDetails(DoctorInvoiceId: number, details: DoctorInvoiceDetailsAttributes[]) {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let isDeletedInvoice: boolean = false;
                detail.Id = detail.Id || 0;
                detail.DoctorInvoiceId = DoctorInvoiceId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    isDeletedInvoice = true;
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    isDeletedInvoice = false;
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    isDeletedInvoice = detail.InvoiceStatusId === 3;
                    await this.Update(detail);
                }
                if (detail.PatientBillDetailId > 0) {
                    let patientDetailBo = BoFactory.GetBo(billBo.PatientBillDetailsBo, this.Request);
                    let PatientBillDetail: any = {
                        Id: detail.PatientBillDetailId,
                        IsInvoicedDoctorShare: !isDeletedInvoice ? 1 : 0
                    };
                    patientDetailBo.Update(PatientBillDetail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetDoctorInvoiceDetails(apiReq?: ApiRequest<DoctorInvoiceDetailsFilters>):
        Promise<ApiResponse<DoctorInvoiceDetailsAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.PatientBillDetails,
            include: [{
                model: this.Models.PatientBills,
                attributes: ['BillNumber', 'PatientName', 'DoctorName', 'PatientOrderId',
                    'BillTypeId', 'BillDateTime', 'DepartmentId', 'BillDiscount'],
                required: false,
                include: [{
                    model: this.Models.Department, as: 'Department',
                    attributes: ['DepartmentName', 'DepartmentId'],
                    required: false
                },
                {
                    model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                        'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                        'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                    required: false,
                    include: [this.GetReference('Title'), this.GetReference('Gender')],
                }]
            }],
            required: false
        });
        include.push(this.GetReference('InvoiceStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DoctorInvoiceDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DoctorInvoiceDetailsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case DoctorInvoiceDetailsFilters.DoctorInvoiceId:
                        where['DoctorInvoiceId'] = param.Value;
                        break;
                    case DoctorInvoiceDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    default:
                        throw ('Not Implemented');
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDoctorInvoiceDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DoctorInvoiceDetailsInstance, DoctorInvoiceDetailsAttributes> {
        return this.Models.DoctorInvoiceDetails;
    }
}
