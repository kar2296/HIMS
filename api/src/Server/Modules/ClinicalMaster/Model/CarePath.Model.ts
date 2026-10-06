import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CarePathInstance, i.CarePathAttributes> {
    let CarePath = sequelize.define<i.CarePathInstance, i.CarePathAttributes>('CarePath', {
        Id: { type: DataTypes.BIGINT, field: 'CarePathId', primaryKey: true, autoIncrement: true },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        SpecialityId: { type: DataTypes.BIGINT, field: 'SpecialityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        CarePathTypeId: { type: DataTypes.BIGINT, field: 'CarePathTypeId' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Alos: { type: DataTypes.STRING, field: 'Alos' },
        SpecialInstruction: { type: DataTypes.STRING, field: 'SpecialInstruction' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
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
            tableName: 'carepaths',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CarePath as any).associate = function(models: Models) {
                    CarePath.belongsTo(models.Speciality);
                    CarePath.belongsTo(models.Department);
                    CarePath.belongsTo(models.Diagnosis);
                    CarePath.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    CarePath.belongsTo(models.ReferenceValue, { as: 'CarePathType', targetKey: 'ReferenceValueCodeId' });
                };
 return CarePath;
}
