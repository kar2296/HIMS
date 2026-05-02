import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OPModifyPatBillsInstance, i.OPModifyPatBillsAttributes> {
    let OPModifyPatBills =
        sequelize.define<i.OPModifyPatBillsInstance, i.OPModifyPatBillsAttributes>('OPModifyPatBills', {
            Id: { type: DataTypes.BIGINT, field: 'PatientBillId', primaryKey: true },
            BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
            BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
            BillTypeId: { type: DataTypes.BIGINT, field: 'BillTypeId' },
            BillPriorityId: { type: DataTypes.BIGINT, field: 'BillPriorityId' },
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
            ReturnedAmount: { type: DataTypes.DECIMAL, field: 'ReturnedAmount' },
            OutStandingAmount: { type: DataTypes.DECIMAL, field: 'OutStandingAmount' },
            ServiceTax: { type: DataTypes.DECIMAL, field: 'ServiceTax' },
            EducationCess: { type: DataTypes.DECIMAL, field: 'EducationCess' },
            GSTAmount: { type: DataTypes.DECIMAL, field: 'GSTAmount' },
            InGstAmount: { type: DataTypes.DECIMAL, field: 'InGstAmount' },
            CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
            SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
            BillGeneratedBy: { type: DataTypes.BIGINT, field: 'BillGeneratedBy' },
            BillApprovedBy: { type: DataTypes.BIGINT, field: 'BillApprovedBy' },
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
            TitleId: { type: DataTypes.BIGINT, field: 'TitleId' },
            Age: { type: DataTypes.INTEGER, field: 'Age' },
            DOB: { type: DataTypes.DATE, field: 'DOB' },
            GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
            Mobile: { type: DataTypes.STRING, field: 'Mobile' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
            OTIdentifier: { type: DataTypes.STRING, field: 'OTIdentifier' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
            ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
            PrivateDueId: { type: DataTypes.BIGINT, field: 'PrivateDueId' },
            GuarantorDueId: { type: DataTypes.BIGINT, field: 'GuarantorDueId' },
            GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
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
            RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
            BedId: { type: DataTypes.BIGINT, field: 'BedId' },
            WardId: { type: DataTypes.BIGINT, field: 'WardId' },
            OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
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
            CreditVocher: { type: DataTypes.DECIMAL, field: 'CreditVocher' },
            ToBeRefunded: { type: DataTypes.DECIMAL, field: 'ToBeRefunded' },
            RefundAmount: { type: DataTypes.DECIMAL, field: 'RefundAmount' },
            FSTypeId: { type: DataTypes.DECIMAL, field: 'FSTypeId' },
            PatientOrderId: { type: DataTypes.INTEGER, field: 'PatientOrderId' },
            PatientDietOrderId: { type: DataTypes.INTEGER, field: 'PatientDietOrderId' },
            IsThisPrescription: { type: DataTypes.BOOLEAN, field: 'IsThisPrescription' },
            PrescriptionId: { type: DataTypes.BIGINT, field: 'PrescriptionId' },
            IsPharmacyBill: { type: DataTypes.BOOLEAN, field: 'IsPharmacyBill' },
            IsPharmacyReturn: { type: DataTypes.BOOLEAN, field: 'IsPharmacyReturn' },
            IsClaimed: { type: DataTypes.BOOLEAN, field: 'IsClaimed' },
            IsRegCumBill: { type: DataTypes.BOOLEAN, field: 'IsRegCumBill' },
            IsFromIPBill: { type: DataTypes.BOOLEAN, field: 'IsFromIPBill' },
            IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
            IsConsolidatePay: { type: DataTypes.BOOLEAN, field: 'IsConsolidatePay' },
            ChecklistStatusId: { type: DataTypes.INTEGER, field: 'ChecklistStatusId' },
            PharmacySaleTypeId: { type: DataTypes.BIGINT, field: 'PharmacySaleTypeId' },
            PharmacyReturnTypeId: { type: DataTypes.BIGINT, field: 'PharmacyReturnTypeId' },
            CNAmount: { type: DataTypes.DECIMAL, field: 'CNAmount' },
            TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
            Disallowed: { type: DataTypes.DECIMAL, field: 'Disallowed' },
            IsModified: { type: DataTypes.BOOLEAN, field: 'IsModified' },
            IsEmergency: { type: DataTypes.BOOLEAN, field: 'IsEmergency' },
            FreeBillAmount: { type: DataTypes.DECIMAL, field: 'FreeBillAmount' },
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
                tableName: 'opmodifypatbills',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (OPModifyPatBills as any).associate = function (models: Models) {
        OPModifyPatBills.hasMany(models.OPModifyPatBillDetails, { foreignKey: 'PatientBillId' });
        OPModifyPatBills.hasMany(models.OPModifyPatPaymentDetails, { foreignKey: 'PatientBillId' });
        OPModifyPatBills.hasMany(models.PatientBillSplitDetails, { foreignKey: 'PatientBillId' });
        OPModifyPatBills.belongsTo(models.Patient);
        OPModifyPatBills.belongsTo(models.User, { foreignKey: 'DoctorId' });
        OPModifyPatBills.belongsTo(models.User, { as: 'PrivateDue', foreignKey: 'PrivateDueId' });
        OPModifyPatBills.belongsTo(models.PatientGuarantor, { as: 'PatientGuarantor', foreignKey: 'GuarantorDueId' });
        OPModifyPatBills.belongsTo(models.PatientGuarantor, { as: 'Guarantor', foreignKey: 'GuarantorId' });
        OPModifyPatBills.belongsTo(models.Guarantor, { as: 'GuarantorMaster', foreignKey: 'GuarantorId' });
        OPModifyPatBills.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        OPModifyPatBills.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        OPModifyPatBills.belongsTo(models.User, { as: 'Updateduser', foreignKey: 'UpdatedBy' });
        OPModifyPatBills.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'UpdatedBy' });
        OPModifyPatBills.belongsTo(models.ReferenceValue, { as: 'PatientBillStatus', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatBills.belongsTo(models.ReferenceValue, { as: 'BillPriority', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatBills.belongsTo(models.ReferenceValue, { as: 'GuarantorType', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatBills.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        OPModifyPatBills.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        OPModifyPatBills.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        OPModifyPatBills.belongsTo(models.ReferenceValue, { as: 'Title', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatBills.belongsTo(models.ReferenceValue, { as: 'Gender', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatBills.belongsTo(models.ReferenceValue, { as: 'ChecklistStatus', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatBills.belongsTo(models.ReferenceValue, { as: 'EncounterType', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatBills.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        OPModifyPatBills.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        OPModifyPatBills.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
    };
    return OPModifyPatBills;
}
