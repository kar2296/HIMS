import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GstReportInstance, i.GstReportAttributes> {
    let GstReport = sequelize.define<i.GstReportInstance, i.GstReportAttributes>('GstReport', {
        RUNDATE: { type: DataTypes.DATE, field: 'RUNDATE', primaryKey: true },
        STORES: { type: DataTypes.STRING, field: 'STORES' },
        FROMDATE: { type: DataTypes.DATE, field: 'FROMDATE' },
        TODATE: { type: DataTypes.DATE, field: 'TODATE' },
        GST_TYPE: { type: DataTypes.STRING, field: 'GST_TYPE' },
        PaymentTypeId: { type: DataTypes.INTEGER, field: 'PaymentTypeId' },
        SALE_TOTAL_AMOUNT: { type: DataTypes.DECIMAL, field: 'SALE_TOTAL_AMOUNT' },
        SALE_TAXABLE: { type: DataTypes.DECIMAL, field: 'SALE_TAXABLE' },
        SALE_NEW_GST: { type: DataTypes.DECIMAL, field: 'SALE_NEW_GST' },
        RETURN_TOTAL_AMOUNT: { type: DataTypes.DECIMAL, field: 'RETURN_TOTAL_AMOUNT' },
        RETURN_TAXABLE: { type: DataTypes.DECIMAL, field: 'RETURN_TAXABLE' },
        RETURN_NEW_GST: { type: DataTypes.DECIMAL, field: 'RETURN_NEW_GST' },
        SALEmRETURN: { type: DataTypes.DECIMAL, field: 'SALEmRETURN' },
        SALEmRETURN_TAX: { type: DataTypes.DECIMAL, field: 'SALEmRETURN_TAX' },
        FINAL_GST: { type: DataTypes.DECIMAL, field: 'FINAL_GST' },
        new_gstcol: { type: DataTypes.STRING, field: 'new_gstcol' },
        new_gstcol1: { type: DataTypes.STRING, field: 'new_gstcol1' },
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
            tableName: 'new_gst',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            // defaultScope: {
            //     where: {
            //         Status: 1
            //     }
            // }
        });

    return GstReport;
}
