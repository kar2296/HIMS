import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CardMasterInstance, i.CardMasterAttributes> {
    let CardMaster = sequelize.define<i.CardMasterInstance, i.CardMasterAttributes>('CardMaster', {
        Id: { type: DataTypes.BIGINT, field: 'CardMasterId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        CardMasterTypeId: { type: DataTypes.BIGINT, field: 'CardMasterTypeId' },
        CardTypeId: { type: DataTypes.BIGINT, field: 'CardTypeId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        CardName: { type: DataTypes.STRING, field: 'CardName' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'cardmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (CardMaster as any).associate = function (models: Models) {
        CardMaster.belongsTo(models.Facility);
        CardMaster.belongsTo(models.ReferenceValue, { as: 'CardMasterType', targetKey: 'ReferenceValueCodeId' });
        CardMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        CardMaster.belongsTo(models.ReferenceValue, { as: 'CardType', targetKey: 'ReferenceValueCodeId', foreignKey: 'CardTypeId' });
    };
    return CardMaster;
}
