import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EntityPrintHistoryInstance, i.EntityPrintHistoryAttributes> {
    let EntityPrintHistory = sequelize.define<i.EntityPrintHistoryInstance, i.EntityPrintHistoryAttributes>('EntityPrintHistory', {
        Id: { type: DataTypes.BIGINT, field: 'EntityPrintHistoryId', primaryKey: true, autoIncrement: true },
        ObjectId: { type: DataTypes.BIGINT, field: 'ObjectId' },
        ObjectTypeId: { type: DataTypes.BIGINT, field: 'ObjectTypeId' },
        PrintDate: { type: DataTypes.DATE, field: 'PrintDate' },
        PrintById: { type: DataTypes.BIGINT, field: 'PrintById' },
        PrintTypeId: { type: DataTypes.BIGINT, field: 'PrintTypeId' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
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
            tableName: 'entityprinthistory',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (EntityPrintHistory as any).associate = function(models: Models) {
                    EntityPrintHistory.belongsTo(models.User, { as: 'PrintBy', foreignKey: 'PrintById' });
                    EntityPrintHistory.belongsTo(models.ReferenceValue, { as: 'ObjectType', targetKey: 'ReferenceValueCodeId' });
                    EntityPrintHistory.belongsTo(models.ReferenceValue, { as: 'PrintType', targetKey: 'ReferenceValueCodeId' });
                    // EntityPrintHistory.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
                    EntityPrintHistory.belongsTo(models.Facility);
                };
 return EntityPrintHistory;
}
