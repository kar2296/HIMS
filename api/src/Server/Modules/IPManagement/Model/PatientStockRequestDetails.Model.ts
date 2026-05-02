import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientStockRequestDetailsInstance, i.PatientStockRequestDetailsAttributes> {
    let PatientStockRequestDetails = sequelize.define<i.PatientStockRequestDetailsInstance,
        i.PatientStockRequestDetailsAttributes>('PatientStockRequestDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientStockRequestDetailId', primaryKey: true, autoIncrement: true },
            PatientStockRequestId: { type: DataTypes.BIGINT, field: 'PatientStockRequestId' },
            PrescriptionDetailId: { type: DataTypes.BIGINT, field: 'PrescriptionDetailId' },
            ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
            ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
            ItemName: { type: DataTypes.STRING, field: 'ItemName' },
            GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
            GenericCode: { type: DataTypes.STRING, field: 'GenericCode' },
            GenericName: { type: DataTypes.STRING, field: 'GenericName' },
            RequestedQuantity: { type: DataTypes.INTEGER, field: 'RequestedQuantity' },
            DispensedQuantity: { type: DataTypes.INTEGER, field: 'DispensedQuantity' },
            SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
            PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
            BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
            ConversionQuantity: { type: DataTypes.INTEGER, field: 'ConversionQuantity' },
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
                tableName: 'patientstockrequestdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientStockRequestDetails as any).associate = function (models: Models) {
        PatientStockRequestDetails.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        PatientStockRequestDetails.belongsTo(models.UomMaster, { as: 'SaleUom', foreignKey: 'SaleUomId' });
        PatientStockRequestDetails.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        PatientStockRequestDetails.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        PatientStockRequestDetails.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
        PatientStockRequestDetails.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientStockRequestDetails.belongsTo(models.PatientStockRequests,
            { as: 'PatientStockRequests', foreignKey: 'PatientStockRequestId' });
    };

    return PatientStockRequestDetails;
}


