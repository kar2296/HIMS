import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ExaminationMasterInstance, i.ExaminationMasterAttributes> {
    let ExaminationMaster = sequelize.define<i.ExaminationMasterInstance, i.ExaminationMasterAttributes>('ExaminationMaster', {
        Id: { type: DataTypes.BIGINT, field: 'ExaminationMasterId', primaryKey: true, autoIncrement: true },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        ExaminationMasterTypeId: { type: DataTypes.INTEGER, field: 'ExaminationMasterTypeId' },
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
            tableName: 'hims_examinationmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ExaminationMaster as any).associate = function (models: Models) {
        ExaminationMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        ExaminationMaster.belongsTo(models.ReferenceValue, {
            as: 'ExaminationMasterType',
            targetKey: 'ReferenceValueCodeId'
        });
    };
    return ExaminationMaster;
}
