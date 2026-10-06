import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AnalytealiasesmasterInstance, i.AnalytealiasesmasterAttributes> {
    let Analytealiasesmaster = sequelize.define<i.AnalytealiasesmasterInstance, i.AnalytealiasesmasterAttributes>('Analytealiasesmaster', {
        Id: { type: DataTypes.BIGINT, field: 'AnalytealiasesId', primaryKey: true, autoIncrement: true },
        AnalyteId: { type: DataTypes.BIGINT, field: 'AnalyteId' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        AliasesTypeId: { type: DataTypes.BIGINT, field: 'AliasesTypeId' },
        Activestate: { type: DataTypes.INTEGER, field: 'Activestate' },
        Activefrom: { type: DataTypes.DATE, field: 'Activefrom' },
        Activeto: { type: DataTypes.DATE, field: 'Activeto' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'analytealiasesmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Analytealiasesmaster as any).associate = function(models: Models) {
                    Analytealiasesmaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    Analytealiasesmaster.belongsTo(models.ReferenceValue, { as: 'AliasesType', targetKey: 'ReferenceValueCodeId' });
                };
 return Analytealiasesmaster;
}
