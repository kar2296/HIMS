import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssetInsuranceInstance, i.AssetInsuranceAttributes> {
    let AssetInsurance = sequelize.define<i.AssetInsuranceInstance, i.AssetInsuranceAttributes>('AssetInsurance', {
        Id: { type: DataTypes.BIGINT, field: 'InsuranceId', primaryKey: true, autoIncrement: true },
        InsuranceId: { type: DataTypes.INTEGER, field: 'InsuranceId' },
        InsuranceCode: { type: DataTypes.STRING, field: 'InsuranceCode' },
        InsuranceName: { type: DataTypes.STRING, field: 'InsuranceName' },
        AssetId: { type: DataTypes.INTEGER, field: 'AssetId' },
        IDVValue: { type: DataTypes.STRING, field: 'IDVValue' },
        PremimumAmount: { type: DataTypes.DECIMAL, field: 'PremimumAmount' },
        PeriodStart: { type: DataTypes.DATE, field: 'PeriodStart' },
        PeriodEnd: { type: DataTypes.DATE, field: 'PeriodEnd' },
        PolicyTypeId: { type: DataTypes.INTEGER, field: 'PolicyTypeId' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'hims_assetinsurance',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AssetInsurance as any).associate = function (models: Models) {
        AssetInsurance.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        AssetInsurance.belongsTo(models.ReferenceValue,
            { as: 'Insurance', foreignKey: 'InsuranceId', targetKey: 'ReferenceValueCodeId' });
        AssetInsurance.belongsTo(models.Asset, { foreignKey: 'AssetId' });
        AssetInsurance.belongsTo(models.ReferenceValue,
            { as: 'PolicyType', foreignKey: 'PolicyTypeId', targetKey: 'ReferenceValueCodeId' });

    };
    return AssetInsurance;
}
