import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IPFileRequestInstance, i.IPFileRequestAttributes> {
    let IPFileRequest = sequelize.define<i.IPFileRequestInstance, i.IPFileRequestAttributes>('IPFileRequest', {
        Id: { type: DataTypes.BIGINT, field: 'MrdIPfileRequestId', primaryKey: true, autoIncrement: true },
        MrdIPfileId: { type: DataTypes.INTEGER, field: 'MrdIPfileId' },
        RequestDate: { type: DataTypes.DATE, field: 'RequestDate' },
        TypeId: { type: DataTypes.INTEGER, field: 'TypeId' },
        PatientId: { type: DataTypes.INTEGER, field: 'PatientId' },
        PatientName: { type: DataTypes.INTEGER, field: 'PatientName' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        EncounterId: { type: DataTypes.INTEGER, field: 'EncounterId' },
        VisitNo: { type: DataTypes.INTEGER, field: 'VisitNo' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.INTEGER, field: 'DoctorName' },
        AdmissionDate: { type: DataTypes.DATE, field: 'AdmissionDate' },
        DischargeDate: { type: DataTypes.DATE, field: 'DischargeDate' },
        RequestBy: { type: DataTypes.INTEGER, field: 'RequestBy' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        TransferredBy: { type: DataTypes.INTEGER, field: 'TransferredBy' },
        TransferredDate: { type: DataTypes.DATE, field: 'TransferredDate' },
        ReceivedBy: { type: DataTypes.INTEGER, field: 'ReceivedBy' },
        ReceivedDate: { type: DataTypes.DATE, field: 'ReceivedDate' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        MRDIPFileStatusId: { type: DataTypes.INTEGER, field: 'MRDIPFileStatusId' },
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
            tableName: 'mrdipfilerequests',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (IPFileRequest as any).associate = function (models: Models) {
        IPFileRequest.belongsTo(models.ReferenceValue, {
            as: 'MRDIPFileStatus',
            targetKey: 'ReferenceValueCodeId', foreignKey: 'MRDIPFileStatusId'
        });
        IPFileRequest.belongsTo(models.Patient);
        IPFileRequest.belongsTo(models.User, { as: 'RequestUser', foreignKey: 'RequestBy' });
        IPFileRequest.belongsTo(models.User, { as: 'ApproveUser', foreignKey: 'ApprovedBy' });
        IPFileRequest.belongsTo(models.User, { as: 'TransferredUser', foreignKey: 'TransferredBy' });
        IPFileRequest.belongsTo(models.User, { as: 'ReceivedUser', foreignKey: 'ReceivedBy' });
    };
    return IPFileRequest;
}
