import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TicksheetmasterInstance, i.TicksheetmasterAttributes> {
    let Ticksheetmaster = sequelize.define<i.TicksheetmasterInstance, i.TicksheetmasterAttributes>('Ticksheetmaster', {
        Id: { type: DataTypes.BIGINT, field: 'Id', primaryKey: true, autoIncrement: true },
        Ticksheetname: { type: DataTypes.STRING, field: 'Ticksheetname' },
        Displayorder: { type: DataTypes.BIGINT, field: 'Displayorder' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        TicksheetTypeId: { type: DataTypes.BIGINT, field: 'TicksheetTypeId' },
        TestmasterId: { type: DataTypes.BIGINT, field: 'TestmasterId' },
        TestName: { type: DataTypes.STRING, field: 'TestName' },
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
            tableName: 'ticksheetmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Ticksheetmaster as any).associate = function(models: Models) {
                    Ticksheetmaster.belongsTo(models.ReferenceValue, { as: 'TicksheetType', targetKey: 'ReferenceValueCodeId' });
                    Ticksheetmaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    Ticksheetmaster.belongsTo(models.Department, { as: 'Department', foreignKey: 'DepartmentId' });
                    Ticksheetmaster.belongsTo(models.Department, { as: 'SubDepartment', foreignKey: 'SubDepartmentId' });
                };
 return Ticksheetmaster;
}
