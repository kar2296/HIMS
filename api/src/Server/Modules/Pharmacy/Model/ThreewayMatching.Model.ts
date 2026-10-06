import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ThreewayMatchingInstance, i.ThreewayMatchingAttributes> {
    let ThreewayMatching = sequelize.define<i.ThreewayMatchingInstance, i.ThreewayMatchingAttributes>('ThreewayMatching', {
        Id: { type: DataTypes.BIGINT, field: 'ThreeWayMatchingId', primaryKey: true, autoIncrement: true },
        InvoiceNumber: { type: DataTypes.STRING, field: 'InvoiceNumber' },
        InvoiceDate: { type: DataTypes.DATE, field: 'InvoiceDate' },
        DcNumber: { type: DataTypes.STRING, field: 'DcNumber' },
        DcDate: { type: DataTypes.DATE, field: 'DcDate' },
        InvoiceTypeId: { type: DataTypes.BIGINT, field: 'InvoiceTypeId' },
        ThreewayStatusId: { type: DataTypes.BIGINT, field: 'ThreewayStatusId' },
        VendorId: { type: DataTypes.BIGINT, field: 'VendorId' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        StoreId: { type: DataTypes.BIGINT, field: 'StoreId' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        CheckedBy: { type: DataTypes.INTEGER, field: 'CheckedBy' },
        CheckedDate: { type: DataTypes.DATE, field: 'CheckedDate' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        PONetAmount: { type: DataTypes.DECIMAL, field: 'PONetAmount' },
        GRNNetAmount: { type: DataTypes.DECIMAL, field: 'GRNNetAmount' },
        DifferentAmount: { type: DataTypes.DECIMAL, field: 'DifferentAmount' },
        InvoiceAmount: { type: DataTypes.DECIMAL, field: 'InvoiceAmount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        RoundOff: { type: DataTypes.DECIMAL, field: 'RoundOff' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        CancelReasonId: { type: DataTypes.BIGINT, field: 'CancelReasonId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'Createdby' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'Updatedby' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'Threewaymatching',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ThreewayMatching as any).associate = function(models: Models) {
                    ThreewayMatching.belongsTo(models.ItemMaster, { foreignKey: 'ItemId' });
                };
 return ThreewayMatching;
}
