import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TestmasteranalytemapInstance, i.TestmasteranalytemapAttributes> {
    let Testmasteranalytemap = sequelize.define<i.TestmasteranalytemapInstance, i.TestmasteranalytemapAttributes>('Testmasteranalytemap', {
        Id: { type: DataTypes.BIGINT, field: 'TestAnalyteId', primaryKey: true, autoIncrement: true },
        TestmasterId: { type: DataTypes.BIGINT, field: 'TestmasterId' },
        TestmasterMapId: { type: DataTypes.BIGINT, field: 'TestmasterMapId' },
        AnalyteId: { type: DataTypes.BIGINT, field: 'AnalyteMasterId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'testmasteranalytemap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Testmasteranalytemap as any).associate = function(models: Models) {
                    Testmasteranalytemap.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    Testmasteranalytemap.belongsTo(models.Testmaster);
                    Testmasteranalytemap.belongsTo(models.Analytemaster);
                    Testmasteranalytemap.belongsTo(models.Testmaster, {as:'TestAnalyteName', foreignKey: 'TestmasterMapId' });
                };
 return Testmasteranalytemap;
}
