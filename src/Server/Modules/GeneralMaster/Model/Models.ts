import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        Remark: SequelizeStatic.Model<i.RemarkInstance, i.RemarkAttributes>;
        ResourceMaster: SequelizeStatic.Model<i.ResourceMasterInstance, i.ResourceMasterAttributes>;
        CountryMaster: SequelizeStatic.Model<i.CountryMasterInstance, i.CountryMasterAttributes>;
        DistrictMaster: SequelizeStatic.Model<i.DistrictMasterInstance, i.DistrictMasterAttributes>;
        PatientAlert: SequelizeStatic.Model<i.PatientAlertInstance, i.PatientAlertAttributes>;
        PincodeMaster: SequelizeStatic.Model<i.PincodeMasterInstance, i.PincodeMasterAttributes>;
        Referral: SequelizeStatic.Model<i.ReferralInstance, i.ReferralAttributes>;
        ResearchProjectMember: SequelizeStatic.Model<i.ResearchProjectMemberInstance, i.ResearchProjectMemberAttributes>;
        ResearchProject: SequelizeStatic.Model<i.ResearchProjectInstance, i.ResearchProjectAttributes>;
        StateMaster: SequelizeStatic.Model<i.StateMasterInstance, i.StateMasterAttributes>;
        ReferralUserMap: SequelizeStatic.Model<i.ReferralUserMapInstance, i.ReferralUserMapAttributes>;
        Guarantor: SequelizeStatic.Model<i.GuarantorInstance, i.GuarantorAttributes>;
        GuarantorGST: SequelizeStatic.Model<i.GuarantorGSTInstance, i.GuarantorGSTAttributes>;
        LocationMaster: SequelizeStatic.Model<i.LocationMasterInstance, i.LocationMasterAttributes>;
        WardMaster: SequelizeStatic.Model<i.WardMasterInstance, i.WardMasterAttributes>;
        WardUserMap: SequelizeStatic.Model<i.WardUserMapInstance, i.WardUserMapAttributes>;
        RoomTypeMaster: SequelizeStatic.Model<i.RoomTypeMasterInstance, i.RoomTypeMasterAttributes>;
        WardRoomMaster: SequelizeStatic.Model<i.WardRoomMasterInstance, i.WardRoomMasterAttributes>;
        WardRoomBedMaster: SequelizeStatic.Model<i.WardRoomBedMasterInstance, i.WardRoomBedMasterAttributes>;
        WardRoomServiceMap: SequelizeStatic.Model<i.WardRoomServiceMapInstance, i.WardRoomServiceMapAttributes>;
        CityMaster: SequelizeStatic.Model<i.CityMasterInstance, i.CityMasterAttributes>;
        PatientAlertReview: SequelizeStatic.Model<i.PatientAlertReviewInstance, i.PatientAlertReviewAttributes>;
        FeedbacksMaster: SequelizeStatic.Model<i.FeedbacksMasterInstance, i.FeedbacksMasterAttributes>;
        GuarantorSupplementary: SequelizeStatic.Model<i.GuarantorSupplementaryInstance, i.GuarantorSupplementaryAttributes>;
        GuarantorChecklist: SequelizeStatic.Model<i.GuarantorChecklistInstance, i.GuarantorChecklistAttributes>;
        ReferralCharge: SequelizeStatic.Model<i.ReferralChargeInstance, i.ReferralChargeAttributes>;
        CardMaster: SequelizeStatic.Model<i.CardMasterInstance, i.CardMasterAttributes>;
        GuarantorAgreement: SequelizeStatic.Model<i.GuarantorAgreementInstance, i.GuarantorAgreementAttributes>;
        GuarantorCardType: SequelizeStatic.Model<i.GuarantorCardTypeInstance, i.GuarantorCardTypeAttributes>;
        GuarantorCustomer: SequelizeStatic.Model<i.GuarantorCustomerInstance, i.GuarantorCustomerAttributes>;
        GuarantorCustomerCard: SequelizeStatic.Model<i.GuarantorCustomerCardInstance, i.GuarantorCustomerCardAttributes>;
        GuarantorCustomerCardDeductable: SequelizeStatic.Model<i.GuarantorCustomerCardDeductableInstance,
            i.GuarantorCustomerCardDeductableAttributes>;
        Occupation: SequelizeStatic.Model<i.OccupationInstance, i.OccupationAttributes>;
        CheckList: SequelizeStatic.Model<i.CheckListInstance, i.CheckListAttributes>;
        ClinicalRemark: SequelizeStatic.Model<i.ClinicalRemarkInstance, i.ClinicalRemarkAttributes>;
        SystemMaster: SequelizeStatic.Model<i.SystemMasterInstance, i.SystemMasterAttributes>;
        WardInsuranceTariff: SequelizeStatic.Model<i.WardInsuranceTariffInstance, i.WardInsuranceTariffAttributes>;
    }
}
