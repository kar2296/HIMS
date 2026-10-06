import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as ModifiedBillBO from '../../BillModification/Business/Index';
import * as ActualBillBO from '../../Billing/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import { PatientPaymentDetailsFilters } from '../../Billing/Common/Filters.e';
import { ModifiedPatientBillsFilters } from '../Common/Filters.e';
import { ModifiedPatientBillsInstance, ModifiedPatientBillsAttributes } from '../Model/Interface/Index';

export class ModifiedPatientBillsBo extends BaseBo<ModifiedPatientBillsInstance, ModifiedPatientBillsAttributes>  {
    public async AddModifiedPatientBills(req: BaseRequest): Promise<number> {
        req.Data.Header.ModifiedBillDateTime = new Date();
        let result = await this.Save(req.Data.Header);
        if (result) {
            let categoriesBO = BoFactory.GetBo(ModifiedBillBO.ModifiedPatientBillCategorysBo, this.Request);
            let ModifiedPatientBillId = result.dataValues.Id;
            await categoriesBO.ManageModifiedPatientBillCategorys(ModifiedPatientBillId, req.Data.Details);

            let PaymentDetails: any = [];
            let paymentdetailsBo = BoFactory.GetBo(ActualBillBO.PatientPaymentDetailsBo, this.Request);
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Data.Header.EncounterId },
                    { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
                    { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }
                ]
            };
            let PaidDetails = await paymentdetailsBo.GetPatientPaymentDetails(apiReq);
            if (PaidDetails.Data.length > 0) {
                await Promise.all(PaidDetails.Data.map((DetailItem): Promise<void> => {
                    return (async (detail): Promise<void> => {
                        let PaidDetailItem = {
                            PatientReceiptId: detail.Id,
                            ReceiptDateTime: detail.ReceiptDateTime,
                            ReceiptNumber: detail.ReceiptNumber,
                            ReceiptTypeId: detail.ReceiptTypeId || 0,
                            ReceiptStatusId: detail.ReceiptStatusId || 0,
                            IsPharmacyReceipt: detail.IsPharmacyReceipt || 0,
                            PharmacyReceiptTypeId: detail.PharmacyReceiptTypeId || 0,
                            ReceiptGeneratedById: detail.ReceiptGeneratedById || 0,
                            ReceiptApprovedById: detail.ReceiptApprovedById || 0,
                            ModifiedPatientBillId: ModifiedPatientBillId || 0,
                            PatientBillId: req.Data.Header.PatientBillId || 0,
                            BillTypeId: 2,
                            PatientId: detail.PatientId || 0,
                            TransferPatientId: detail.TransferPatientId || 0,
                            PatientTypeId: 0,
                            PatientName: detail.PatientName,
                            EncounterId: detail.EncounterId || 0,
                            TransferEncounterId: detail.TransferEncounterId || 0,
                            EncounterTypeId: detail.EncounterTypeId || 0,
                            FamilyLinkId: detail.FamilyLinkId || 0,
                            GuarantorId: detail.GuarantorId || 0,
                            GuarantorTypeId: detail.GuarantorTypeId || 0,
                            GurantorName: detail.GurantorName,
                            DepartmentId: detail.DepartmentID || 0,
                            FacilityId: detail.FacilityId || 1,
                            OrganizationId: detail.OrganizationId || 1,
                            AmountPaid: detail.AmountPaid || 0,
                            AmountAdjusted: detail.AmountAdjusted || 0,
                            TDSAmount: detail.TDSAmount || 0,
                            DisAllowance: detail.Disallowance || 0,
                            RoundOffValue: detail.RoundOffValue || 0,
                            PaymentCounterId: detail.PaymentcounterID || 0,
                            PaymentTypeId: detail.PaymentTypeId || 0,
                            PaymentStatusId: detail.PaymentStatusId || 0,
                            CurrencyTypeId: detail.CurrencyTypeId || 0,
                            IsConsolidatePay: detail.IsConsolidatePay || 0,
                            IsClaimed: detail.IsClaimed || 0,
                            TerminalNoId: detail.TerminalNoId || 0,
                            BankId: detail.BankId || 0,
                            CardTypeId: detail.CardTypeId || 0,
                            CardNumber: detail.CardNumber,
                            CardExpiryDate: detail.CardExpiryDate,
                            CardHolderName: detail.CardHolderName,
                            AuthorizeNumber: detail.AuthorizeNumber || 0,
                            AuthorizedCode: detail.AuthorizedCode || 0,
                            ChequeNo: detail.ChequeNo || 0,
                            ChequeDate: detail.ChequeDate,
                            CollectedOn: detail.CollectedOn,
                            DDNumber: detail.DDNumber || 0,
                            DDDate: detail.DDDate,
                            WireTransferId: detail.WireTransferId || 0,
                            WireTransferDate: detail.WireTransferDate,
                            Comments: detail.Comments,
                            CancelReason: detail.CancelReason,
                            Status: 1
                        };
                        PaymentDetails.push(PaidDetailItem);
                    })(DetailItem);
                }));

                if (PaymentDetails.length > 0) {
                    let modifiedpaymentdetailsBO = BoFactory.GetBo(ModifiedBillBO.ModifiedPatientPaymentDetailsBo, this.Request);
                    await modifiedpaymentdetailsBO.ManageModifiedPatientPaymentDetails(ModifiedPatientBillId, PaymentDetails);
                }
            }

