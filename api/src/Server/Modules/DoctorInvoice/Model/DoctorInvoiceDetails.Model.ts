import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DoctorInvoiceDetailsInstance, i.DoctorInvoiceDetailsAttributes> {
    let DoctorInvoiceDetails = sequelize.define<i.DoctorInvoiceDetailsInstance, i.DoctorInvoiceDetailsAttributes>('DoctorInvoiceDetails', {
        Id: { type: DataTypes.BIGINT, field: 'DoctorInvoiceDetailId', primaryKey: true, autoIncrement: true },
        DoctorInvoiceId: { type: DataTypes.BIGINT, field: 'DoctorInvoiceId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
        PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        InvoiceDateTime: { type: DataTypes.DATE, field: 'InvoiceDateTime' },
        ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        DoctorShare: { type: DataTypes.DECIMAL, field: 'DoctorShare' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        InvoiceStatusId: { type: DataTypes.BIGINT, field: 'InvoiceStatusId' },
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
            tableName: 'doctorinvoicedetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (DoctorInvoiceDetails as any).associate = function(models: Models) {
                    DoctorInvoiceDetails.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
                    DoctorInvoiceDetails.belongsTo(models.PatientBillDetails, { foreignKey: 'PatientBillDetailId' });
                    // DoctorInvoiceDetails.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
                    DoctorInvoiceDetails.belongsTo(models.ReferenceValue, { as: 'InvoiceStatus', targetKey: 'ReferenceValueCodeId' });
                    DoctorInvoiceDetails.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
                    DoctorInvoiceDetails.belongsTo(models.User, {foreignKey: 'CreatedBy' });
                };
 return DoctorInvoiceDetails;
}
