import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PromotionalSchemeDetailInstance, i.PromotionalSchemeDetailAttributes> {
    let PromotionalSchemeDetail = sequelize.define<i.PromotionalSchemeDetailInstance,
        i.PromotionalSchemeDetailAttributes>(
            'PromotionalSchemeDetail', {
                Id: { type: DataTypes.BIGINT, field: 'PromotionalSchemeDetailId', primaryKey: true, autoIncrement: true },
                PromotionalSchemeId: { type: DataTypes.BIGINT, field: 'PromotionalSchemeId' },
                ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
                ServiceCategoryCode: { type: DataTypes.STRING, field: 'ServiceCategoryCode' },
                ServiceCategoryName: { type: DataTypes.STRING, field: 'ServiceCategoryName' },
                ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
                ServiceItemCode: { type: DataTypes.STRING, field: 'ServiceItemCode' },
                ServiceItemName: { type: DataTypes.STRING, field: 'ServiceItemName' },
                DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
                Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
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
                tableName: 'promotionalschemedetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });
    (PromotionalSchemeDetail as any).associate = function (models: Models) {
        PromotionalSchemeDetail.belongsTo(models.ReferenceValue, { as: 'DiscountMode', targetKey: 'ReferenceValueCodeId' });
    };


    return PromotionalSchemeDetail;
}