            let ExistingBillBO = BoFactory.GetBo(ActualBillBO.PatientBillsBo, this.Request);
            let ExistingBill = await ExistingBillBO.GetPatientBillsById({ Id: req.Data.Header.PatientBillId });
            ExistingBill.IsModified = true;
            await ExistingBillBO.Update(ExistingBill);

            if (req.Data.Header.EncounterId) {
                let Encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
                let EncounterData = await Encounterbo.GetEncounterById({ Id: req.Data.Header.EncounterId });
                EncounterData.IsBillModified = true;
                await Encounterbo.Update(EncounterData);
            }

            return ModifiedPatientBillId;
        }
        return 0;
    }

    public async UpdateModifiedPatientBills(req: BaseRequest): Promise<boolean> {
        return true;
    }

    public async ManageModifiedPatientBills(req: BaseRequest): Promise<boolean> {
        // let modifiedbill = await this.GetModifiedPatientBillById({ Id: req.Data.Header.Id });
        // if (req.Data.Header.Header) {
        //     modifiedbill.ModifiedBillAmount = req.Data.Header.ModifiedBillAmount;
        //     modifiedbill.ModifiedBillDiscount = req.Data.Header.ModifiedBillDiscount;
        //     modifiedbill.DiscountModeValue = req.Data.Header.DiscountModeValue;
        // } else {
        //     modifiedbill.ModifiedBillAmount = modifiedbill.ModifiedBillAmount + req.Data.Header.ModifiedBillAmount;
        // }
        // await this.Update(modifiedbill);
        // if (req.Data.Details) {
        //     let categoriesBO = BoFactory.GetBo(ModifiedBillBO.ModifiedPatientBillCategorysBo, this.Request);
        //     let ModifiedPatientBillId = req.Data.Header.Id;
        //     await categoriesBO.ManageNewlyAddedPatientBillCategorys(ModifiedPatientBillId, req.Data.Details);
        // } else if (req.Data.PaymentDetails) {
        //     let paymentsBO = BoFactory.GetBo(ModifiedBillBO.ModifiedPatientPaymentDetailsBo, this.Request);
        //     let ModifiedPatientBillId = req.Data.Header.Id;
        //     await paymentsBO.ManageModifiedPatientPaymentDetails(ModifiedPatientBillId, req.Data.PaymentDetails);
        // }

        let billSummaryBo = BoFactory.GetBo(ActualBillBO.PatientBillSummaryBo, this.Request);
        await billSummaryBo.ModifiedPatientBillSummary(req.Data.Header.EncounterId, req.Data.Details);

        return true;
    }

    public async ModifiyPatientBillDetails(req: BaseRequest): Promise<boolean> {
        /*
        let modifiedbill = await this.GetModifiedPatientBillById({ Id: req.Data.Header.Id });
        if (req.Data.Header.Header) {
            modifiedbill.ModifiedBillAmount = req.Data.Header.ModifiedBillAmount;
            modifiedbill.ModifiedBillDiscount = req.Data.Header.ModifiedBillDiscount;
            modifiedbill.DiscountModeValue = req.Data.Header.DiscountModeValue;
        } else {
            modifiedbill.ModifiedBillAmount = modifiedbill.ModifiedBillAmount + req.Data.Header.ModifiedBillAmount;
        }
        await this.Update(modifiedbill);
        */

        // if (req.Data.Details) {
        //     let categoriesBO = BoFactory.GetBo(ModifiedBillBO.ModifiedPatientBillCategorysBo, this.Request);
        //     let ModifiedPatientBillId = req.Data.Header.Id;
        //     await categoriesBO.ManageModifiedPatientBillCategorys(ModifiedPatientBillId, req.Data.Details);
        // }

        let billSummaryBo = BoFactory.GetBo(ActualBillBO.PatientBillSummaryBo, this.Request);
        await billSummaryBo.ModifiedPatientBillSummary(req.Data.Header.EncounterId, req.Data.Details);

        return true;
    }

    public async ManageModifiedOPPatientBills(req: BaseRequest): Promise<boolean> {
        let PatientBillDetails = req.Data.Details;
        let PatientPaymentDetails = req.Data.Payments;
        let opmodifypatientbill = BoFactory.GetBo(ActualBillBO.OPModifyPatBillsBo, this.Request);
        let newreq: any = {
            Data: {}
        };
        newreq.Data = req.Data.Header;
        await opmodifypatientbill.AddPatientBills(newreq);
        let opmodifypatbilldetails = BoFactory.GetBo(ActualBillBO.OPModifyPatBillDetailsBo, this.Request);
        await opmodifypatbilldetails.ManagePatientBillDetails(req.Data.Header.Id, PatientBillDetails);
        let opmodifypatpaydetails = BoFactory.GetBo(ActualBillBO.OPModifyPatPaymentDetailsBo, this.Request);
        await opmodifypatpaydetails.ManagePatientPaymentDetails(req.Data.Header.Id, PatientPaymentDetails);


        let ExistingBillBO = BoFactory.GetBo(ActualBillBO.PatientBillsBo, this.Request);
        let ExistingBill = await ExistingBillBO.GetPatientBillsById({ Id: req.Data.Header.Id });
        ExistingBill.IsModified = true;
        await ExistingBillBO.Update(ExistingBill);

        if (req.Data.Header.EncounterId) {
            let Encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let EncounterData = await Encounterbo.GetEncounterById({ Id: req.Data.Header.EncounterId });
            EncounterData.IsBillModified = true;
            await Encounterbo.Update(EncounterData);
        }

        return true;
    }

    public async ManageModifiedPharmacyPatientBills(req: BaseRequest): Promise<boolean> {
        let PatientBillDetails = req.Data.Details;
        let PatientPaymentDetails = req.Data.Payments;
        let pharmacymodifypatientbill = BoFactory.GetBo(ActualBillBO.PharmacyModifyPatBillsBo, this.Request);
        let newreq: any = {
            Data: {}
        };
        newreq.Data = req.Data.Header;
        await pharmacymodifypatientbill.AddPatientBills(newreq);
        let pharmacymodifypatbilldetails = BoFactory.GetBo(ActualBillBO.PharmacyModifyPatBillDetailsBo, this.Request);
        await pharmacymodifypatbilldetails.ManagePatientBillDetails(req.Data.Header.Id, PatientBillDetails);
        let pharmacymodifypatpaydetails = BoFactory.GetBo(ActualBillBO.PharmacyModifyPatPaymentDetailsBo, this.Request);
        await pharmacymodifypatpaydetails.ManagePatientPaymentDetails(req.Data.Header.Id, PatientPaymentDetails);


        let ExistingBillBO = BoFactory.GetBo(ActualBillBO.PatientBillsBo, this.Request);
        let ExistingBill = await ExistingBillBO.GetPatientBillsById({ Id: req.Data.Header.Id });
        ExistingBill.IsModified = true;
        await ExistingBillBO.Update(ExistingBill);

        if (req.Data.Header.EncounterId) {
            let Encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let EncounterData = await Encounterbo.GetEncounterById({ Id: req.Data.Header.EncounterId });
            EncounterData.IsBillModified = true;
            await Encounterbo.Update(EncounterData);
        }

        return true;
    }

    public async GetModifiedPatientBillById(req: BaseRequest): Promise<ModifiedPatientBillsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetModifiedPatientBillsById(apiReq?: ApiRequest<ModifiedPatientBillsFilters>):
        Promise<ApiResponse<ModifiedPatientBillsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let guarantorWhere: WhereOptions<any> = {};
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'NationalityIdentifier'],
            required: false,
            include: [
                this.GetReference('Title'), this.GetReference('Gender')
            ],
        };
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ModifiedPatientBillsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.BillPriority:
                        where['BillPriorityId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.BillType:
                        where['BillTypeId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.GuarantorId:
                        guarantorWhere['GuarantorId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ModifiedPatientBillCategorys,
            required: false,
            include: [
                { model: this.Models.ModifiedPatientBillCategoryDetails, required: false },
                { model: this.Models.ServiceCategory, required: false }
            ]
        });
        include.push({ model: this.Models.ModifiedPatientPaymentDetails, required: false });
        include.push(patientQryJoin);
        include.push({
            model: this.Models.PatientGuarantor,
            as: 'Guarantor',
            attributes: ['GuarantorName', 'GuarantorId'],
            required: false
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'AdmissionStatusId', 'DischargeDate'],
            include: [this.GetReference('AdmissionStatus')],
            required: false
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetModifiedPatientBills(apiReq?: ApiRequest<ModifiedPatientBillsFilters>):
        Promise<ApiResponse<ModifiedPatientBillsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ModifiedPatientBillsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.FirstName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case ModifiedPatientBillsFilters.LastName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case ModifiedPatientBillsFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case ModifiedPatientBillsFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value };
                        break;
                    case ModifiedPatientBillsFilters.ModifiedBillDateTime:
                        where['ModifiedBillDateTime'] = { '$between': param.Value };
                        break;
                    case ModifiedPatientBillsFilters.BillNumber:
                        where['BillNumber'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case ModifiedPatientBillsFilters.BillType:
                        where['BillTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'
                , 'AddressLine1', 'AddressLine2', 'City', 'mobile', 'Email'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'AdmissionStatusId', 'DischargeDate'],
            include: [this.GetReference('AdmissionStatus')],
            required: false
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteModifiedPatientBills(req: BaseRequest): Promise<Boolean> {
        return true;
    }

    public GetModel(): SStatic.Model<ModifiedPatientBillsInstance, ModifiedPatientBillsAttributes> {
        return this.Models.ModifiedPatientBills;
    }
}
