import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDoctorShareDetailsInstance, i.PatientDoctorShareDetailsAttributes> {
    let PatientDoctorShareDetails = sequelize.define<i.PatientDoctorShareDetailsInstance, i.
        PatientDoctorShareDetailsAttributes>('PatientDoctorShareDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientDoctorShareDetailId', primaryKey: true, autoIncrement: true },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
            ParentBillId: { type: DataTypes.BIGINT, field: 'ParentBillId' },
            BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            TeamId: { type: DataTypes.BIGINT, field: 'TeamId' },
            ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
            ServiceCode: { type: DataTypes.STRING, field: 'ServiceCode' },
            ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
            ServiceAmount: { type: DataTypes.DECIMAL, field: 'ServiceAmount' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            DoctorSharePercentage: { type: DataTypes.DECIMAL, field: 'DoctorSharePercentage' },
            DoctorShareAmount: { type: DataTypes.DECIMAL, field: 'DoctorShareAmount' },
            IsInvoicedDoctorShare: { type: DataTypes.BOOLEAN, field: 'IsInvoicedDoctorShare' },
            IsFullyPaid: { type: DataTypes.BOOLEAN, field: 'IsFullyPaid' },
            AmountPaid: { type: DataTypes.DECIMAL, field: 'AmountPaid' },
            DueAmount: { type: DataTypes.DECIMAL, field: 'DueAmount' },
            TdsId: { type: DataTypes.BIGINT, field: 'TdsId' },
            TdsPercentage: { type: DataTypes.DECIMAL, field: 'TdsPercentage' },
            TdsAmount: { type: DataTypes.DECIMAL, field: 'TdsAmount' },
            DoctorPaymentStatusId: { type: DataTypes.BIGINT, field: 'DoctorPaymentStatusId' },
            PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            ShareType: { type: DataTypes.INTEGER, field: 'ShareType' },
            DoctorShareStatusId: { type: DataTypes.BIGINT, field: 'DoctorShareStatusId' },
            DoctorShareStatusIPId: { type: DataTypes.BIGINT, field: 'DoctorShareStatusIPId' },
            IsApproved: { type: DataTypes.INTEGER, field: 'IsApproved' },
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
                tableName: 'patientdoctorsharedetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientDoctorShareDetails as any).associate = function (models: Models) {
        PatientDoctorShareDetails.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        PatientDoctorShareDetails.belongsTo(models.PatientBills, { as: 'ParentBill', foreignKey: 'ParentBillId' });
        PatientDoctorShareDetails.belongsTo(models.PatientBillDetails, { foreignKey: 'PatientBillDetailId' });
        PatientDoctorShareDetails.belongsTo(models.ReferenceValue, {
            as: 'DrShareType', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'ShareType'
        });
        PatientDoctorShareDetails.belongsTo(models.ReferenceValue, {
            as: 'Team', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'TeamId'
        });
        PatientDoctorShareDetails.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientDoctorShareDetails.belongsTo(models.User, { foreignKey: 'DoctorId' });
        // PatientDoctorShareDetails.belongsTo(models.ServiceCategory, { foreignKey: 'ServiceCategoryId' });
        // PatientDoctorShareDetails.belongsTo(models.ReferenceValue, { as: 'SharingType', targetKey: 'ReferenceValueCodeId' });
        // PatientDoctorShareDetails.belongsTo(models.ReferenceValue, { as: 'ShareType', targetKey: 'ReferenceValueCodeId' });
        // PatientDoctorShareDetails.belongsTo(models.ReferenceValue, { as: 'EncounterType', targetKey: 'ReferenceValueCodeId' });
        // PatientDoctorShareDetails.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientDoctorShareDetails;
}
