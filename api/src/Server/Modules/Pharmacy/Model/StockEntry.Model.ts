import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockEntryInstance, i.StockEntryAttributes> {
    let StockEntry = sequelize.define<i.StockEntryInstance, i.StockEntryAttributes>('StockEntry', {
        Id: { type: DataTypes.BIGINT, field: 'StockEntryId', primaryKey: true, autoIncrement: true },
        StockEntryNumber: { type: DataTypes.STRING, field: 'StockEntryNumber' },
        StockEntryDate: { type: DataTypes.DATE, field: 'StockEntryDate' },
        StockEntryTypeId: { type: DataTypes.BIGINT, field: 'StockEntryTypeId' },
        StockEntryStatusId: { type: DataTypes.BIGINT, field: 'StockEntryStatusId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        TotalInGstAmount: { type: DataTypes.DECIMAL, field: 'TotalInGstAmount' },
        TotalCGstAmount: { type: DataTypes.DECIMAL, field: 'TotalCGstAmount' },
        TotalSGstAmount: { type: DataTypes.DECIMAL, field: 'TotalSGstAmount' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        EnteredBy: { type: DataTypes.INTEGER, field: 'EnteredBy' },
        EnteredDate: { type: DataTypes.DATE, field: 'EnteredDate' },
        EntryComments: { type: DataTypes.STRING, field: 'EntryComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        CancelledBy: { type: DataTypes.INTEGER, field: 'CancelledBy' },
        CancelledDate: { type: DataTypes.DATE, field: 'CancelledDate' },
        CancelledComments: { type: DataTypes.STRING, field: 'CancelledComments' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        CancelReasonId: { type: DataTypes.BIGINT, field: 'CancelReasonId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'openingstockentrys',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StockEntry as any).associate = function (models: Models) {
        StockEntry.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        StockEntry.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        StockEntry.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        StockEntry.belongsTo(models.User, { as: 'EnterBy', foreignKey: 'EnteredBy' });
        StockEntry.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        StockEntry.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'ApprovedBy' });
        StockEntry.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        StockEntry.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
        StockEntry.belongsTo(models.ReferenceValue, { as: 'StockEntryStatus', targetKey: 'ReferenceValueCodeId' });
        StockEntry.belongsTo(models.ReferenceValue, { as: 'StockEntryType', targetKey: 'ReferenceValueCodeId' });
        StockEntry.hasMany(models.StockEntryDetail);
    };

    return StockEntry;
}
