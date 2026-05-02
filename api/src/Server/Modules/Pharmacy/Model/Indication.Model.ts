import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IndicationInstance, i.IndicationAttributes> {
    let Indication = sequelize.define<i.IndicationInstance, i.IndicationAttributes>('Indication', {
        Id: { type: DataTypes.BIGINT, field: 'IndicationId', primaryKey: true, autoIncrement: true },
        IndicationTypeId: { type: DataTypes.BIGINT, field: 'IndicationTypeId' },
        ShortCode: { type: DataTypes.STRING, field: 'ShortCode' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Indications: { type: DataTypes.STRING, field: 'Indications' },
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
            tableName: 'manageindications',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Indication as any).associate = function (models: Models) {
        Indication.belongsTo(models.ReferenceValue, { as: 'IndicationType', targetKey: 'ReferenceValueCodeId' });
        Indication.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return Indication;
}
