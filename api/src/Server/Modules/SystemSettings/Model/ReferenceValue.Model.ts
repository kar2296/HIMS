import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ReferenceValueInstance, i.ReferenceValueAttributes> {
    let ReferenceValue = sequelize.define<i.ReferenceValueInstance, i.ReferenceValueAttributes>('ReferenceValue', {
        Id: { type: DataTypes.BIGINT, field: 'ReferenceValueId', primaryKey: true, autoIncrement: true },
        ReferenceValueGroupId: { type: DataTypes.BIGINT, field: 'ReferenceValueGroupId' },
        GroupCode: { type: DataTypes.STRING, field: 'GroupCode' },
        ReferenceValueCode: { type: DataTypes.STRING, field: 'ReferenceValueCode' },
        ReferenceValueCodeId: { type: DataTypes.BIGINT, field: 'ReferenceValueCodeId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        IsDefault: { type: DataTypes.BOOLEAN, field: 'IsDefault' },
        AlternateName: { type: DataTypes.STRING, field: 'AlternateName' },
        LanguageId: { type: DataTypes.BIGINT, field: 'LanguageId' },
        ObjectTypeId: { type: DataTypes.BIGINT, field: 'ObjectTypeId' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
		IsActive: { type :DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId : { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        ColorCode: { type: DataTypes.STRING, field: 'ColorCode' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        NumericValue: { type: DataTypes.INTEGER, field: 'NumericValue' },
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
            tableName: 'referencevalues',
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
        (ReferenceValue as any).associate = function(models: Models) {
            ReferenceValue.belongsTo(models.ReferenceValueGroup);
			 ReferenceValue.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
            ReferenceValue.belongsTo(models.ReferenceValue, { as: 'Language', targetKey: 'ReferenceValueCodeId' });
        };
    return ReferenceValue;
}
