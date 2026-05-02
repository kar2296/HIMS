import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AllergyReactionInstance, i.AllergyReactionAttributes> {
    let AllergyReaction = sequelize.define<i.AllergyReactionInstance, i.AllergyReactionAttributes>('AllergyReaction', {
        Id: { type: DataTypes.BIGINT, field: 'AllergyReactionId', primaryKey: true, autoIncrement: true },
        DisplayId: { type: DataTypes.STRING, field: 'DisplayId' },
        AllergyReactionName: { type: DataTypes.STRING, field: 'AllergyReactionName' },
        AllergyReactionTypeId: { type: DataTypes.BIGINT, field: 'AllergyReactionTypeId' },
        ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
        Description: { type: DataTypes.STRING, field: 'Description' },
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
            tableName: 'allergyreactions',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (AllergyReaction as any).associate = function(models: Models) {
                    AllergyReaction.belongsTo(models.ReferenceValue, { as: 'AllergyReactionType', targetKey: 'ReferenceValueCodeId' });
                    AllergyReaction.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return AllergyReaction;
}
