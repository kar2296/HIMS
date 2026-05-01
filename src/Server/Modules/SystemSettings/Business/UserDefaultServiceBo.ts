import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { UserDefaultServiceInstance, UserDefaultServiceAttributes } from '../Model/Interface/Index';
import { UserDefaultServiceFilters } from '../Common/Filters.e';
import * as clinicalMasterBo from '../../ClinicalMaster/Business/Index';
import * as invMasterBo from '../../Pharmacy/Business/Index';
import * as generalMasterBo from '../../GeneralMaster/Business/Index';
import { ServiceItemAliasFilters } from '../../ClinicalMaster/Common/Filters.e';

export class UserDefaultServiceBo extends BaseBo<UserDefaultServiceInstance, UserDefaultServiceAttributes>  {
    public async AddUserDefaultService(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateUserDefaultService(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageUserDefaultService(req: BaseRequest): Promise<boolean> {
        let list: UserDefaultServiceAttributes[] = req.Data || [];
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

    public async GetUserDefaultServiceById(req: BaseRequest): Promise<UserDefaultServiceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDoctorDefaultServices(req: BaseRequest): Promise<any[]> {
        let serviceItemTariffBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemTariffDetailBo, this.Request);
        let serviceItemBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemBo, this.Request);
        let gstMasterBo = BoFactory.GetBo(invMasterBo.GstMasterBo, this.Request);

        // return value
        let BillDetails: any = [];

        // req variable from client
        let NewVisit = req.Data.NewVisit;
        let GuarantorId = req.Data.GuarantorId; // GuarantorId
        let GuarantorTypeId = req.Data.GuarantorTypeId; // GuarantorTypeId
        let GuarantorServiceRateCategoryId = req.Data.GuarantorServiceRateCategoryId;
        let DoctorId = req.Data.DoctorId;
        let FacilityId = req.Data.FacilityId;
        // Self Guarantor for Default Tariff
        let SelfGuarantorId = 0;
        let SelfGuarantorServiceRateCategory = 0;
        try {
            let guarantorMasterBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
            SelfGuarantorId = await guarantorMasterBO.GetCurrentGuarantorId();
            let Guarantorobj = await guarantorMasterBO.GetGuarantorById({ Id: GuarantorId });
            if (Guarantorobj) {
                SelfGuarantorServiceRateCategory = Guarantorobj.ServiceRateCategoryId;
            }
        } catch (ex) { console.log(ex); }
        if (!SelfGuarantorId) SelfGuarantorId = 0;
        if (!SelfGuarantorServiceRateCategory) SelfGuarantorServiceRateCategory = 0;

        let facilityServiceApiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: 2, Value: DoctorId },
                { Key: 3, Value: FacilityId },
                { Key: 4, Value: 1 }, // Encounter type OP
                { Key: 5, Value: NewVisit }, // NewVisit or FollowUp
                { Key: 6, Value: GuarantorTypeId }, // GuarantorTypeId
                { Key: 7, Value: 1 }, // StatusId
                { Key: 8, Value: GuarantorId }, // GuarantorId
            ]
        };

        let AliasId: any = null;
        let AliasName: any = null;
        let EligibleDaysFrom: any = {};
        let EligibleDays: any = {};
        let NoofVisitFree: any = {};

        let DrShareTaxId_ = -1;
        let DrTaxPercentage_ = -1;
        let MasterTaxCode: any = null;

        let facilityServiceDetails = await this.GetUserDefaultServices(facilityServiceApiReq);
        await Promise.all(facilityServiceDetails.Data.map((service): Promise<void> => {
            return (async (ServiceItem): Promise<void> => {
                let SerId = ServiceItem.ServiceItemId;
                EligibleDaysFrom[SerId] = ServiceItem.EligibleDaysFrom;
                EligibleDays[SerId] = ServiceItem.EligibleDays;
                NoofVisitFree[SerId] = ServiceItem.NooFVisitFree;

                let ServiceInfo = await serviceItemBo.GetServiceItemById({ Id: ServiceItem.ServiceItemId });
                if (ServiceInfo && ServiceInfo.GstId) {
                    let GSTInfo = await gstMasterBo.GetGstMasterById({ Id: ServiceInfo.GstId });
                    if (GSTInfo && GSTInfo.Id) {
                        DrShareTaxId_ = GSTInfo.Id;
                    }
                    if (GSTInfo && GSTInfo.GstPercentage) {
                        DrTaxPercentage_ = GSTInfo.GstPercentage;
                    }
                    if (GSTInfo && GSTInfo.GstCode) {
                        MasterTaxCode = GSTInfo.GstCode;
                    }
                }
                if (!MasterTaxCode && ServiceInfo && ServiceInfo.ItemCode) {
                    MasterTaxCode = ServiceInfo.ItemCode;
                }


                if (GuarantorTypeId > 1) {
                    AliasId = null;
                    AliasName = null;
                    let apiServAliasReq = {
                        Id: 0,
                        Params: [
                            { Key: ServiceItemAliasFilters.ServiceItemId, Value: ServiceInfo.Id },
                            { Key: ServiceItemAliasFilters.ExternalProviderId, Value: GuarantorId }
                        ],
                        PageContext: { PageSize: -1, PageNumber: 1 }
                    };
                    let servItmAliasBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemAliasBo, this.Request);
                    let seritmaliasdata = await servItmAliasBo.GetServiceItemAliass(apiServAliasReq);
                    if (seritmaliasdata.Data && seritmaliasdata.Data.length > 0) {
                        AliasId = seritmaliasdata.Data[0].AliasId;
                        AliasName = seritmaliasdata.Data[0].AliasName;
                    }
                }
                let serviceTariffApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: 2, Value: ServiceInfo.Id },
                        { Key: 3, Value: GuarantorServiceRateCategoryId },
                        { Key: 5, Value: req.Data.FacilityId }
                    ]
                };
                let serviceItemInfo = null;
                serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(serviceTariffApiReq);
                if (!serviceItemInfo) { // Tariff is not available Get from Self Tariff
                    let selfTariffApiReq = {
                        Id: 0,
                        PageContext: { PageSize: 50, PageNumber: 1 },
                        Params: [
                            { Key: 2, Value: ServiceInfo.Id },
                            { Key: 3, Value: SelfGuarantorServiceRateCategory },
                            { Key: 5, Value: req.Data.FacilityId }
                        ]
                    };
                    serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(selfTariffApiReq);
                }

                await Promise.all(serviceItemInfo.Data.map((ServiceTraifItem): Promise<void> => {
                    return (async (traif): Promise<void> => {
                        let BilldetailItem = {
                            BillDateTime: new Date(),
                            DiscountModeId: 0,
                            DiscountAmount: 0,
                            DiscountPercentage: 0,
                            ProportionateDiscount: 0,
                            StartDate: new Date(),
                            Quantity: 1,// No of Days is Quantity for Default Services
                            Rate: parseFloat(traif.Rate.toString()),
                            EmergencyRate: parseFloat(traif.EmergencyRate.toString()),
                            Amount: 1 * parseFloat(traif.Rate.toString()),
                            GrossAmount: 1 * parseFloat(traif.Rate.toString()),
                            NetAmount: 1 * parseFloat(traif.Rate.toString()),
                            ReceivedAmount: 1 * parseFloat(traif.Rate.toString()),
                            DoctorShareAmount: 1 * parseFloat(traif.DoctorShare.toString()),
                            DoctorShareValue: 1 * parseFloat(traif.DoctorShareValue.toString()),
                            DoctorId: req.Data.DoctorId,
                            IsPackageItem: ServiceInfo.IsPackage,
                            ServiceId: traif.ServiceItemId,
                            ServiceCode: ServiceInfo.ItemCode,
                            ServiceName: ServiceInfo.Name,
                            TestCode: ServiceInfo.ItemCode,
                            TestName: ServiceInfo.Name,
                            TestDescription: ServiceInfo.Name,
                            DepartmentId: ServiceInfo.DepartmentId,
                            SubDepartmentId: ServiceInfo.SubDepartmentId,
                            IsOrderable: ServiceInfo.IsOrderable,
                            CanDiscountProportionate: ServiceInfo.CanDiscountProportionate,
                            ServiceCategoryId: ServiceInfo.CategoryId,
                            MasterTypeId: ServiceInfo.MasterTypeId,
                            TestId: ServiceInfo.MasterItemId,
                            TestTypeId: ServiceInfo.OrderTypeId,
                            MasterItemId: ServiceInfo.MasterItemId,
                            MasterName: ServiceInfo.MasterName,
                            ServiceRateCategoryId: traif.ServiceRateCategoryId,
                            ServiceSubCategoryId: ServiceInfo.SubCategoryId,
                            ServiceGroupId: ServiceInfo.BillingGroupId,
                            EncounterId: req.Data.EncounterId,
                            PatientBillStatusId: 1,
                            IsSupplementary: 0,
                            AliasId: AliasId,
                            AliasName: AliasName,
                            DefaultFacilityEligibleDaysFrom: EligibleDaysFrom[traif.ServiceItemId],
                            DefaultFacilityEligibleDays: EligibleDays[traif.ServiceItemId],
                            DefaultFacilityNoofVisitFree: NoofVisitFree[traif.ServiceItemId],
                            CurrentDate: new Date(),
                            DoctorClassId: -1,
                            EligiblePercentage: 0,
                            SharePercentage: 0,
                            ShareAmount: 0,
                            DrShareTaxId: DrShareTaxId_,
                            DrTaxPercentage: DrTaxPercentage_,
                            DrTaxAmount: 0,
                            TaxCode: MasterTaxCode,
                        };

                        BillDetails.push(BilldetailItem);
                    })(ServiceTraifItem);
                }));
            })(service);
        }));

        return BillDetails;
    }

    public async GetUserDefaultServices(apiReq?: ApiRequest<UserDefaultServiceFilters>):
        Promise<ApiResponse<UserDefaultServiceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.ServiceItem, attributes: ['Name', 'ItemCode'], required: false,
            include: [{
                model: this.Models.ServiceItemTariffDetail,
                // attributes: ['AppointmentDisplayId', 'TokenStatusId', 'TokenNo'],
                required: false,
                include: [
                    { model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory', 'Description'], required: false }
                ]
            }]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case UserDefaultServiceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case UserDefaultServiceFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case UserDefaultServiceFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case UserDefaultServiceFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case UserDefaultServiceFilters.EncounterTypeId:
                        where['PatientTypeId'] = param.Value;
                        break;
                    case UserDefaultServiceFilters.VisitTypeId:
                        where['VisitTypeId'] = param.Value;
                        break;
                    case UserDefaultServiceFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case UserDefaultServiceFilters.StatusId:
                        where['StatusId'] = param.Value;
                        break;
                    case UserDefaultServiceFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteUserDefaultService(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<UserDefaultServiceInstance, UserDefaultServiceAttributes> {
        return this.Models.UserDefaultService;
    }

}
