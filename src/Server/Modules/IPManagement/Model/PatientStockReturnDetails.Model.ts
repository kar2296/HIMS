import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientStockReturnDetailsInstance, i.PatientStockReturnDetailsAttributes> {
    let PatientStockReturnDetails = sequelize.define<i.PatientStockReturnDetailsInstance,
        i.PatientStockReturnDetailsAttributes>('PatientStockReturnDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientStockReturnDetailId', primaryKey: true, autoIncrement: true },
            PatientStockRequestDetailId: { type: DataTypes.BIGINT, field: 'PatientStockRequestDetailId' },
            PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            PatientStockReturnId: { type: DataTypes.BIGINT, field: 'PatientStockReturnId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
            ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
            ItemName: { type: DataTypes.STRING, field: 'ItemName' },
            IsSupplementary: { type: DataTypes.BOOLEAN, field: 'IsSupplementary' },
            ReturnQuantity: { type: DataTypes.INTEGER, field: 'ReturnQuantity' },
            ReceivedQuantity: { type: DataTypes.INTEGER, field: 'ReceivedQuantity' },
            ReturnStatusId: { type: DataTypes.INTEGER, field: 'ReturnStatusId' },
            StockItemId: { type: DataTypes.BIGINT, field: 'StockItemId' },
            StockSerialItemId: { type: DataTypes.BIGINT, field: 'StockSerialItemId' },
            BatchId: { type: DataTypes.STRING, field: 'BatchId' },
            ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
            Ucp: { type: DataTypes.DECIMAL, field: 'Ucp' },
            Mrp: { type: DataTypes.DECIMAL, field: 'Mrp' },
            GstId: { type: DataTypes.INTEGER, field: 'GstId' },
            GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
            GstAmount: { type: DataTypes.DECIMAL, field: 'GstAmount' },
            InGstId: { type: DataTypes.INTEGER, field: 'InGstId' },
            InGstPercentage: { type: DataTypes.DECIMAL, field: 'InGstPercentage' },
            InGstAmount: { type: DataTypes.DECIMAL, field: 'InGstAmount' },
            CGstId: { type: DataTypes.INTEGER, field: 'CGstId' },
            CGstPercentage: { type: DataTypes.DECIMAL, field: 'CGstPercentage' },
            CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
            SGstId: { type: DataTypes.INTEGER, field: 'SGstId' },
            SGstPercentage: { type: DataTypes.DECIMAL, field: 'SGstPercentage' },
            SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
            GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
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
                tableName: 'patientstockreturndetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientStockReturnDetails as any).associate = function (models: Models) {
        PatientStockReturnDetails.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        /*
        PatientStockReturnDetails.belongsTo(models.PatientBillDetails, { targetKey: 'EncounterId' });
        */
        PatientStockReturnDetails.belongsTo(models.StockItem, { foreignKey: 'StockItemId' });
        PatientStockReturnDetails.belongsTo(models.StockSerialItem, { foreignKey: 'StockSerialItemId' });
        PatientStockReturnDetails.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
        PatientStockReturnDetails.belongsTo(models.PatientStockReturns,
            { as: 'PatientStockReturns', foreignKey: 'PatientStockReturnId' });
    };

    return PatientStockReturnDetails;
}


