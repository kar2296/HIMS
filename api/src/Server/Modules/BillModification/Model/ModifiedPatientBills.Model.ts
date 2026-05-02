import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ModifiedPatientBillsInstance, i.ModifiedPatientBillsAttributes> {
    let ModifiedPatientBills = sequelize.define<i.ModifiedPatientBillsInstance, i.ModifiedPatientBillsAttributes>('ModifiedPatientBills', {
        Id: { type: DataTypes.BIGINT, field: 'ModifiedPatientBillId', primaryKey: true, autoIncrement: true },
        ModifiedBillNumber: { type: DataTypes.STRING, field: 'ModifiedBillNumber' },
        ModifiedBillDateTime: { type: DataTypes.DATE, field: 'ModifiedBillDateTime' },
        PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
        BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
        BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
        BillTypeId: { type: DataTypes.BIGINT, field: 'BillTypeId' },
        BillPriorityId: { type: DataTypes.BIGINT, field: 'BillPriorityId' },
        ModifiedBillAmount: { type: DataTypes.DECIMAL, field: 'ModifiedBillAmount' },
        ModifiedBillDiscount: { type: DataTypes.DECIMAL, field: 'ModifiedBillDiscount' },
        BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
        BillDiscount: { type: DataTypes.DECIMAL, field: 'BillDiscount' },
        BillDiscountTypeId: { type: DataTypes.BIGINT, field: 'BillDiscountTypeId' },
        DiscountApprovedBy: { type: DataTypes.BIGINT, field: 'DiscountApprovedBy' },
        BillDiscountModeId: { type: DataTypes.BIGINT, field: 'BillDiscountModeId' },
        DiscountModeValue: { type: DataTypes.DECIMAL, field: 'DiscountModeValue' },
        RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
        BilledCounter: { type: DataTypes.INTEGER, field: 'BilledCounter' },
        PaidAmount: { type: DataTypes.DECIMAL, field: 'PaidAmount' },
        IsPaidFully: { type: DataTypes.BOOLEAN, field: 'IsPaidFully' },
        OutStandingAmount: { type: DataTypes.DECIMAL, field: 'OutStandingAmount' },
        ServiceTax: { type: DataTypes.DECIMAL, field: 'ServiceTax' },
        EducationCess: { type: DataTypes.DECIMAL, field: 'EducationCess' },
        GstAmount: { type: DataTypes.DECIMAL, field: 'GstAmount' },
        InGstAmount: { type: DataTypes.DECIMAL, field: 'InGstAmount' },
        CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
        SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
        BillGeneratedBy: { type: DataTypes.BIGINT, field: 'BillGeneratedBy' },
        BillApprovedBy: { type: DataTypes.BIGINT, field: 'BillApprovedBy' },
        BillModifiedBy: { type: DataTypes.BIGINT, field: 'BillModifiedBy' },
        IsIntermediateBill: { type: DataTypes.BOOLEAN, field: 'IsIntermediateBill' },
        ParentBillId: { type: DataTypes.BIGINT, field: 'ParentBillId' },
        ParentReturnId: { type: DataTypes.BIGINT, field: 'ParentReturnId' },
        IsPackageBill: { type: DataTypes.BOOLEAN, field: 'IsPackageBill' },
        PackageDiscount: { type: DataTypes.DECIMAL, field: 'PackageDiscount' },
        StaffCheck: { type: DataTypes.BOOLEAN, field: 'StaffCheck' },
        StaffDiscountId: { type: DataTypes.BIGINT, field: 'StaffDiscountId' },
        StaffId: { type: DataTypes.BIGINT, field: 'StaffId' },
        StaffDiscountTypeId: { type: DataTypes.BIGINT, field: 'StaffDiscountTypeId' },
        StaffDiscountPercentage: { type: DataTypes.DECIMAL, field: 'StaffDiscountPercentage' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        TitleId: { type: DataTypes.BIGINT, field: 'TitleId' },
        GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
        Age: { type: DataTypes.INTEGER, field: 'Age' },
        DOB: { type: DataTypes.DATE, field: 'DOB' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
        OTIdentifier: { type: DataTypes.STRING, field: 'OTIdentifier' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        AdmissionDate: { type: DataTypes.DATE, field: 'AdmissionDate' },
        DischargeDate: { type: DataTypes.DATE, field: 'DischargeDate' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
        OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
        PrivateDueId: { type: DataTypes.BIGINT, field: 'PrivateDueId' },
        GuarantorDueId: { type: DataTypes.BIGINT, field: 'GuarantorDueId' },
        FamilyLinkId: { type: DataTypes.BIGINT, field: 'FamilyLinkId' },
        TransferEncounterId: { type: DataTypes.BIGINT, field: 'TransferEncounterId' },
        TransferPatientId: { type: DataTypes.BIGINT, field: 'TransferPatientId' },
        TransferAmount: { type: DataTypes.DECIMAL, field: 'TransferAmount' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        ServiceRateCategoryName: { type: DataTypes.STRING, field: 'ServiceRateCategoryName' },
        TpaId: { type: DataTypes.BIGINT, field: 'TpaId' },
        RateCategoryId: { type: DataTypes.BIGINT, field: 'RateCategoryId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
        ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
        CancelAmount: { type: DataTypes.DECIMAL, field: 'CancelAmount' },
        CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
        CancelledBy: { type: DataTypes.BIGINT, field: 'CancelledBy' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        IsManualBill: { type: DataTypes.BOOLEAN, field: 'IsManualBill' },
        ManualBillNumber: { type: DataTypes.STRING, field: 'ManualBillNumber' },
        ManualBillDate: { type: DataTypes.DATE, field: 'ManualBillDate' },
        ManualBillComments: { type: DataTypes.STRING, field: 'ManualBillComments' },
        PatientBillStatusId: { type: DataTypes.INTEGER, field: 'PatientBillStatusId' },
        ModifiedPatientBillStatusId: { type: DataTypes.INTEGER, field: 'ModifiedPatientBillStatusId' },
        CreditVocher: { type: DataTypes.DECIMAL, field: 'CreditVocher' },
        ToBeRefunded: { type: DataTypes.DECIMAL, field: 'ToBeRefunded' },
        RefundedAmount: { type: DataTypes.DECIMAL, field: 'RefundedAmount' },
        CNAmount: { type: DataTypes.DECIMAL, field: 'CNAmount' },
        FSTypeId: { type: DataTypes.DECIMAL, field: 'FSTypeId' },
        PatientOrderId: { type: DataTypes.INTEGER, field: 'PatientOrderId' },
        IsThisPrescription: { type: DataTypes.BOOLEAN, field: 'IsThisPrescription' },
        PrescriptionId: { type: DataTypes.BIGINT, field: 'PrescriptionId' },
        IsPharmacyBill: { type: DataTypes.BOOLEAN, field: 'IsPharmacyBill' },
        PharmacySaleTypeId: { type: DataTypes.BIGINT, field: 'PharmacySaleTypeId' },
        IsPharmacyReturn: { type: DataTypes.BOOLEAN, field: 'IsPharmacyReturn' },
        PharmacyReturnTypeId: { type: DataTypes.BIGINT, field: 'PharmacyReturnTypeId' },
        TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
        Disallowed: { type: DataTypes.DECIMAL, field: 'Disallowed' },
        IsClaimed: { type: DataTypes.BOOLEAN, field: 'IsClaimed' },
        IsConsolidatePay: { type: DataTypes.BOOLEAN, field: 'IsConsolidatePay' },
        IsRegCumBill: { type: DataTypes.BOOLEAN, field: 'IsRegCumBill' },
        ChecklistStatusId: { type: DataTypes.INTEGER, field: 'ChecklistStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'modifiedpatientbills',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ModifiedPatientBills as any).associate = function (models: Models) {
        ModifiedPatientBills.hasMany(models.ModifiedPatientBillCategorys, { foreignKey: 'ModifiedPatientBillId' });
        ModifiedPatientBills.hasMany(models.ModifiedPatientPaymentDetails, { foreignKey: 'ModifiedPatientBillId' });
        ModifiedPatientBills.belongsTo(models.Patient);
        ModifiedPatientBills.belongsTo(models.User, { foreignKey: 'DoctorId' });
        ModifiedPatientBills.belongsTo(models.User, { as: 'PrivateDue', foreignKey: 'PrivateDueId' });
        ModifiedPatientBills.belongsTo(models.PatientGuarantor, { as: 'PatientGuarantor', foreignKey: 'GuarantorDueId' });
        ModifiedPatientBills.belongsTo(models.PatientGuarantor, { as: 'Guarantor', foreignKey: 'GuarantorId' });
        ModifiedPatientBills.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        ModifiedPatientBills.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        ModifiedPatientBills.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
        ModifiedPatientBills.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'UpdatedBy' });
        ModifiedPatientBills.belongsTo(models.ReferenceValue, { as: 'PatientBillStatus', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientBills.belongsTo(models.ReferenceValue, { as: 'BillPriority', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientBills.belongsTo(models.ReferenceValue, { as: 'GuarantorType', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientBills.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        ModifiedPatientBills.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        ModifiedPatientBills.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        ModifiedPatientBills.belongsTo(models.ReferenceValue, { as: 'Title', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientBills.belongsTo(models.ReferenceValue, { as: 'Gender', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientBills.belongsTo(models.ReferenceValue, { as: 'ChecklistStatus', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientBills.belongsTo(models.ReferenceValue, { as: 'EncounterType', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientBills.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        ModifiedPatientBills.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        ModifiedPatientBills.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
    };
    return ModifiedPatientBills;
}
