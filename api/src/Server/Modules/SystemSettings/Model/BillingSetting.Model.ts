import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BillingSettingInstance, i.BillingSettingAttributes> {
    let BillingSetting = sequelize.define<i.BillingSettingInstance, i.BillingSettingAttributes>('BillingSetting', {
        Id: { type: DataTypes.BIGINT, field: 'BillingSettingId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OPBillCancelDays: { type: DataTypes.INTEGER, field: 'OPBillCancelDays' },
        IPBillCancelDays: { type: DataTypes.INTEGER, field: 'IPBillCancelDays' },
        ReceiptCancelDays: { type: DataTypes.INTEGER, field: 'ReceiptCancelDays' },
        RefundCancelDays: { type: DataTypes.INTEGER, field: 'RefundCancelDays' },
        CreditNoteCancelDays: { type: DataTypes.INTEGER, field: 'CreditNoteCancelDays' },
        DebitNoteCancelDays: { type: DataTypes.INTEGER, field: 'DebitNoteCancelDays' },
        PharmacyReturnDays: { type: DataTypes.INTEGER, field: 'PharmacyReturnDays' },
        MaximumCashRefund: { type: DataTypes.BIGINT, field: 'MaximumCashRefund' },
        BillRefundDuration: { type: DataTypes.INTEGER, field: 'BillRefundDuration' },
        BillingRoundOff: { type: DataTypes.DECIMAL, field: 'BillingRoundOff' },
        InventoryRoundOff: { type: DataTypes.DECIMAL, field: 'InventoryRoundOff' },
        PharmacyRoundOff: { type: DataTypes.DECIMAL, field: 'PharmacyRoundOff' },
        NightShiftStartTime: { type: DataTypes.TIME, field: 'NightShiftStartTime' },
        NightShiftEndTime: { type: DataTypes.TIME, field: 'NightShiftEndTime' },
        OPAdditionalPercent: { type: DataTypes.DECIMAL, field: 'OPAdditionalPercent' },
        IPAdditionalPercent: { type: DataTypes.DECIMAL, field: 'IPAdditionalPercent' },
        ServiceTaxPercent: { type: DataTypes.DECIMAL, field: 'ServiceTaxPercent' },
        GSTPercent: { type: DataTypes.DECIMAL, field: 'GSTPercent' },
        EducationPercent: { type: DataTypes.DECIMAL, field: 'EducationPercent' },
        DoOPReceipt: { type: DataTypes.BOOLEAN, field: 'DoOPReceipt' },
        DoIPReceipt: { type: DataTypes.BOOLEAN, field: 'DoIPReceipt' },
        DoCancelBillCreditNote: { type: DataTypes.BOOLEAN, field: 'DoCancelBillCreditNote' },
        AllowCreditNoteRefund: { type: DataTypes.BOOLEAN, field: 'AllowCreditNoteRefund' },
        IsDiscountAuthorizationNeeded: { type: DataTypes.BOOLEAN, field: 'IsDiscountAuthorizationNeeded' },
        IsPrivateCreditCONeeded: { type: DataTypes.BOOLEAN, field: 'IsPrivateCreditCONeeded' },
        IsServiceTaxApplicable: { type: DataTypes.BOOLEAN, field: 'IsServiceTaxApplicable' },
        IsOPBillFlowRequired: { type: DataTypes.BOOLEAN, field: 'IsOPBillFlowRequired' },
        IsIPBillFlowRequired: { type: DataTypes.BOOLEAN, field: 'IsIPBillFlowRequired' },
        IsOrderCoveredWarningRequired: { type: DataTypes.BOOLEAN, field: 'IsOrderCoveredWarningRequired' },
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
            tableName: 'billingsetting',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    return BillingSetting;
}
