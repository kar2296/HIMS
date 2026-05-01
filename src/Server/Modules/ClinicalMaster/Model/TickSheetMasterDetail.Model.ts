import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TickSheetMasterDetailInstance, i.TickSheetMasterDetailAttributes> {
    let TickSheetMasterDetail = sequelize.define<i.TickSheetMasterDetailInstance, i.
        TickSheetMasterDetailAttributes>('TickSheetMasterDetail', {
            Id: { type: DataTypes.BIGINT, field: 'TickSheetMasterDetailId', primaryKey: true, autoIncrement: true },
            TickSheetMasterId: { type: DataTypes.BIGINT, field: 'TickSheetMasterId' },
            ItemId: { type: DataTypes.BIGINT, field: 'ItemId' },
            ItemName: { type: DataTypes.STRING, field: 'ItemName' },
            GroupName: { type: DataTypes.STRING, field: 'GroupName' },
            DisplayOrder: { type: DataTypes.BIGINT, field: 'DisplayOrder' },
            TickSheetMasterTypeId: { type: DataTypes.BIGINT, field: 'TickSheetMasterTypeId' },
            DrugName: { type: DataTypes.STRING, field: 'DrugName' },
            DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
            Dosage: { type: DataTypes.STRING, field: 'Dosage' },
            Morning: { type: DataTypes.STRING, field: 'Morning' },
            Noon: { type: DataTypes.STRING, field: 'Noon' },
            Night: { type: DataTypes.STRING, field: 'Night' },
            Notes: { type: DataTypes.STRING, field: 'Notes' },
            Duration: { type: DataTypes.INTEGER, field: 'Duration' },
            DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
            DrugInstructionId: { type: DataTypes.BIGINT, field: 'DrugInstructionId' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            TestName: { type: DataTypes.STRING, field: 'TestName' },
            TestCode: { type: DataTypes.STRING, field: 'TestCode' },
            TestTypeId: { type: DataTypes.BIGINT, field: 'TestTypeId' },
            IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
            ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
            ServiceCode: { type: DataTypes.STRING, field: 'ServiceCode' },
            ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
            ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
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
                tableName: 'hims_orderfavoritedetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    },
                    order: [
                        ['DisplayOrder', 'ASC']
                    ]
                }
            });

    (TickSheetMasterDetail as any).associate = function (models: Models) {
        TickSheetMasterDetail.belongsTo(models.Testmaster, { foreignKey: 'ItemId' });
        TickSheetMasterDetail.belongsTo(models.DrugMaster, { foreignKey: 'ItemId' });
        TickSheetMasterDetail.belongsTo(models.DietItemMaster, { foreignKey: 'ItemId' });
        TickSheetMasterDetail.belongsTo(models.ItemMaster, { foreignKey: 'ItemId' });
        TickSheetMasterDetail.belongsTo(models.ReferenceValue, {
            as: 'DurationPeriod', targetKey: 'ReferenceValueCodeId', foreignKey: 'DurationPeriodId'
        });
        TickSheetMasterDetail.belongsTo(models.ReferenceValue,
            { as: 'TESTMASTERTYP', foreignKey: 'TestTypeId', targetKey: 'ReferenceValueCodeId' });
        TickSheetMasterDetail.belongsTo(models.ItemMaster, { as: 'ItemStoreMaster', foreignKey: 'ItemId', targetKey: 'DrugId' });
    };

    return TickSheetMasterDetail;
}
