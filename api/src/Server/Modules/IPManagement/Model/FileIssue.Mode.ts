import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FileIssueInstance, i.FileIssueAttributes> {
    let FileIssue = sequelize.define<i.FileIssueInstance, i.FileIssueAttributes>('FileIssue', {
        Id: { type: DataTypes.BIGINT, field: 'MrdIssueId', primaryKey: true, autoIncrement: true },
        MrdIssueId: { type: DataTypes.BIGINT, field: 'MrdIssueId' },
        IssueIdentifier: { type: DataTypes.STRING, field: 'IssueIdentifier' },
        IssueDate: { type: DataTypes.DATE, field: 'IssueDate' },
        IssueTypeId: { type: DataTypes.BIGINT, field: 'IssueTypeId' },
        IssuedBy: { type: DataTypes.INTEGER, field: 'IssuedBy' }, // ADDED: Missing property required by interface
        MrdRequestId: { type: DataTypes.BIGINT, field: 'MrdRequestId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        FromDepartmentId: { type: DataTypes.BIGINT, field: 'FromDepartmentId' },
        ToDepartmentId: { type: DataTypes.BIGINT, field: 'ToDepartmentId' },
        CurrentLocationId: { type: DataTypes.BIGINT, field: 'CurrentLocationId' },
        IssueStatusId: { type: DataTypes.BIGINT, field: 'IssueStatusId' },
        Volume: { type: DataTypes.STRING, field: 'Volume' },
        AcceptedBy: { type: DataTypes.INTEGER, field: 'AcceptedBy' },
        AcceptedDate: { type: DataTypes.DATE, field: 'AcceptedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
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
            tableName: 'mrdfileissues',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (FileIssue as any).associate = function (models: Models) {
        FileIssue.belongsTo(models.Patient);
        FileIssue.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        FileIssue.belongsTo(models.User, { as: 'IssuedByUser', foreignKey: 'IssuedBy' }); // ADDED: Association for IssuedBy
        FileIssue.belongsTo(models.User, { as: 'AcceptedByUser', foreignKey: 'AcceptedBy' }); // ENHANCED: More specific alias
        FileIssue.belongsTo(models.Department, { as: 'ParentDepartment', foreignKey: 'FromDepartmentId' });
        FileIssue.belongsTo(models.Department, { as: 'SubDepartment', foreignKey: 'ToDepartmentId' });
        FileIssue.belongsTo(models.ReferenceValue, { as: 'PRIORITY', targetKey: 'ReferenceValueCodeId' });
        FileIssue.belongsTo(models.ReferenceValue, { as: 'MRDFileStatus', targetKey: 'ReferenceValueCodeId' });
        // FileRequest.belongsTo(models.ReferenceValue,
        //     { as: 'MRDLocation', foreignKey: 'ToDepartmentId', targetKey: 'ReferenceValueCodeId' });
        FileIssue.belongsTo(models.ReferenceValue,
            { as: 'EncounterType', foreignKey: 'MRDTypeId', targetKey: 'ReferenceValueCodeId' });
    };

    return FileIssue as SequelizeStatic.Model<i.FileIssueInstance, i.FileIssueAttributes>; // FIXED: Proper type casting
}
