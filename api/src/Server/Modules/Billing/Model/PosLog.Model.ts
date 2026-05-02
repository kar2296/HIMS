import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PosLogInstance, i.PosLogAttributes> {
    let PosLog = sequelize.define<i.PosLogInstance, i.PosLogAttributes>('PosLog', {
        Id: { type: DataTypes.BIGINT, field: 'PosLogId', primaryKey: true, autoIncrement: true },
        Stan: { type: DataTypes.STRING, field: 'Stan' },
        Currency: { type: DataTypes.STRING, field: 'Currency' },
        SaleAmt: { type: DataTypes.STRING, field: 'SaleAmt' },
        Last4Digit: { type: DataTypes.STRING, field: 'Last4Digit' },
        MID: { type: DataTypes.STRING, field: 'MID' },
        TID: { type: DataTypes.STRING, field: 'TID' },
        BatchNr: { type: DataTypes.STRING, field: 'BatchNr' },
        CrdType: { type: DataTypes.STRING, field: 'CrdType' },
        InvoiceNr: { type: DataTypes.STRING, field: 'InvoiceNr' },
        DateTime: { type: DataTypes.STRING, field: 'DateTime' },
        AppVersion: { type: DataTypes.STRING, field: 'AppVersion' },
        BaseAmount: { type: DataTypes.STRING, field: 'BaseAmount' },
        TipAmount: { type: DataTypes.STRING, field: 'TipAmount' },
        RRN: { type: DataTypes.STRING, field: 'RRN' },
        AuthCode: { type: DataTypes.STRING, field: 'AuthCode' },
        AID: { type: DataTypes.STRING, field: 'AID' },
        TVR: { type: DataTypes.STRING, field: 'TVR' },
        ContactType: { type: DataTypes.STRING, field: 'ContactType' },
        TranType: { type: DataTypes.STRING, field: 'TranType' },
        EmvAppName: { type: DataTypes.STRING, field: 'EmvAppName' },
        IsPinEntered: { type: DataTypes.STRING, field: 'IsPinEntered' },
        billNumber: { type: DataTypes.STRING, field: 'billNumber' },
        TranId: { type: DataTypes.STRING, field: 'TranId' },
        PayerVPA: { type: DataTypes.STRING, field: 'PayerVPA' },
        PayerName: { type: DataTypes.STRING, field: 'PayerName' },
        TxnStatus: { type: DataTypes.STRING, field: 'TxnStatus' },
        MerchantVPA: { type: DataTypes.STRING, field: 'MerchantVPA' },
        PayerAmount: { type: DataTypes.STRING, field: 'PayerAmount' },
        PayerMobile: { type: DataTypes.STRING, field: 'PayerMobile' },
        TxnCompletionDate: { type: DataTypes.STRING, field: 'TxnCompletionDate' },
        ErpClientId: { type: DataTypes.STRING, field: 'ErpClientId' },
        ErpTranId: { type: DataTypes.STRING, field: 'ErpTranId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
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
            tableName: 'poslog',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    return PosLog;
}
