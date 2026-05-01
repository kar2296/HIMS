import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IPClearenceInstance, i.IPClearenceAttributes> {
    let IPClearence = sequelize.define<i.IPClearenceInstance, i.IPClearenceAttributes>('IPClearence', {
        Id: { type: DataTypes.BIGINT, field: 'IPClearenceId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.INTEGER, field: 'PatientId' },
        PatientName: { type: DataTypes.INTEGER, field: 'PatientName' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        EncounterId: { type: DataTypes.INTEGER, field: 'EncounterId' },
        VisitNo: { type: DataTypes.INTEGER, field: 'VisitNo' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.INTEGER, field: 'DoctorName' },
        Comments: { type: DataTypes.INTEGER, field: 'Comments' },
        AdmissionStatusId: { type: DataTypes.INTEGER, field: 'AdmissionStatusId' },
        DepartmentId: { type: DataTypes.INTEGER, field: 'DepartmentId' },
        IPClearenceStatusId: { type: DataTypes.INTEGER, field: 'IPClearenceStatusId' },
        IPClearenceDate: { type: DataTypes.DATE, field: 'IPClearenceDate' },
        RequestedBy: { type: DataTypes.INTEGER, field: 'RequestedBy' },
        RequestedDate: { type: DataTypes.DATE, field: 'RequestedDate' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
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
            tableName: 'hims_ipclearence',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (IPClearence as any).associate = function (models: Models) {
        IPClearence.belongsTo(models.ReferenceValue, {
            as: 'IPClearenceStatus',
            targetKey: 'ReferenceValueCodeId', foreignKey: 'IPClearenceStatusId'
        });
        IPClearence.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'RequestedBy' });
        IPClearence.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        IPClearence.belongsTo(models.Patient);
        IPClearence.belongsTo(models.Encounter);
        IPClearence.belongsTo(models.Department);
        IPClearence.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        IPClearence.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        IPClearence.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
    };
    return IPClearence;
}
