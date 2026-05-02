import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockAdjustmentInstance, i.StockAdjustmentAttributes> {
    let StockAdjustment = sequelize.define<i.StockAdjustmentInstance, i.StockAdjustmentAttributes>('StockAdjustment', {
        Id: { type: DataTypes.BIGINT, field: 'StockAdjustmentId', primaryKey: true, autoIncrement: true },
        StockAdjustmentNumber: { type: DataTypes.STRING, field: 'StockAdjustmentNumber' },
        AdjustmentTypeId: { type: DataTypes.BIGINT, field: 'AdjustmentTypeId' },
        AdjustmentStatusId: { type: DataTypes.INTEGER, field: 'AdjustmentStatusId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        DepartmentId: { type: DataTypes.INTEGER, field: 'DepartmentId' },
        LocationId: { type: DataTypes.INTEGER, field: 'LocationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        AdjustedBy: { type: DataTypes.INTEGER, field: 'AdjustedBy' },
        AdjustedDate: { type: DataTypes.DATE, field: 'AdjustedDate' },
        AdjusterComments: { type: DataTypes.STRING, field: 'AdjusterComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
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
            tableName: 'stockadjustments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StockAdjustment as any).associate = function (models: Models) {
        StockAdjustment.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        StockAdjustment.belongsTo(models.StoreMaster, { as: 'StoreMaster', foreignKey: 'StoreMasterId' });
        StockAdjustment.belongsTo(models.ReferenceValue, { as: 'AdjustmentStatus', targetKey: 'ReferenceValueCodeId' });
        StockAdjustment.belongsTo(models.ReferenceValue, { as: 'AdjustmentType', targetKey: 'ReferenceValueCodeId' });
        StockAdjustment.belongsTo(models.User, { as: 'AdjustedUser', foreignKey: 'AdjustedBy' });
        StockAdjustment.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        StockAdjustment.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        StockAdjustment.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        StockAdjustment.hasMany(models.StockAdjustmentDetail);
    };

    return StockAdjustment;
}
