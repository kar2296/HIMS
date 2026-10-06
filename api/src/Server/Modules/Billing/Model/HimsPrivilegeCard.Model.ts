import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PrivilegeCardInstance, i.PrivilegeCardAttributes> {
    let PrivilegeCard =
        sequelize.define<i.PrivilegeCardInstance, i.PrivilegeCardAttributes>('PrivilegeCard', {
            Id: { type: DataTypes.BIGINT, field: 'PrivilegeCardId', primaryKey: true, autoIncrement: true },
            PromotionalSchemeId: { type: DataTypes.INTEGER, field: 'PromotionalSchemeId' },
            PromotionSchemeCode: { type: DataTypes.STRING, field: 'PromotionSchemeCode' },
            PromotionSchemeName: { type: DataTypes.STRING, field: 'PromotionSchemeName' },
            CardTypeId: { type: DataTypes.INTEGER, field: 'CardTypeId' },
            CardName: { type: DataTypes.STRING, field: 'CardName' },
            CardNo: { type: DataTypes.STRING, field: 'CardNo' },
            ValidTo: { type: DataTypes.DATE, field: 'ValidTo' },
            ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
                tableName: 'privilegecard',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PrivilegeCard as any).associate = function (models: Models) {
        PrivilegeCard.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        PrivilegeCard.belongsTo(models.ReferenceValue, {
            as: 'PromotionSchemeType',
            targetKey: 'ReferenceValueCodeId', foreignKey: 'CardTypeId'
        });
    };
    return PrivilegeCard;
}
