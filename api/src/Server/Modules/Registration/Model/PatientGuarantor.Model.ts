import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientGuarantorInstance, i.PatientGuarantorAttributes> {
    let PatientGuarantor = sequelize.define<i.PatientGuarantorInstance, i.PatientGuarantorAttributes>('PatientGuarantor', {
        Id: { type: DataTypes.BIGINT, field: 'PatientGuarantorId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Organizationid: { type: DataTypes.BIGINT, field: 'Organizationid' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        GuarantorLetterNo: { type: DataTypes.STRING, field: 'GuarantorLetterNo' },
        GuarantorLetterDate: { type: DataTypes.DATE, field: 'GuarantorLetterDate' },
        Rank: { type: DataTypes.BIGINT, field: 'Rank' },
        TpaId: { type: DataTypes.BIGINT, field: 'TpaId' },
        DiscountId: { type: DataTypes.BIGINT, field: 'DiscountId' },
        EmployeeId: { type: DataTypes.STRING, field: 'EmployeeId' },
        EligibleAmount: { type: DataTypes.DECIMAL, field: 'EligibleAmount' },
        IdCardNumber: { type: DataTypes.STRING, field: 'IdCardNumber' },
        GuarantorCustomerId: { type: DataTypes.BIGINT, field: 'GuarantorCustomerId' },
        PolicyNo: { type: DataTypes.STRING, field: 'PolicyNo' },
        PolicyName: { type: DataTypes.STRING, field: 'PolicyName' },
        GuarantorApprovalNo: { type: DataTypes.STRING, field: 'GuarantorApprovalNo' },
        EffectiveFrom: { type: DataTypes.DATE, field: 'EffectiveFrom' },
        EffectiveTo: { type: DataTypes.DATE, field: 'EffectiveTo' },
        SubscriberCode: { type: DataTypes.STRING, field: 'SubscriberCode' },
        SubscriberName: { type: DataTypes.STRING, field: 'SubscriberName' },
        EmployeeName: { type: DataTypes.STRING, field: 'EmployeeName' },
        SubscriberRelationId: { type: DataTypes.BIGINT, field: 'SubscriberRelationId' },
        UtilizedCreditLimit: { type: DataTypes.DECIMAL, field: 'UtilizedCreditLimit' },
        AvailableLimit: { type: DataTypes.DECIMAL, field: 'AvailableLimit' },
        CreditLimit: { type: DataTypes.DECIMAL, field: 'CreditLimit' },
        CoPay: { type: DataTypes.STRING, field: 'CoPay' },
        CopayValue: { type: DataTypes.STRING, field: 'CopayValue' },
        Discount: { type: DataTypes.STRING, field: 'Discount' },
        CreditRemarks: { type: DataTypes.STRING, field: 'CreditRemarks' },
        AuthorizedCode: { type: DataTypes.STRING, field: 'AuthorizedCode' },
        BillingRuleId: { type: DataTypes.BIGINT, field: 'BillingRuleId' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsPrimary: { type: DataTypes.BOOLEAN, field: 'IsPrimary' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        NooFVisitFree: { type: DataTypes.INTEGER, field: 'NooFVisitFree' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientguarantors',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientGuarantor as any).associate = function (models: Models) {
        PatientGuarantor.belongsTo(models.ReferenceValue, { as: 'GuarantorType', targetKey: 'ReferenceValueCodeId' });
        PatientGuarantor.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        PatientGuarantor.belongsTo(models.ReferenceValue, { as: 'Tpa', targetKey: 'ReferenceValueCodeId' });
        PatientGuarantor.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        PatientGuarantor.belongsTo(models.Patient, { foreignKey: 'PatientId' });
    };
    return PatientGuarantor;
}
