import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LHRCVoucherInstance, i.LHRCVoucherAttributes> {
    let LHRCVoucher = sequelize.define<i.LHRCVoucherInstance, i.LHRCVoucherAttributes>('LHRCVoucher', {
        Id: { type: DataTypes.BIGINT, field: 'LHRCVoucherId', primaryKey: true, autoIncrement: true },
        LHRCVoucherNo: { type: DataTypes.STRING, field: 'LHRCVoucherNo' },
        VoucherDate: { type: DataTypes.DATE, field: 'VoucherDate' },
        VoucherTypeId: { type: DataTypes.BIGINT, field: 'VoucherTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PaymentTypeId: { type: DataTypes.BIGINT, field: 'PaymentTypeId' },
        TerminalNoId: { type: DataTypes.BIGINT, field: 'TerminalNoId' },
        BankId: { type: DataTypes.BIGINT, field: 'BankId' },
        CardTypeId: { type: DataTypes.BIGINT, field: 'CardTypeId' },
        CardNumber: { type: DataTypes.STRING, field: 'CardNumber' },
        CardExpiryDate: { type: DataTypes.DATE, field: 'CardExpiryDate' },
        CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
        AuthorizeNumber: { type: DataTypes.BIGINT, field: 'AuthorizeNumber' },
        AuthorizedCode: { type: DataTypes.STRING, field: 'AuthorizedCode' },
        ChequeNo: { type: DataTypes.STRING, field: 'ChequeNo' },
        ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
        CollectedOn: { type: DataTypes.DATE, field: 'CollectedOn' },
        DDNumber: { type: DataTypes.STRING, field: 'DDNumber' },
        DDDate: { type: DataTypes.DATE, field: 'DDDate' },
        WireTransferId: { type: DataTypes.BIGINT, field: 'WireTransferId' },
        WireTransferDate: { type: DataTypes.DATE, field: 'WireTransferDate' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        AmbulanceName: { type: DataTypes.STRING, field: 'AmbulanceName' },
        DriverName: { type: DataTypes.STRING, field: 'DriverName' },
        VehicleName: { type: DataTypes.STRING, field: 'VehicleName' },
        PayTo: { type: DataTypes.STRING, field: 'PayTo' },
        VoucherAmount: { type: DataTypes.DECIMAL, field: 'VoucherAmount' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        VoucherStatusId: { type: DataTypes.BIGINT, field: 'VoucherStatusId' },
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
            tableName: 'lhrcvoucher',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (LHRCVoucher as any).associate = function (models: Models) {
        LHRCVoucher.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        LHRCVoucher.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        LHRCVoucher.belongsTo(models.ReferenceValue, { as: 'VoucherType', targetKey: 'ReferenceValueCodeId' });
        LHRCVoucher.belongsTo(models.ReferenceValue, { as: 'VoucherStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return LHRCVoucher;
}
