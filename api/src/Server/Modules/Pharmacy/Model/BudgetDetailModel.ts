import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BudgetDetailInstance, i.BudgetDetailAttributes> {
    let BudgetDetail = sequelize.define<i.BudgetDetailInstance, i.BudgetDetailAttributes>('BudgetDetail', {
        Id: { type: DataTypes.BIGINT, field: 'BudgetDetailId', primaryKey: true, autoIncrement: true },
        BudgetId: { type: DataTypes.BIGINT, field: 'BudgetId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        CategoryName: { type: DataTypes.STRING, field: 'CategoryName' },
        SubCategoryName: { type: DataTypes.STRING, field: 'SubCategoryName' },
        ConsumedCost: { type: DataTypes.DECIMAL, field: 'ConsumedCost' },
        BudgetCost: { type: DataTypes.DECIMAL, field: 'BudgetCost' },
        PendingCost: { type: DataTypes.DECIMAL, field: 'PendingCost' },
        Remarks: { type: DataTypes.INTEGER, field: 'Remarks' },
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
            tableName: 'budgetdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (BudgetDetail as any).associate = function (models: Models) {
        //     IPPackage.hasMany(models.IPPackageDetail);
        //     IPPackage.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        //     IPPackage.belongsTo(models.Department);
        //     IPPackage.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };

    return BudgetDetail;
}
