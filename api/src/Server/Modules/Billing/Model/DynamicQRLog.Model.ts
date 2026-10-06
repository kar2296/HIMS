import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DynamicQRLogInstance, i.DynamicQRLogAttributes> {
    let DynamicQRLog = sequelize.define<i.DynamicQRLogInstance, i.DynamicQRLogAttributes>('DynamicQRLog', {
        Id: { type: DataTypes.BIGINT, field: 'DynamicQRLogId', primaryKey: true, autoIncrement: true },
        MerchantId: { type: DataTypes.STRING, field: 'MerchantId' },
        SubMerchantId: { type: DataTypes.STRING, field: 'SubMerchantId' },
        TerminalId: { type: DataTypes.STRING, field: 'TerminalId' },
        BankRRN: { type: DataTypes.STRING, field: 'BankRRN' },
        MerchantTranId: { type: DataTypes.STRING, field: 'MerchantTranId' },
        PayerName: { type: DataTypes.STRING, field: 'PayerName' },
        PayerMobile: { type: DataTypes.STRING, field: 'PayerMobile' },
        PayerVA: { type: DataTypes.STRING, field: 'PayerVA' },
        PayerAmount: { type: DataTypes.STRING, field: 'PayerAmount' },
        TxnStatus: { type: DataTypes.STRING, field: 'TxnStatus' },
        TxnInitDate: { type: DataTypes.STRING, field: 'TxnInitDate' },
        TxnCompletionDate: { type: DataTypes.STRING, field: 'TxnCompletionDate' },
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
            tableName: 'dynamicqrlog',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    return DynamicQRLog;
}
