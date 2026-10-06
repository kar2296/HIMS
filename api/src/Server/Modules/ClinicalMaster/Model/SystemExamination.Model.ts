import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SystemExaminationInstance, i.SystemExaminationAttributes> {
    let SystemExamination = sequelize.define<i.SystemExaminationInstance, i.SystemExaminationAttributes>('SystemExamination', {
        Id: { type: DataTypes.BIGINT, field: 'SystemExaminationId', primaryKey: true, autoIncrement: true },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        SysExaminationTypeId: { type: DataTypes.BIGINT, field: 'SysExaminationTypeId' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
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
            tableName: 'systemexaminationmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (SystemExamination as any).associate = function (models: Models) {
        SystemExamination.belongsTo(models.ReferenceValue, {
            as: 'SysExaminationType', foreignKey: 'SysExaminationTypeId', targetKey: 'ReferenceValueCodeId'
        });
        SystemExamination.belongsTo(models.ReferenceValue,
            { as: 'ActiveStatus', foreignKey: 'ActiveStatusId', targetKey: 'ReferenceValueCodeId' });

    };
    return SystemExamination;
}
