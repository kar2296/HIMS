import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientReturnsInstance, i.PatientReturnsAttributes> {
    let PatientReturns = sequelize.define<i.PatientReturnsInstance, i.PatientReturnsAttributes>('PatientReturns', {
        Id: { type: DataTypes.BIGINT, field: 'PatientReturnId', primaryKey: true, autoIncrement: true },
        PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
        ReturnNumber: { type: DataTypes.STRING, field: 'ReturnNumber' },
        BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
        ReturnDateTime: { type: DataTypes.DATE, field: 'ReturnDateTime' },
        BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
        ReturnTypeId: { type: DataTypes.BIGINT, field: 'ReturnTypeId' },
        ReturnPriorityId: { type: DataTypes.BIGINT, field: 'ReturnPriorityId' },
        ReturnAmount: { type: DataTypes.DECIMAL, field: 'ReturnAmount' },
        FreeReturnAmount: { type: DataTypes.DECIMAL, field: 'FreeReturnAmount' },
        RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
        ReturnedCounter: { type: DataTypes.INTEGER, field: 'ReturnedCounter' },
        RefundedAmount: { type: DataTypes.DECIMAL, field: 'RefundedAmount' },
        FreeRefundedAmount: { type: DataTypes.DECIMAL, field: 'FreeRefundedAmount' },
        IsRefundedFully: { type: DataTypes.BOOLEAN, field: 'IsRefundedFully' },
        ToBeRefundAmount: { type: DataTypes.DECIMAL, field: 'ToBeRefundAmount' },
        ServiceTax: { type: DataTypes.DECIMAL, field: 'ServiceTax' },
        EducationCess: { type: DataTypes.DECIMAL, field: 'EducationCess' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        DiscountModeId: { type: DataTypes.INTEGER, field: 'DiscountModeId' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        DiscountApprovedBy: { type: DataTypes.BIGINT, field: 'DiscountApprovedBy' },
        GstAmount: { type: DataTypes.DECIMAL, field: 'GstAmount' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        InGstAmount: { type: DataTypes.DECIMAL, field: 'InGstAmount' },
        CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
        SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
        ReturnReason: { type: DataTypes.STRING, field: 'ReturnReason' },
        ReturnGeneratedBy: { type: DataTypes.BIGINT, field: 'ReturnGeneratedBy' },
        ReturnApprovedBy: { type: DataTypes.BIGINT, field: 'ReturnApprovedBy' },
        PatientReturnStatusId: { type: DataTypes.INTEGER, field: 'PatientReturnStatusId' },
        PharmacyReturnTypeId: { type: DataTypes.BIGINT, field: 'PharmacyReturnTypeId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
        ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        PatientAddress: { type: DataTypes.STRING, field: 'PatientAddress' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        MobileNo: { type: DataTypes.BIGINT, field: 'MobileNo' },
        PatientMRN: { type: DataTypes.STRING, field: 'PatientMRN'},
        NetPatientAmount: { type: DataTypes.DECIMAL, field: 'NetPatientAmount' },
        NetInsuranceAmount: { type: DataTypes.DECIMAL, field: 'NetInsuranceAmount' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientreturns',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientReturns as any).associate = function (models: Models) {
        PatientReturns.hasMany(models.PatientReturnDetails, { foreignKey: 'PatientReturnId' });
        PatientReturns.hasMany(models.PatientRefund, { foreignKey: 'PatientReturnId' });
        PatientReturns.belongsTo(models.Patient);
        PatientReturns.belongsTo(models.User, { foreignKey: 'DoctorId' });
        PatientReturns.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientReturns.belongsTo(models.User, { as: 'ReturnedUser', foreignKey: 'ReturnApprovedBy' });
        PatientReturns.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientReturns.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'UpdatedBy' });
        PatientReturns.belongsTo(models.ReferenceValue, { as: 'PatientReturnStatus', targetKey: 'ReferenceValueCodeId' });
        PatientReturns.belongsTo(models.ReferenceValue, { as: 'ReturnPriority', targetKey: 'ReferenceValueCodeId' });
        PatientReturns.belongsTo(models.ReferenceValue, { as: 'GuarantorType', targetKey: 'ReferenceValueCodeId' });
        PatientReturns.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        PatientReturns.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        PatientReturns.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PatientReturns.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        PatientReturns.belongsTo(models.PatientGuarantor, { as: 'PatientGuarantor', foreignKey: 'GuarantorId' });
        PatientReturns.belongsTo(models.Guarantor, { as: 'GuarantorMaster', foreignKey: 'GuarantorId' });
    };
    return PatientReturns;
}
