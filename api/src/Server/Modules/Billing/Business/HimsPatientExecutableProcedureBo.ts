import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientExecutableProcedureInstance, PatientExecutableProcedureAttributes } from '../Model/Interface/Index';
import { PatientExecutableProcedureFilters } from '../Common/Filters.e';
import * as BillingBo from '../../Billing/Business/Index';
import * as PatientEMRBo from '../../EMR/Business/Index';

export class PatientExecutableProcedureBo extends BaseBo<PatientExecutableProcedureInstance,
PatientExecutableProcedureAttributes> implements IOptionProvider {
    public async AddPatientExecutableProcedure(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientExecutableProcedure(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientExecutableProcedure(PatientBillId: number, PatientBillDetailId: number, req: any): Promise<void> {
        if (PatientBillId > 0 && PatientBillDetailId > 0) {
            let PatientId: number;
            let EncounterId: number;
            let DoctorId: number;
            let BillNumber: String;
            let BillDateTime: Date;
            let BillTypeId: number;
            let BillsRaisedFromId: number;
            if (PatientBillId) {
                let PatientBillsBO = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
                let PatientBillsData = await PatientBillsBO.GetPatientBillsById({ Id: PatientBillId });
                if (PatientBillsData) {
                    PatientId = PatientBillsData.PatientId;
                    EncounterId = PatientBillsData.EncounterId;
                    DoctorId = PatientBillsData.DoctorId;
                    BillNumber = PatientBillsData.BillNumber;
                    BillDateTime = PatientBillsData.BillDateTime;
                    BillTypeId = PatientBillsData.BillTypeId;
                }
            }

            if (BillTypeId === 5) {
                BillsRaisedFromId = 2;
            } else {
                BillsRaisedFromId = 1;
            }

            let PatientBillDetailsBo = BoFactory.GetBo(BillingBo.PatientBillDetailsBo, this.Request);
            let PatientBillDetailsData = await PatientBillDetailsBo.GetPatientBillDetailsById({ Id: PatientBillDetailId });

            let ExecutableProcedureInfo = req[0];
            let ExecutableProcedureDetail: any = {};
                ExecutableProcedureDetail = {
                Id: 0,
                FacilityId: ExecutableProcedureInfo.FacilityId,
                PatientBillId: PatientBillId,
                BillNumber: BillNumber,
                BillDateTime: BillDateTime,
                PatientBillDetailId: PatientBillDetailId,
                EncounterId: EncounterId,
                DoctorId: DoctorId,
                PatientId: PatientId,
                ServiceId: PatientBillDetailsData.ServiceId,
                ServiceName: PatientBillDetailsData.ServiceName,
                ServiceCategoryId: PatientBillDetailsData.ServiceCategoryId,
                DepartmentId: PatientBillDetailsData.DepartmentId,
                PatientBillStatusId: PatientBillDetailsData.PatientBillStatusId,
                Quantity: PatientBillDetailsData.Quantity,
                Rate: PatientBillDetailsData.Rate,
                Amount: PatientBillDetailsData.Amount,
                DiscountPercentage: PatientBillDetailsData.DiscountPercentage,
                DiscountAmount: PatientBillDetailsData.ProportionateDiscount,
                NetAmount: PatientBillDetailsData.NetAmount,
                ReceivedAmount: PatientBillDetailsData.ReceivedAmount,
                DoctorShare: PatientBillDetailsData.DoctorShare,
                ExecutableProcedureStatusId: 1,
                BillsRaisedFromId: BillsRaisedFromId
            };
            await this.Save(ExecutableProcedureDetail);
        }
    }

    public async ManagePatientExecutableProcedureFromPatientOrder(PatientOrderId: number,
        PatientOrderDetailId: number, req: any): Promise<void> {
        if (PatientOrderId > 0 && PatientOrderDetailId > 0) {
            let PatientId: number;
            let EncounterId: number;
            let DoctorId: number;
            let OrderNumber: String;
            let OrderRequestDate : Date;

            if (PatientOrderId) {
                let PatientOrderBo = BoFactory.GetBo(PatientEMRBo.PatientOrderBo, this.Request);
                let PatientOrderData = await PatientOrderBo.GetPatientOrderById({ Id: PatientOrderId });
                if (PatientOrderData) {
                    PatientId = PatientOrderData.PatientId;
                    EncounterId = PatientOrderData.EncounterId;
                    DoctorId = PatientOrderData.DoctorId;
                    OrderNumber = PatientOrderData.OrderNumber;
                    OrderRequestDate = PatientOrderData.OrderRequestDate;
                }
            }

            let PatientOrderDetailBo = BoFactory.GetBo(PatientEMRBo.PatientOrderDetailBo, this.Request);
            let PatientOrderDetailData = await PatientOrderDetailBo.GetPatientOrderDetailById({ Id: PatientOrderDetailId });

            let ExecutableProcedureInfo = req[0];
            let ExecutableProcedureDetail: any = {};
                ExecutableProcedureDetail = {
                Id: 0,
                FacilityId: ExecutableProcedureInfo.FacilityId,
                PatientOrderId: PatientOrderId,
                OrderNumber: OrderNumber,
                OrderRequestDate: OrderRequestDate,
                PatientOrderDetailId: PatientOrderDetailId,
                EncounterId: EncounterId,
                DoctorId: DoctorId,
                PatientId: PatientId,
                TestId: PatientOrderDetailData.TestId,
                TestCode: PatientOrderDetailData.TestCode,
                TestName: PatientOrderDetailData.TestName,
                DepartmentId: PatientOrderDetailData.DepartmentId,
                OrderStatusId: PatientOrderDetailData.OrderStatusId,
                Quantity: PatientOrderDetailData.Quantity,
                Rate: PatientOrderDetailData.TestPrice,
                NetAmount: PatientOrderDetailData.NetAmount,
                ExecutableProcedureStatusId: 1,
                BillsRaisedFromId: 3
            };
            await this.Save(ExecutableProcedureDetail);
        }
    }

    public async GetPatientExecutableProcedureById(req: BaseRequest): Promise<PatientExecutableProcedureAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientExecutableProcedures(
        apiReq?: ApiRequest<PatientExecutableProcedureFilters>): Promise<ApiResponse<PatientExecutableProcedureAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ExecutableProcedureStatus'));
        include.push(this.GetReference('PatientBillStatus'));
        include.push({
            model: this.Models.Patient,
            attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'NationalityIdentifier', 'ReferrerId'],
            required: false,
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ],
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'AdmissionStatusId', 'DischargeDate'], required: false
        });
        include.push({
            model: this.Models.PatientBills,
            attributes: ['PatientBillId', 'BillNumber', 'BillDateTime', 'DoctorName'], required: false
        });
        include.push({
            model: this.Models.PatientOrder,
            attributes: ['PatientOrderId', 'OrderNumber', 'OrderRequestDate', 'DoctorName'], required: false
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification',
                'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Updateduser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Executeduser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentCode',
            'DepartmentName', 'Description'], as: 'ServiceDepartment', required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientExecutableProcedureFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.BillNumber:
                        where['BillNumber'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.PatientBillDetailId:
                        where['PatientBillDetailId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.ServiceName:
                        where['ServiceName'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.PatientBillStatusId:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.ExecutableProcedureStatusId:
                        where['ExecutableProcedureStatusId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientExecutableProcedureFilters.BillsRaisedFromId:
                        where['BillsRaisedFromId'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.OrderRequestFromDate:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.OrderRequestToDate:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientExecutableProcedureFilters.OrderRequestDate:
                        where['OrderRequestDate'] = { '$between': param.Value || '' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientExecutableProcedure(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientExecutableProcedureInstance, PatientExecutableProcedureAttributes> {
        return this.Models.PatientExecutableProcedure;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientExecutableProcedureFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['PatientExecutableProcedures', 'Text'], 'PatientExecutableProcedures', 'Code'];
        let val = await this.GetPatientExecutableProcedures(apiReq);
        return { [key]: val.Data };
    }
}
