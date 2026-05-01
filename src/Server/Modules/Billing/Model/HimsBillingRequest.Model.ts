import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BillingRequestInstance, i.BillingRequestAttributes> {
    let BillingRequest = sequelize.define<i.BillingRequestInstance,
        i.BillingRequestAttributes>('BillingRequest', {
            Id: { type: DataTypes.BIGINT, field: 'BillingRequestId', primaryKey: true, autoIncrement: true },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            BillingRequestTypeId: { type: DataTypes.BIGINT, field: 'BillingRequestTypeId' },
            GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
            VisitIdentifier: { type: DataTypes.STRING, field: 'VisitIdentifier' },
            BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
            BillingRequestDateTime: { type: DataTypes.DATE, field: 'BillingRequestDateTime' },
            BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
            BillDiscount: { type: DataTypes.DECIMAL, field: 'BillDiscount' },
            PaidAmount: { type: DataTypes.DECIMAL, field: 'PaidAmount' },
            Referral: { type: DataTypes.STRING, field: 'Referral' },
            BillGeneratedName: { type: DataTypes.STRING, field: 'BillGeneratedName' },
            BillGeneratedBy: { type: DataTypes.BIGINT, field: 'BillGeneratedBy' },
            PatientBillStatusId: { type: DataTypes.BIGINT, field: 'PatientBillStatusId' },
            BillingRequestStatusId: { type: DataTypes.BIGINT, field: 'BillingRequestStatusId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            BillingRequestBy: { type: DataTypes.INTEGER, field: 'BillingRequestBy' },
            TypeId: { type: DataTypes.INTEGER, field: 'TypeId' },
            BillingRequestAt: { type: DataTypes.DATE, field: 'BillingRequestAt' },
            IsPartialCancel: { type: DataTypes.BOOLEAN, field: 'IsPartialCancel' },
            IsDetailBill: { type: DataTypes.BOOLEAN, field: 'IsDetailBill' },
            PatientBillDetailId: { type: DataTypes.INTEGER, field: 'PatientBillDetailId' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'billingrequest',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                // defaultScope: {
                //     where: {
                //         Status: 1
                //     }
                // }
            });
    (BillingRequest as any).associate = function (models: Models) {
        BillingRequest.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        BillingRequest.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        BillingRequest.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        BillingRequest.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        BillingRequest.belongsTo(models.PatientBillDetails, { foreignKey: 'PatientBillDetailId' });
        BillingRequest.belongsTo(models.ReferenceValue,
            { as: 'BillingRequestType', targetKey: 'ReferenceValueCodeId', foreignKey: 'BillingRequestTypeId' });
        BillingRequest.belongsTo(models.ReferenceValue,
            { as: 'BillingRequestStatus', targetKey: 'ReferenceValueCodeId', foreignKey: 'BillingRequestStatusId' });
        BillingRequest.belongsTo(models.Patient);
        BillingRequest.belongsTo(models.User, { as: 'BillingRequestUser', foreignKey: 'BillingRequestBy' });
        // BillingRequest.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
    };

    return BillingRequest;
}
