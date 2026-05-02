import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OtPatientEquipmentsInstance, OtPatientEquipmentsAttributes } from '../Model/Interface/Index';
import { OtPatientEquipmentsFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as billingbo from '../../Billing/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';

export class OtPatientEquipmentsBo extends BaseBo<OtPatientEquipmentsInstance, OtPatientEquipmentsAttributes> {
    public async AddOtPatientEquipments(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOtPatientEquipments(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManageOtPatientEquipments(req: BaseRequest): Promise<boolean> {
        let EncounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let Encounter = await EncounterBo.GetEncounterById({ Id: req.Data.EncounterId });
        let Patientbill: any = {};
        let Header = {
            BillDateTime: new Date(),
            BillTypeId: 3,
            DepartmentId: Encounter.DepartmentId,
            PatientId: req.Data.PatientId,
            EncounterId: req.Data.EncounterId,
            EncounterTypeId: Encounter.EncounterTypeId,
            GuarantorId: Encounter.GuarantorId,
            GuarantorTypeId: Encounter.GuarantorTypeId,
            ServiceRateCategoryId: Encounter.ServiceRateCategoryId,
            DoctorId: Encounter.DoctorId,
            PatientBillStatusId: 3,
            BillAmount: 0,
            PaidAmount: 0,
            OutStandingAmount: 0,
        };
        let BillDetails = [];
        for (var idx in req.Data.Details) {
            var item: any = req.Data.Details[idx];
            if (!item.IsBilled && item.StartTime && item.StopTime) {
                var Bill: any = {
                    Id: 0,
                    BillDateTime: new Date(),
                    ServiceId: item.SelectedItem.Id,
                    ServiceName: item.SelectedItem.Name,
                    ServiceCode: item.SelectedItem.ItemCode,
                    ServiceCategoryId: item.SelectedItem.CategoryId,
                    MasterItemId: item.SelectedItem.MasterItemId,
                    EncounterId: req.Data.EncounterId,
                    PatientBillStatusId: 3,
                    MasterTypeId: item.SelectedItem.MasterTypeId,
                    Quantity: item.Quantity,
                    DiscountAmount: 0
                };
                Bill.Rate = 0;

                for (var idx1 in item.SelectedItem.ServiceItemTariffDetails) {
                    var Tariff = item.SelectedItem.ServiceItemTariffDetails[idx1];
                    if (Tariff.ServiceRateCategoryId === Encounter.ServiceRateCategoryId) {
                        Bill.Rate = Tariff.Rate;
                        Bill.DoctorShare = Tariff.DoctorShare;
                        Bill.ServiceRateCategoryId = Tariff.ServiceRateCategoryId;
                    }
                }
                Bill.GrossAmount = Bill.Quantity * parseFloat(Bill.Rate);
                Bill.Amount = (Bill.Quantity * parseFloat(Bill.Rate)) - parseFloat(Bill.DiscountAmount);
                Bill.NetAmount = (Bill.Quantity * parseFloat(Bill.Rate)) - parseFloat(Bill.DiscountAmount);
                if (Encounter.GuarantorTypeId > 1) {
                    if (item.CoPayPercent) {
                        Bill.PatNetAmount = parseFloat(Bill.NetAmount) * (item.CoPayPercent / 100);
                        Bill.InsNetAmount = parseFloat(Bill.NetAmount) - parseFloat(Bill.PatNetAmount);
                    } if (!item.CoPayPercent) {
                        Bill.InsNetAmount = parseFloat(Bill.NetAmount);
                    }
                }
                Header.BillAmount += Bill.NetAmount;
                Bill.DoctorId = Encounter.DoctorId;
                item.IsBilled = true;
                BillDetails.push(Bill);
            }
        }
        if (BillDetails.length > 0) {
            Header.OutStandingAmount = Header.BillAmount;
            Patientbill = {
                Data: {
                    Header: Header,
                    Details: BillDetails,
                    paymentDetail: []
                }
            };
            let BillBo = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            await BillBo.AddIPPatientBills(Patientbill);
        }

        let list: OtPatientEquipmentsAttributes[] = req.Data.Details || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }
    public async GetOtPatientEquipmentsById(req: BaseRequest): Promise<OtPatientEquipmentsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOtPatientEquipmentss(apiReq?: ApiRequest<OtPatientEquipmentsFilters>):
        Promise<ApiResponse<OtPatientEquipmentsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.ServiceItem, attributes: ['ItemCode', 'Name'], required: false,
        });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false, });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description',
                'ServiceRateCategoryId'], required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OtPatientEquipmentsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OtPatientEquipmentsFilters.OtRegisterId:
                        where['OtRegisterId'] = param.Value;
                        break;
                    case OtPatientEquipmentsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case OtPatientEquipmentsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeleteOtPatientEquipments(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintOtPatientEquipments(apiReq?: ApiRequest<OtPatientEquipmentsFilters>): Promise<any> {
        let data = await this.GetOtPatientEquipmentss(apiReq);
        let EquipmentUsage = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let EncounterId = apiReq.Data.EncounterId;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            EquipmentUsage: EquipmentUsage,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            Encounter: Encounter
        };
        let pdfOption: any = null;
        let key = 'equipmentusage';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/assets/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<OtPatientEquipmentsInstance, OtPatientEquipmentsAttributes> {
        return this.Models.OtPatientEquipments;
    }
}
