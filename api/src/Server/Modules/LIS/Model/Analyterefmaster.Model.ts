import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AnalyterefmasterInstance, i.AnalyterefmasterAttributes> {
    let Analyterefmaster = sequelize.define<i.AnalyterefmasterInstance, i.AnalyterefmasterAttributes>('Analyterefmaster', {
        Id: { type: DataTypes.BIGINT, field: 'AnalyterefId', primaryKey: true, autoIncrement: true },
        AnalyteId: { type: DataTypes.BIGINT, field: 'AnalyteId' },
        GenderId: { type: DataTypes.INTEGER, field: 'GenderId' },
        AnalyteRefTypeId: { type: DataTypes.BIGINT, field: 'AnalyteRefTypeId' },
        Agefrom: { type: DataTypes.INTEGER, field: 'Agefrom' },
        Ageto: { type: DataTypes.INTEGER, field: 'Ageto' },
        Excludefrmprt: { type: DataTypes.BOOLEAN, field: 'Excludefrmprt' },
        Refvalue: { type: DataTypes.STRING, field: 'Refvalue' },
        Maxvalue: { type: DataTypes.STRING, field: 'Maxvalue' },
        Minvalue: { type: DataTypes.STRING, field: 'Minvalue' },
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
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'analyterefmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Analyterefmaster as any).associate = function(models: Models) {
                    Analyterefmaster.belongsTo(models.ReferenceValue, { as: 'Gender', targetKey: 'ReferenceValueCodeId' });
                    Analyterefmaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    Analyterefmaster.belongsTo(models.ReferenceValue, { as: 'AnalyteRefType', targetKey: 'ReferenceValueCodeId' });
                };
 return Analyterefmaster;
}
