import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TaskManagementInstance, i.TaskManagementAttributes> {
    let TaskManagement = sequelize.define<i.TaskManagementInstance,
        i.TaskManagementAttributes>('TaskManagement', {
            Id: { type: DataTypes.BIGINT, field: 'TaskManagementId', primaryKey: true, autoIncrement: true },
            TaskNo: { type: DataTypes.STRING, field: 'TaskNo' },
            TaskDate: { type: DataTypes.DATE, field: 'TaskDate' },
            TaskTypeId: { type: DataTypes.BIGINT, field: 'TaskTypeId' },
            TaskStatusId: { type: DataTypes.BIGINT, field: 'TaskStatusId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            TaskDescription: { type: DataTypes.STRING, field: 'TaskDescription' },
            PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
            AssignedFrom: { type: DataTypes.BIGINT, field: 'AssignedFrom' },
            AssignedFromDate: { type: DataTypes.DATE, field: 'AssignedFromDate' },
            AssignFromComments: { type: DataTypes.STRING, field: 'AssignFromComments' },
            AssignedTo: { type: DataTypes.BIGINT, field: 'AssignedTo' },
            AssignedToDate: { type: DataTypes.DATE, field: 'AssignedToDate' },
            AssignedToComments: { type: DataTypes.STRING, field: 'AssignedToComments' },
            CompletedComments: { type: DataTypes.STRING, field: 'CompletedComments' },
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
                tableName: 'hrms_taskmanagement',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (TaskManagement as any).associate = function (models: Models) {
        TaskManagement.belongsTo(models.ReferenceValue, { as: 'TaskType', foreignKey: 'TaskTypeId', targetKey: 'ReferenceValueCodeId' });
        TaskManagement.belongsTo(models.ReferenceValue,
            { as: 'TaskStatus', foreignKey: 'TaskStatusId', targetKey: 'ReferenceValueCodeId' });
        TaskManagement.belongsTo(models.ReferenceValue,
            { as: 'Priority', foreignKey: 'PriorityId', targetKey: 'ReferenceValueCodeId' });
        TaskManagement.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        TaskManagement.belongsTo(models.User, { foreignKey: 'AssignedTo', as: 'AssignedToUser' });
        TaskManagement.belongsTo(models.User, { foreignKey: 'AssignedFrom', as: 'AssignedFromUser' });
    };
    return TaskManagement;
}
