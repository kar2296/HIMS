import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DrugMasterInstance, i.DrugMasterAttributes> {
    let DrugMaster = sequelize.define<i.DrugMasterInstance, i.DrugMasterAttributes>('DrugMaster', {
        Id: { type: DataTypes.BIGINT, field: 'DrugId', primaryKey: true, autoIncrement: true },
        DrugTypeId: { type: DataTypes.BIGINT, field: 'DrugTypeId' },
        DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
        DrugName: { type: DataTypes.STRING, field: 'DrugName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
        GenericCode: { type: DataTypes.STRING, field: 'GenericCode' },
        GenericName: { type: DataTypes.STRING, field: 'GenericName' },
        DrugTradeId: { type: DataTypes.BIGINT, field: 'DrugTradeId' },
        DrugFormId: { type: DataTypes.BIGINT, field: 'DrugFormId' },
        DrugFrequencyId: { type: DataTypes.BIGINT, field: 'DrugFrequencyId' },
        Duration: { type: DataTypes.STRING, field: 'Duration' },
        DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
        DrugInstructionId: { type: DataTypes.BIGINT, field: 'DrugInstructionId' },
        Advice: { type: DataTypes.STRING, field: 'Advice' },
        DrugRouteId: { type: DataTypes.BIGINT, field: 'DrugRouteId' },
        MaxDosagePerDay: { type: DataTypes.STRING, field: 'MaxDosagePerDay' },
        IsEssentialDrug: { type: DataTypes.BOOLEAN, field: 'IsEssentialDrug' },
        IsFormulary: { type: DataTypes.BOOLEAN, field: 'IsFormulary' },
        DrugGroupId: { type: DataTypes.BIGINT, field: 'DrugGroupId' },
        DrugSubGroupId: { type: DataTypes.BIGINT, field: 'DrugSubGroupId' },
        IsDosageNotApplicable: { type: DataTypes.BOOLEAN, field: 'IsDosageNotApplicable' },
        IsSpecialApprovalRequired: { type: DataTypes.BOOLEAN, field: 'IsSpecialApprovalRequired' },
        IsDrugDatabaseAlert: { type: DataTypes.BOOLEAN, field: 'IsDrugDatabaseAlert' },
        IsOrderWithoutPrescription: { type: DataTypes.BOOLEAN, field: 'IsOrderWithoutPrescription' },
        IsCalculateFrequencyQty: { type: DataTypes.BOOLEAN, field: 'IsCalculateFrequencyQty' },
        IsCrushable: { type: DataTypes.BOOLEAN, field: 'IsCrushable' },
        IsNotUseForIP: { type: DataTypes.BOOLEAN, field: 'IsNotUseForIP' },
        IsAllowToOrder: { type: DataTypes.BOOLEAN, field: 'IsAllowToOrder' },
        IsBottleType: { type: DataTypes.BOOLEAN, field: 'IsBottleType' },
        AuthenticationLevelId: { type: DataTypes.BIGINT, field: 'AuthenticationLevelId' },
        LogoPath: { type: DataTypes.STRING, field: 'LogoPath' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        TallmanContent: { type: DataTypes.TEXT, field: 'TallmanContent' },
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
            tableName: 'drugmasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (DrugMaster as any).associate = function(models: Models) {
                    DrugMaster.belongsTo(models.GenericMaster, { foreignKey: 'GenericId' });
                    DrugMaster.belongsTo(models.DrugFrequency, { foreignKey: 'DrugFrequencyId' });
                    DrugMaster.belongsTo(models.ReferenceValue, { as: 'DrugForm', targetKey: 'ReferenceValueCodeId' });
                    DrugMaster.belongsTo(models.ReferenceValue, { as: 'DrugType', targetKey: 'ReferenceValueCodeId' });
                    DrugMaster.belongsTo(models.ReferenceValue, { as: 'DrugTrade', targetKey: 'ReferenceValueCodeId' });
                    DrugMaster.belongsTo(models.ReferenceValue, { as: 'DrugGroup', targetKey: 'ReferenceValueCodeId' });
                    DrugMaster.belongsTo(models.ReferenceValue, { as: 'DrugSubGroup', targetKey: 'ReferenceValueCodeId' });
                    DrugMaster.belongsTo(models.ReferenceValue, { as: 'DurationPeriod', targetKey: 'ReferenceValueCodeId' });
                    DrugMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    DrugMaster.belongsTo(models.ItemMaster, { foreignKey: 'Id', targetKey: 'DrugId', as: 'ItemMaster' });
                };
 return DrugMaster;
}
