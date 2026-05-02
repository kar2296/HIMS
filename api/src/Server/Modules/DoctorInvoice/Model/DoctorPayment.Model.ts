import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DoctorPaymentInstance, i.DoctorPaymentAttributes> {
    let DoctorPayment = sequelize.define<i.DoctorPaymentInstance,
        i.DoctorPaymentAttributes>('DoctorPayment', {
            Id: { type: DataTypes.BIGINT, field: 'DoctorPaymentId', primaryKey: true, autoIncrement: true },
            DoctorPaymentIdentifier: { type: DataTypes.STRING, field: 'DoctorPaymentIdentifier' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            PaymentDateTime: { type: DataTypes.DATE, field: 'PaymentDateTime' },
            DcotorPaymentAmount: { type: DataTypes.DECIMAL, field: 'DcotorPaymentAmount' },
            DcotorInvoiceAmount: { type: DataTypes.DECIMAL, field: 'DcotorInvoiceAmount' },
            RoomRent: { type: DataTypes.DECIMAL, field: 'RoomRent' },
            EquipmentUsage: { type: DataTypes.DECIMAL, field: 'EquipmentUsage' },
            BasicSalary: { type: DataTypes.DECIMAL, field: 'BasicSalary' },
            Incentive: { type: DataTypes.DECIMAL, field: 'Incentive' },
            DoctorPaymentAmount: { type: DataTypes.DECIMAL, field: 'DoctorPaymentAmount' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
            PaymentTypeId: { type: DataTypes.BIGINT, field: 'PaymentTypeId' },
            BankId: { type: DataTypes.INTEGER, field: 'BankId' },
            ChequeNo: { type: DataTypes.STRING, field: 'ChequeNo' },
            ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
            CollectedOn: { type: DataTypes.DATE, field: 'CollectedOn' },
            DDNumber: { type: DataTypes.STRING, field: 'DDNumber' },
            DDDate: { type: DataTypes.DATE, field: 'DDDate' },
            WireTransferId: { type: DataTypes.INTEGER, field: 'WireTransferId' },
            WireTransferDate: { type: DataTypes.DATE, field: 'WireTransferDate' },
            PaymentStatusId: { type: DataTypes.INTEGER, field: 'PaymentStatusId' },
            TDSId: { type: DataTypes.INTEGER, field: 'TDSId' },
            TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
            TDSPercentage: { type: DataTypes.STRING, field: 'TDSPercentage' },
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
                tableName: 'doctorpayment',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (DoctorPayment as any).associate = function (models: any) {
        DoctorPayment.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        DoctorPayment.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        DoctorPayment.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        DoctorPayment.belongsTo(models.User, { as: 'Approved', foreignKey: 'ApprovedBy' });
        DoctorPayment.belongsTo(models.ReferenceValue, {
            as: 'DoctorPaymentStatus',
            targetKey: 'ReferenceValueCodeId',
            foreignKey: 'PaymentStatusId'
        });
        DoctorPayment.hasMany(models.DoctorPaymentDetails, { foreignKey: 'DoctorPaymentId' });
        DoctorPayment.belongsTo(models.ReferenceValue, { as: 'PaymentType', targetKey: 'ReferenceValueCodeId' });
    };
    return DoctorPayment as SequelizeStatic.Model<i.DoctorPaymentInstance, i.DoctorPaymentAttributes>;
}
