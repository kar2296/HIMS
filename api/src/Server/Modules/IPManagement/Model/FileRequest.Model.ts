import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FileRequestInstance, i.FileRequestAttributes> {
    let FileRequest = sequelize.define<i.FileRequestInstance, i.FileRequestAttributes>('FileRequest', {
        Id: { type: DataTypes.BIGINT, field: 'MrdRequestId', primaryKey: true, autoIncrement: true },
        MrdRequestId: { type: DataTypes.BIGINT, field: 'MrdRequestId' },
        RequestIdentifier: { type: DataTypes.STRING, field: 'RequestIdentifier' },
        RequestDate: { type: DataTypes.DATE, field: 'RequestDate' },
        RequestTypeId: { type: DataTypes.BIGINT, field: 'RequestTypeId' },
        MRDTypeId: { type: DataTypes.BIGINT, field: 'MRDTypeId' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        RequestedDoctorId: { type: DataTypes.BIGINT, field: 'RequestedDoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        FromDepartmentId: { type: DataTypes.BIGINT, field: 'FromDepartmentId' },
        ToDepartmentId: { type: DataTypes.BIGINT, field: 'ToDepartmentId' },
        CurrentLocationId: { type: DataTypes.BIGINT, field: 'CurrentLocationId' },
        MRDFileStatusId: { type: DataTypes.BIGINT, field: 'MRDFileStatusId' },
        MRDMovementStatusId: { type: DataTypes.BIGINT, field: 'MRDMovementStatusId' },
        Volume: { type: DataTypes.STRING, field: 'Volume' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        IsManual: { type: DataTypes.BOOLEAN, field: 'IsManual' },
        MrdLocId: { type: DataTypes.BIGINT, field: 'MrdLocId' },
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
            tableName: 'mrdfilerequests',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (FileRequest as any).associate = function (models: Models) {
        FileRequest.belongsTo(models.Patient);
        FileRequest.belongsTo(models.Encounter);
        FileRequest.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        FileRequest.belongsTo(models.ReferenceValue, { as: 'MRDRequestType', foreignKey: 'RequestTypeId' });
        FileRequest.belongsTo(models.Department, { as: 'ParentDepartment', foreignKey: 'FromDepartmentId' });
        FileRequest.belongsTo(models.Department, { as: 'SubDepartment', foreignKey: 'ToDepartmentId' });
        FileRequest.belongsTo(models.ReferenceValue, { as: 'PRIORITY', targetKey: 'ReferenceValueCodeId' });
        FileRequest.belongsTo(models.ReferenceValue, { as: 'MRDFileStatus', targetKey: 'ReferenceValueCodeId' });
        FileRequest.belongsTo(models.ReferenceValue, { as: 'MRDMovementStatus', targetKey: 'ReferenceValueCodeId' });
        FileRequest.belongsTo(models.ReferenceValue,
            { as: 'EncounterType', foreignKey: 'MRDTypeId', targetKey: 'ReferenceValueCodeId' });
    };

    return FileRequest;
}
