import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DoctorInvoiceInstance, i.DoctorInvoiceAttributes> {
    let DoctorInvoice = sequelize.define<i.DoctorInvoiceInstance, i.DoctorInvoiceAttributes>('DoctorInvoice', {
        Id: { type: DataTypes.BIGINT, field: 'DoctorInvoiceId', primaryKey: true, autoIncrement: true },
        DoctorInvoiceIdentifier: { type: DataTypes.STRING, field: 'DoctorInvoiceIdentifier' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        InvoiceDateTime: { type: DataTypes.DATE, field: 'InvoiceDateTime' },
        InvoiceAmount: { type: DataTypes.DECIMAL, field: 'InvoiceAmount' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DoctorInvoiceStatusId: { type: DataTypes.BIGINT, field: 'DoctorInvoiceStatusId' },
        IsFullyPaid: { type: DataTypes.INTEGER, field: 'IsFullyPaid' },
        TDSId: { type: DataTypes.INTEGER, field: 'TDSId' },
        VisitTypeId: { type: DataTypes.INTEGER, field: 'VisitTypeId' },
        TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
        TDSPercentage: { type: DataTypes.STRING, field: 'TDSPercentage' },
        AmountPaid: { type: DataTypes.DECIMAL, field: 'AmountPaid' },
        DueAmount: { type: DataTypes.DECIMAL, field: 'DueAmount' },
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
            tableName: 'doctorinvoice',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (DoctorInvoice as any).associate = function(models: Models) {
                    DoctorInvoice.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
                    DoctorInvoice.belongsTo(models.DoctorPaymentDetails, { foreignKey: 'DoctorInvoiceId' });
                    DoctorInvoice.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
                    DoctorInvoice.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
                    DoctorInvoice.belongsTo(models.ReferenceValue, { as: 'DoctorInvoiceStatus', targetKey: 'ReferenceValueCodeId' });
                    DoctorInvoice.hasMany(models.DoctorInvoiceDetails, { foreignKey: 'DoctorInvoiceId' });
                };
 return DoctorInvoice;
}
