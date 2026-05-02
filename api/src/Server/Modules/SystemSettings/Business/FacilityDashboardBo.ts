import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { FileInfo } from '../../../Core/Index';
import { BaseRequest } from '../../../Common/Index';
import { FacilityInstance, FacilityAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as patbo from '../../Registration/Business/Index';
import * as newbornbo from '../../EMR/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as apptbo from '../../Appointment/Business/Index';
import * as billingbo from '../../Billing/Business/Index';
import * as docInvbo from '../../DoctorInvoice/Business/Index';
import * as genmastBo from '../../GeneralMaster/Business/Index';
import * as generalBO from '../../General/Business/Index';

export class FacilityDashboardBo extends BaseBo<FacilityInstance, FacilityAttributes>  {

    public async GetFacilityDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req.Data.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = this.getFacilityDashboardRegistry()[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes;
                    infoResponses[item.Key] = await bo.GetFacilityInfoDashBoard({ Data: filterAttributes || {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'FacilityDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public async GetFacilityDashboardsReport(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req.Data.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = this.getFacilityDataRegistry()[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes;
                    infoResponses[item.Key] = await bo.GetFacilityCollectionDashBoard({ Data: filterAttributes || {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'FacilityDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public async GetFacilityVirtualDashboards(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req.Data.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = this.getFacilityAppointmentDataRegistry()[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes;
                    infoResponses[item.Key] = await bo.GetFacilityVirtualDashBoard({ Data: filterAttributes || {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'FacilityDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public async GetFacilityCovidBedDetails(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req.Data.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = this.getFacilityCovidBedDataRegistry()[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes;
                    infoResponses[item.Key] = await bo.GetFacilityCovidBedDetail({ Data: filterAttributes || {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'FacilityDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public async PrintFacilityDashboard(req: BaseRequest): Promise<FileInfo> {
        let info = this.GetFacilityDashboardOptions(req);
        let key = 'facilitydashboard';
        let Watermark = '';
        let PrintTypeId: number = 1;
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintReport(key
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 1000
                , Reason: null
                , Watermark: Watermark
                , PrintTypeId: PrintTypeId
            });
    }

    public async SendFacilityDashboardMail(req: BaseRequest): Promise<boolean> {
        return true;
    }

    public GetModel(): SStatic.Model<FacilityInstance, FacilityAttributes> {
        return this.Models.Facility;
    }

    private getFacilityDashboardRegistry(): { [key: string]: () => any } {
        return {
            encounter: () => BoFactory.GetBo(encbo.EncounterBo, this.Request),
            patient: () => BoFactory.GetBo(patbo.PatientBo, this.Request),
            appointment: () => BoFactory.GetBo(apptbo.AppointmentBo, this.Request),
            newborn: () => BoFactory.GetBo(newbornbo.NewBornDetailBo, this.Request),
            receipt: () => BoFactory.GetBo(billingbo.PatientPaymentDetailsBo, this.Request),
            billreceipt: () => BoFactory.GetBo(billingbo.PatientPaymentDetailsBo, this.Request),
            pharmacydue: () => BoFactory.GetBo(billingbo.PatientBillsBo, this.Request),
            refund: () => BoFactory.GetBo(billingbo.PatientReturnsBo, this.Request),
            billrefund: () => BoFactory.GetBo(billingbo.PatientRefundBo, this.Request),
            categorycollection: () => BoFactory.GetBo(billingbo.PatientBillDetailsBo, this.Request),
            dispense: () => BoFactory.GetBo(billingbo.PatientDispenseBo, this.Request)
        };
    }

    private getFacilityDataRegistry(): { [key: string]: () => any } {
        return {
            billreceipt: () => BoFactory.GetBo(billingbo.PatientPaymentDetailsBo, this.Request),
            billoprefund: () => BoFactory.GetBo(billingbo.PatientRefundBo, this.Request),
            docshare: () => BoFactory.GetBo(docInvbo.DoctorPaymentBo, this.Request),
            categorycollection: () => BoFactory.GetBo(billingbo.PatientBillDetailsBo, this.Request),
            billing: () => BoFactory.GetBo(billingbo.PatientBillsBo, this.Request)
        };
    }

    private getFacilityAppointmentDataRegistry(): { [key: string]: () => any } {
        return {
            virtualappointment: () => BoFactory.GetBo(apptbo.AppointmentBo, this.Request),
            encdoctor: () => BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request),
        };
    }

    private getFacilityCovidBedDataRegistry(): { [key: string]: () => any } {
        return {
            bedInfo: () => BoFactory.GetBo(genmastBo.WardRoomBedMasterBo, this.Request),
            admissionInfo: () => BoFactory.GetBo(encbo.EncounterBo, this.Request),
        };
    }
}
