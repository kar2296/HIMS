import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BudgetInstance, i.BudgetAttributes> {
    let Budget = sequelize.define<i.BudgetInstance, i.BudgetAttributes>('Budget', {
        Id: { type: DataTypes.BIGINT, field: 'BudgetId', primaryKey: true, autoIncrement: true },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        CategoryName: { type: DataTypes.STRING, field: 'CategoryName' },
        SubCategoryName: { type: DataTypes.STRING, field: 'SubCategoryName' },
        BudgetTrackId: { type: DataTypes.BIGINT, field: 'BudgetTrackId' },
        Date: { type: DataTypes.DATE, field: 'Date' },
        DateFrom: { type: DataTypes.DATE, field: 'DateFrom' },
        DateTo: { type: DataTypes.DATE, field: 'DateTo' },
        ConsumedCost: { type: DataTypes.DECIMAL, field: 'ConsumedCost' },
        BudgetCost: { type: DataTypes.DECIMAL, field: 'BudgetCost' },
        PendingCost: { type: DataTypes.BIGINT, field: 'PendingCost' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedAt: { type: DataTypes.DATE, field: 'ApprovedAt' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedAt: { type: DataTypes.DATE, field: 'AuthorizedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'budgets',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Budget as any).associate = function(models: Models) {
                    // Budget.hasMany(models.BudgetDetail);
                    //     IPPackage.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
                    Budget.belongsTo(models.Department);
                    Budget.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return Budget;
}
