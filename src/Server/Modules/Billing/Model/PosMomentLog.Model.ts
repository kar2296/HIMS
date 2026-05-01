import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PosMomentLogInstance, i.PosMomentLogAttributes> {
    let PosMomentLog = sequelize.define<i.PosMomentLogInstance, i.PosMomentLogAttributes>('PosMomentLog', {
        Id: { type: DataTypes.BIGINT, field: 'PosMomentLogId', primaryKey: true, autoIncrement: true },
        ResponseCode: { type: DataTypes.STRING, field: 'ResponseCode' },
        ResponseMessage: { type: DataTypes.STRING, field: 'ResponseMessage' },
        ProcessingId: { type: DataTypes.STRING, field: 'ProcessingId' },
        CustomerId: { type: DataTypes.STRING, field: 'CustomerId' },
        Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
        TransactionId: { type: DataTypes.STRING, field: 'TransactionId' },
        CashbackDiscountedAmount: { type: DataTypes.STRING, field: 'CashbackDiscountedAmount' },
        TransactionType: { type: DataTypes.STRING, field: 'TransactionType' },
        PayMode: { type: DataTypes.STRING, field: 'PayMode' },
        TransactionStatus: { type: DataTypes.STRING, field: 'TransactionStatus' },
        BankResponseCode: { type: DataTypes.STRING, field: 'BankResponseCode' },
        BankResponseMessage: { type: DataTypes.STRING, field: 'BankResponseMessage' },
        RrnId: { type: DataTypes.STRING, field: 'RrnId' },
        TimeStamp: { type: DataTypes.STRING, field: 'TimeStamp' },
        TransactionAmount: { type: DataTypes.STRING, field: 'TransactionAmount' },
        InvoiceNumber: { type: DataTypes.STRING, field: 'InvoiceNumber' },
        UniqueIdentifierProvider: { type: DataTypes.STRING, field: 'UniqueIdentifierProvider' },
        IcccCode: { type: DataTypes.STRING, field: 'IcccCode' },
        CardNumber: { type: DataTypes.STRING, field: 'CardNumber' },
        CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
        CardType: { type: DataTypes.STRING, field: 'CardType' },
        ApprovalCode: { type: DataTypes.STRING, field: 'ApprovalCode' },
        CheckSumHash: { type: DataTypes.STRING, field: 'CheckSumHash' },
        SplitPayButtonId: { type: DataTypes.STRING, field: 'SplitPayButtonId' },
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
            tableName: 'posmomentlog',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    return PosMomentLog;
}
