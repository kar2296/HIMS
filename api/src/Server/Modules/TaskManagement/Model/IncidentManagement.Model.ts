import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IncidentManagementInstance, i.IncidentManagementAttributes> {
    let IncidentManagement = sequelize.define<i.IncidentManagementInstance,
        i.IncidentManagementAttributes>('IncidentManagement', {
            Id: { type: DataTypes.BIGINT, field: 'IncidentManagementId', primaryKey: true, autoIncrement: true },
            IncidentNo: { type: DataTypes.STRING, field: 'IncidentNo' },
            IncidentDate: { type: DataTypes.DATE, field: 'IncidentDate' },
            IncidentTypeId: { type: DataTypes.BIGINT, field: 'IncidentTypeId' },
            IncidentStatusId: { type: DataTypes.BIGINT, field: 'IncidentStatusId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            IncidentName: { type: DataTypes.STRING, field: 'IncidentName' },
            IncidentDescription: { type: DataTypes.STRING, field: 'IncidentDescription' },
            PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
            AssignedFrom: { type: DataTypes.BIGINT, field: 'AssignedFrom' },
            AssignedFromDate: { type: DataTypes.DATE, field: 'AssignedFromDate' },
            AssignFromComments: { type: DataTypes.STRING, field: 'AssignFromComments' },
            CreateBy: { type: DataTypes.BIGINT, field: 'CreateBy' },
            CreateDate: { type: DataTypes.DATE, field: 'CreateDate' },
            CreateComments: { type: DataTypes.STRING, field: 'CreateComments' },
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
                tableName: 'hims_incidentmanagement',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (IncidentManagement as any).associate = function (models: Models) {
        IncidentManagement.belongsTo(models.ReferenceValue,
            { as: 'IncidentType', foreignKey: 'IncidentTypeId', targetKey: 'ReferenceValueCodeId' });
        IncidentManagement.belongsTo(models.ReferenceValue,
            { as: 'IncidentStatus', foreignKey: 'IncidentStatusId', targetKey: 'ReferenceValueCodeId' });
        IncidentManagement.belongsTo(models.ReferenceValue,
            { as: 'Priority', foreignKey: 'PriorityId', targetKey: 'ReferenceValueCodeId' });
        IncidentManagement.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        IncidentManagement.belongsTo(models.Department, { foreignKey: 'DepartmentId', as: 'Department' });
        IncidentManagement.belongsTo(models.User, { foreignKey: 'AssignedTo', as: 'AssignedToUser' });
        IncidentManagement.belongsTo(models.User, { foreignKey: 'AssignedFrom', as: 'AssignedFromUser' });
    };
    return IncidentManagement;
}
