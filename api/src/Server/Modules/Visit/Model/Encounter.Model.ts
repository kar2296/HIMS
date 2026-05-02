import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EncounterInstance, i.EncounterAttributes> {
    var Encounter = sequelize.define<i.EncounterInstance, i.EncounterAttributes>('Encounter', {
        Id: { type: DataTypes.BIGINT, field: 'EncounterId', primaryKey: true, autoIncrement: true },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        VisitIdentifier: { type: DataTypes.BIGINT, field: 'VisitIdentifier' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        SecondaryDoctorId: { type: DataTypes.BIGINT, field: 'SecondaryDoctorId' },
        SecondaryDoctorName: { type: DataTypes.STRING, field: 'SecondaryDoctorName' },
        SpecialityId: { type: DataTypes.BIGINT, field: 'SpecialityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
        ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
        ReferralTypeId: { type: DataTypes.BIGINT, field: 'ReferralTypeId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        AdmissionDate: { type: DataTypes.DATE, field: 'AdmissionDate' },
        DischargeDate: { type: DataTypes.DATE, field: 'DischargeDate' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        TokenId: { type: DataTypes.BIGINT, field: 'TokenId' },
        AdmissionRequestTypeId: { type: DataTypes.BIGINT, field: 'AdmissionRequestTypeId' },
        ArrivedDate: { type: DataTypes.DATE, field: 'ArrivedDate' },
        CallDate: { type: DataTypes.DATE, field: 'CallDate' },
        SurgeryDate: { type: DataTypes.DATE, field: 'SurgeryDate' },
        ExpectedDischargeDate: { type: DataTypes.DATE, field: 'ExpectedDischargeDate' },
        DeathDate: { type: DataTypes.DATE, field: 'DeathDate' },
        BookingId: { type: DataTypes.BIGINT, field: 'BookingId' },
        AdmissionRequestId: { type: DataTypes.BIGINT, field: 'AdmissionRequestId' },
        PreviousEncounterId: { type: DataTypes.BIGINT, field: 'PreviousEncounterId' },
        IsReadmission: { type: DataTypes.BOOLEAN, field: 'IsReadmission' },
        ISMRDReturn: { type: DataTypes.BOOLEAN, field: 'ISMRDReturn' },
        IsIncompleteMRD: { type: DataTypes.BOOLEAN, field: 'IsIncompleteMRD' },
        MRDIpFileId: { type: DataTypes.BIGINT, field: 'MRDIpFileId' },
        IsLatest: { type: DataTypes.BOOLEAN, field: 'IsLatest' },
        IsDay1Discharge: { type: DataTypes.BOOLEAN, field: 'IsDay1Discharge' },
        AppointmentId: { type: DataTypes.BIGINT, field: 'AppointmentId' },
        AdmittingReasonId: { type: DataTypes.BIGINT, field: 'AdmittingReasonId' },
        DischargeTypeId: { type: DataTypes.BIGINT, field: 'DischargeTypeId' },
        ClincalStatusId: { type: DataTypes.BIGINT, field: 'ClincalStatusId' },
        AssignId: { type: DataTypes.BIGINT, field: 'AssignId' },
        AssignedGroupId: { type: DataTypes.BIGINT, field: 'AssignedGroupId' },
        VisitReasonId: { type: DataTypes.BIGINT, field: 'VisitReasonId' },
        MergedEncounterId: { type: DataTypes.BIGINT, field: 'MergedEncounterId' },
        ALOS: { type: DataTypes.INTEGER, field: 'ALOS' },
        LocationId: { type: DataTypes.INTEGER, field: 'LocationId' },
        OtherDiagnosis: { type: DataTypes.STRING, field: 'OtherDiagnosis' },
        WardId: { type: DataTypes.INTEGER, field: 'WardId' },
        RoomId: { type: DataTypes.INTEGER, field: 'RoomId' },
        BedId: { type: DataTypes.INTEGER, field: 'BedId' },
        ServiceRateCategoryId: { type: DataTypes.INTEGER, field: 'ServiceRateCategoryId' },
        DiagnosisId: { type: DataTypes.INTEGER, field: 'DiagnosisId' },
        AdmitDiagnosis: { type: DataTypes.STRING, field: 'AdmitDiagnosis' },
        AttenderName: { type: DataTypes.STRING, field: 'AttenderName' },
        GuardianTypeId: { type: DataTypes.INTEGER, field: 'GuardianTypeId' },
        AttenderPhone: { type: DataTypes.STRING, field: 'AttenderPhone' },
        AttenderName1: { type: DataTypes.STRING, field: 'AttenderName1' },
        GuardianTypeId1: { type: DataTypes.INTEGER, field: 'GuardianTypeId1' },
        AttenderPhone1: { type: DataTypes.STRING, field: 'AttenderPhone1' },
        IsMRDRequest: { type: DataTypes.BOOLEAN, field: 'IsMRDRequest' },
        IsBillLock: { type: DataTypes.BOOLEAN, field: 'IsBillLock' },
        IsAutoBillLock: { type: DataTypes.BOOLEAN, field: 'IsAutoBillLock' },
        IsEstimatedBill: { type: DataTypes.BOOLEAN, field: 'IsEstimatedBill' },
        IsWalkin: { type: DataTypes.BOOLEAN, field: 'IsWalkin' },
        PatientAdmissionRequestId: { type: DataTypes.BIGINT, field: 'PatientAdmissionRequestId' },
        PriorityTypeId: { type: DataTypes.BIGINT, field: 'PriorityTypeId' },
        IsMLC: { type: DataTypes.BOOLEAN, field: 'IsMLC' },
        MLCInfo: { type: DataTypes.STRING, field: 'MLCInfo' },
        IsOscc: { type: DataTypes.BOOLEAN, field: 'IsOscc' },
        PatientDietNbmTypeId: { type: DataTypes.BIGINT, field: 'PatientDietNbmTypeId' },
        IsBillFinalized: { type: DataTypes.BOOLEAN, field: 'IsBillFinalized' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        AdmissionPriorityId: { type: DataTypes.BIGINT, field: 'AdmissionPriorityId' },
        AdmissionPriorityTypeId: { type: DataTypes.BIGINT, field: 'AdmissionPriorityTypeId' },
        ClinicalStaffId: { type: DataTypes.BIGINT, field: 'ClinicalStaffId' },
        IsMassCasuality: { type: DataTypes.BOOLEAN, field: 'IsMassCasuality' },
        DischargeDepartmentId: { type: DataTypes.BIGINT, field: 'DischargeDepartmentId' },
        EncounterStatusId: { type: DataTypes.BIGINT, field: 'EncounterStatusId' },
        AdmissionStatusId: { type: DataTypes.BIGINT, field: 'AdmissionStatusId' },
        VisitTypeId: { type: DataTypes.BIGINT, field: 'VisitTypeId' },
        RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        PANNo: { type: DataTypes.STRING, field: 'PANNo' },
        IsPackageAssigned: { type: DataTypes.BOOLEAN, field: 'IsPackageAssigned' },
        EncounterIPPackageId: { type: DataTypes.BIGINT, field: 'EncounterIPPackageId' },
        IPPackageId: { type: DataTypes.BIGINT, field: 'IPPackageId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        Diagnosis2Id: { type: DataTypes.BIGINT, field: 'Diagnosis2Id' },
        Diagnosis3Id: { type: DataTypes.BIGINT, field: 'Diagnosis3Id' },
        CPTDiagnosisId: { type: DataTypes.BIGINT, field: 'CPTDiagnosisId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        TeamId: { type: DataTypes.BIGINT, field: 'TeamId' },
        IsNoBill: { type: DataTypes.BOOLEAN, field: 'IsNoBill' },
        IsPaidVisit: { type: DataTypes.BOOLEAN, field: 'IsPaidVisit' },
        IsSurgery: { type: DataTypes.BOOLEAN, field: 'IsSurgery' },
        IsAdmission: { type: DataTypes.BOOLEAN, field: 'IsAdmission' },
        FreeVisit: { type: DataTypes.INTEGER, field: 'FreeVisit' },
        IsBillCompleted: { type: DataTypes.BOOLEAN, field: 'IsBillCompleted' },
        IsMRDFileCreation: { type: DataTypes.BOOLEAN, field: 'IsMRDFileCreation' },
        EstimatedBillDist: { type: DataTypes.DECIMAL, field: 'EstimatedBillDist' },
        EstimatedBillDistTypeId: { type: DataTypes.BIGINT, field: 'EstimatedBillDistTypeId' },
        IsReceived: { type: DataTypes.BOOLEAN, field: 'IsReceived' },
        IsBillModified: { type: DataTypes.BOOLEAN, field: 'IsBillModified' },
        B2BCustomerMasterId: { type: DataTypes.BIGINT, field: 'B2BCustomerMasterId' },
        ClinicalNotes: { type: DataTypes.STRING, field: 'ClinicalNotes' },
        IsB2BCustomer: { type: DataTypes.BOOLEAN, field: 'IsB2BCustomer' },
        IsEmergencyVisit: { type: DataTypes.BOOLEAN, field: 'IsEmergencyVisit' },
        VisitCancelReason: { type: DataTypes.STRING, field: 'VisitCancelReason' },
        PatientLocation: { type: DataTypes.STRING, field: 'PatientLocation' },
        EligibleAmount: { type: DataTypes.DECIMAL, field: 'EligibleAmount' },
        EstimationCost: { type: DataTypes.DECIMAL, field: 'EstimationCost' },
        CreditLimit: { type: DataTypes.DECIMAL, field: 'CreditLimit' },
        TpaId: { type: DataTypes.BIGINT, field: 'TpaId' },
        GuarantorLetterNo: { type: DataTypes.DECIMAL, field: 'GuarantorLetterNo' },
        ReceivedOn: { type: DataTypes.DATE, field: 'ReceivedOn' },
        ReceivedBy: { type: DataTypes.BIGINT, field: 'ReceivedBy' },
        PromotionalSchemeId: { type: DataTypes.BIGINT, field: 'PromotionalSchemeId' },
        BillingStatusId: { type: DataTypes.BIGINT, field: 'BillingStatusId' },
        InsuranceNumber: { type: DataTypes.STRING, field: 'InsuranceNumber' },
        BillingRemarks: { type: DataTypes.STRING, field: 'BillingRemarks' },
        IsPharmacyClearance: { type: DataTypes.BOOLEAN, field: 'IsPharmacyClearance' },
        IsOPClearance: { type: DataTypes.BOOLEAN, field: 'IsOPClearance' },
        IsDayCare: { type: DataTypes.BOOLEAN, field: 'IsDayCare' },
        IsFromDayCare: { type: DataTypes.BOOLEAN, field: 'IsFromDayCare' },
        InsuranceTempBillNo: { type: DataTypes.STRING, field: 'InsuranceTempBillNo' },
        BillUnlockRequestStatusId: { type: DataTypes.INTEGER, field: 'BillUnlockRequestStatusId' },
        BillUnlockApprovebyId: { type: DataTypes.INTEGER, field: 'BillUnlockApprovebyId' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'encounters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Encounter as any).associate = function (models: Models) {
        Encounter.belongsTo(models.Facility);
        Encounter.belongsTo(models.Patient);
        Encounter.belongsTo(models.ServiceRateCategory);
        Encounter.belongsTo(models.Guarantor);
        Encounter.belongsTo(models.Diagnosis, { as: 'Diagnosis', foreignKey: 'DiagnosisId' });
        Encounter.belongsTo(models.Diagnosis, { as: 'Diagnosis2', foreignKey: 'Diagnosis2Id' });
        Encounter.belongsTo(models.Diagnosis, { as: 'Diagnosis3', foreignKey: 'Diagnosis3Id' });
        Encounter.belongsTo(models.Diagnosis, { as: 'CPTDiagnosis', foreignKey: 'CPTDiagnosisId' });
        Encounter.belongsTo(models.Speciality);
        Encounter.belongsTo(models.Department);
        Encounter.belongsTo(models.AdmissionRequest);
        Encounter.belongsTo(models.Remark, { as: 'VisitReason', foreignKey: 'VisitReasonId' });
        Encounter.belongsTo(models.Remark, { as: 'Remark', foreignKey: 'RemarkId' });
        Encounter.belongsTo(models.Referral, { foreignKey: 'ReferralId' });
        Encounter.belongsTo(models.Appointment, { foreignKey: 'AppointmentId' });
        Encounter.belongsTo(models.PatientGuarantor, { foreignKey: 'GuarantorId' });
        Encounter.belongsTo(models.B2BCustomerMaster, { foreignKey: 'B2BCustomerMasterId' });
        Encounter.belongsTo(models.Procedure, { foreignKey: 'ProcedureId' });
        Encounter.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        Encounter.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        Encounter.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        Encounter.belongsTo(models.LocationMaster, { foreignKey: 'LocationId' });
        Encounter.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        Encounter.belongsTo(models.User, { as: 'Assignee', foreignKey: 'AssignId' });
        Encounter.belongsTo(models.UserTeam, { foreignKey: 'TeamId' });
        Encounter.belongsTo(models.User, { as: 'ClinicalStaff', foreignKey: 'ClinicalStaffId' });
        // Encounter.hasMany(models.PatientBillSummary, { as: 'Summary' });
        // Encounter.belongsTo(models.PatientBillSummary, { as: 'Summary', foreignKey: 'EncounterId', targetKey: 'EncounterId'});
        Encounter.belongsTo(models.User, { as: 'Created', foreignKey: 'CreatedBy' });
        Encounter.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        Encounter.belongsTo(models.Department, { as: 'DischargeDepartment', foreignKey: 'DischargeDepartmentId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'Priority', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'AdmissionPriority', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'AdmissionRequestType', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'AdmissionStatus', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'GuarantorType', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, {
            as: 'TPA', foreignKey: 'TpaId',
            targetKey: 'ReferenceValueCodeId'
        });
        Encounter.belongsTo(models.ReferenceValue, { as: 'BillingStatus', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue,
            { as: 'AppointmentStatus', foreignKey: 'EncounterStatusId', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'AdmittingReason', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'VisitType', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'ReferralType', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'EncounterType', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'DischargeType', targetKey: 'ReferenceValueCodeId' });
        Encounter.belongsTo(models.ReferenceValue, { as: 'GuardianType', targetKey: 'ReferenceValueCodeId' });
        Encounter.hasMany(models.EncounterDoctor);
        Encounter.hasMany(models.BillingRequest, { as: 'BillingRequest' });
        Encounter.hasMany(models.EncounterGuarantor);
        Encounter.hasMany(models.PatientPaymentDetails);
        Encounter.hasMany(models.PatientRefund);
        Encounter.hasMany(models.PatientDischargeEvent);
        Encounter.hasMany(models.PatientBills, { as: 'FinalBills' });
        Encounter.hasMany(models.PatientBills, { as: 'PharmacyBills', });
        Encounter.hasMany(models.PatientBills, { as: 'IsRegCumBill' });
        Encounter.hasOne(models.PatientCertificate);
        Encounter.hasMany(models.PatientBills, { as: 'DischargedBills' });
        Encounter.hasMany(models.PatientBills, { as: 'DueBills' });
        Encounter.hasMany(models.PatientCondition, { foreignKey: 'EncounterId' });
        Encounter.belongsTo(models.PromotionalScheme, { foreignKey: 'PromotionalSchemeId' });
        Encounter.hasMany(models.PatientStockReturnDetails, { as: 'PatientStockReturnDetails' });
        Encounter.belongsTo(models.User, { as: 'CreatedByUser', foreignKey: 'CreatedBy' });
    };
    return Encounter;
}
