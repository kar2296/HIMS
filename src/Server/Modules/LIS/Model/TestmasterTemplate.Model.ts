import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TestmasterTemplateInstance, i.TestmasterTemplateAttributes> {
    let TestmasterTemplate = sequelize.define<i.TestmasterTemplateInstance, i.TestmasterTemplateAttributes>('TestmasterTemplate', {
        Id: { type: DataTypes.BIGINT, field: 'TestTemplateId', primaryKey: true, autoIncrement: true },
        TestmasterId: { type: DataTypes.BIGINT, field: 'TestmasterId' },
        MaleDataTemplate: { type: DataTypes.TEXT, field: 'MaleDataTemplate' },
        FemaleDataTemplate: { type: DataTypes.TEXT, field: 'FemaleDataTemplate' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'testmastertemplate',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return TestmasterTemplate;
}
