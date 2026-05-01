import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TestmasterBOMInstance, i.TestmasterBOMAttributes> {
    let TestmasterBOM = sequelize.define<i.TestmasterBOMInstance, i.TestmasterBOMAttributes>('TestmasterBOM', {
        Id: { type: DataTypes.BIGINT, field: 'TestBOMId', primaryKey: true, autoIncrement: true },
        TestmasterId: { type: DataTypes.BIGINT, field: 'TestmasterId' },
        BOMType: { type: DataTypes.INTEGER, field: 'BOMType' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        IsDefault: { type: DataTypes.BOOLEAN, field: 'IsDefault' },
        ItemCategoryId: { type: DataTypes.INTEGER, field: 'ItemCategoryId' },
        ItemSubCategoryId: { type: DataTypes.INTEGER, field: 'ItemSubCategoryId' },
        ItemId: { type: DataTypes.INTEGER, field: 'ItemId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        UCP: { type: DataTypes.DECIMAL, field: 'UCP' },
		CostPrice: { type: DataTypes.DECIMAL, field: 'CostPrice' },
        OtherCost: { type: DataTypes.DECIMAL, field: 'OtherCost' },
        ProductTypeId: { type: DataTypes.INTEGER, field: 'ProductTypeId' },
        ProductSubTypeId: { type: DataTypes.INTEGER, field: 'ProductSubTypeId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        Wastage: { type: DataTypes.DECIMAL, field: 'Wastage' },
        NoOfTests: { type: DataTypes.INTEGER, field: 'NoOfTests' },
        QC: { type: DataTypes.DECIMAL, field: 'QC' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'testmasterbom',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (TestmasterBOM as any).associate = function(models: Models) {
                    TestmasterBOM.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    TestmasterBOM.belongsTo(models.ItemMaster, { foreignKey: 'ItemId' });
                };
 return TestmasterBOM;
}
