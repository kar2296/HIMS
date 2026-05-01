import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TesttemplatemasterInstance, i.TesttemplatemasterAttributes> {
    let Testtemplatemaster = sequelize.define<i.TesttemplatemasterInstance, i.TesttemplatemasterAttributes>('Testtemplatemaster', {
        Id: { type: DataTypes.BIGINT, field: 'TesttemplateId', primaryKey: true, autoIncrement: true },
        IdentifyingId: { type: DataTypes.BIGINT, field: 'IdentifyingId' },
        Identifyingtype: { type: DataTypes.STRING, field: 'Identifyingtype' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        isAutoLoad: { type: DataTypes.INTEGER, field: 'isAutoLoad' },
        templatedata: { type: DataTypes.STRING, field: 'templatedata' },
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
            tableName: 'testtemplatemaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Testtemplatemaster as any).associate = function(models: Models) {
                    Testtemplatemaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return Testtemplatemaster;
}
