import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LinenStockEntryInstance, i.LinenStockEntryAttributes> {
    let LinenStockEntry = sequelize.define<i.LinenStockEntryInstance, i.LinenStockEntryAttributes>('LinenStockEntry', {
        Id: { type: DataTypes.BIGINT, field: 'LinenStockEntryId', primaryKey: true, autoIncrement: true },
        LinenStockEntryNumber: { type: DataTypes.STRING, field: 'LinenStockEntryNumber' },
        LinenStockEntryDate: { type: DataTypes.DATE, field: 'LinenStockEntryDate' },
        LinenStockEntryTypeId: { type: DataTypes.BIGINT, field: 'LinenStockEntryTypeId' },
        LinenStockEntryStatusId: { type: DataTypes.BIGINT, field: 'LinenStockEntryStatusId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DepartmentName: { type: DataTypes.STRING, field: 'DepartmentName' },
        EnteredBy: { type: DataTypes.INTEGER, field: 'EnteredBy' },
        EnteredDate: { type: DataTypes.DATE, field: 'EnteredDate' },
        EntryComments: { type: DataTypes.STRING, field: 'EntryComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
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
            tableName: 'linenstockentrys',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (LinenStockEntry as any).associate = function (models: Models) {
        LinenStockEntry.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        LinenStockEntry.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        LinenStockEntry.belongsTo(models.User, { as: 'EnterBy', foreignKey: 'EnteredBy' });
        LinenStockEntry.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        LinenStockEntry.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        LinenStockEntry.belongsTo(models.ReferenceValue, {
            as: 'StockEntryStatus',
            foreignKey: 'LinenStockEntryStatusId', targetKey: 'ReferenceValueCodeId'
        });
        LinenStockEntry.belongsTo(models.ReferenceValue, { as: 'LinenStockEntryType', targetKey: 'ReferenceValueCodeId' });
        // LinenStockEntry.hasMany(models.LinenStockEntryDetail);
    };

    return LinenStockEntry;
}
