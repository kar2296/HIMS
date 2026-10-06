import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PromotionalSchemeInstance, i.PromotionalSchemeAttributes> {
    let PromotionalScheme = sequelize.define<i.PromotionalSchemeInstance,
        i.PromotionalSchemeAttributes>('PromotionalScheme', {
            Id: { type: DataTypes.BIGINT, field: 'PromotionalSchemeId', primaryKey: true, autoIncrement: true },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            PromotionSchemeId: { type: DataTypes.BIGINT, field: 'PromotionSchemeId' },
            PromotionSchemeCode: { type: DataTypes.STRING, field: 'PromotionSchemeCode' },
            PromotionSchemeName: { type: DataTypes.STRING, field: 'PromotionSchemeName' },
            PromotionSchemeTypeId: { type: DataTypes.BIGINT, field: 'PromotionSchemeTypeId' },
            DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
            Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
            ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
            ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
            ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
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
                tableName: 'promotionalschemes',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PromotionalScheme as any).associate = function (models: Models) {
        PromotionalScheme.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        PromotionalScheme.hasMany(models.PromotionalSchemeDetail);
        // PromotionalScheme.belongsTo(models.ReferenceValue, { as: 'PromotionScheme', targetKey: 'ReferenceValueCodeId' });
        PromotionalScheme.belongsTo(models.ReferenceValue, {
            as: 'PromotionSchemeType', foreignKey: 'PromotionSchemeTypeId', targetKey: 'ReferenceValueCodeId'
        });
        PromotionalScheme.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        PromotionalScheme.belongsTo(models.ReferenceValue, { as: 'DiscountMode', targetKey: 'ReferenceValueCodeId' });

    };
    return PromotionalScheme;
}
