import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.MRDFilesInstance, i.MRDFilesAttributes> {
    let MRDFiles = sequelize.define<i.MRDFilesInstance, i.MRDFilesAttributes>('MRDFiles', {
        Id: { type: DataTypes.BIGINT, field: 'MrdIPfileId', primaryKey: true, autoIncrement: true }, // RESTORED: Interface expects 'Id'
        MrdIPfileId: { type: DataTypes.BIGINT, field: 'MrdIPfileId' }, // ADDED: Interface also expects 'MrdIPfileId'
        ReturnDate: { type: DataTypes.DATE, field: 'ReturnDate' },
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
        ReturnBy: { type: DataTypes.INTEGER, field: 'ReturnBy' },
        ReceivedBy: { type: DataTypes.INTEGER, field: 'ReceivedBy' },
        ReceivedDate: { type: DataTypes.DATE, field: 'ReceivedDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'mrdipfiles',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (MRDFiles as any).associate = function (models: Models) {
        MRDFiles.belongsTo(models.ReferenceValue, {
            as: 'MRDIPFileStatus',
            targetKey: 'ReferenceValueCodeId', foreignKey: 'MRDIPFileStatusId'
        });
        MRDFiles.belongsTo(models.Patient);
        MRDFiles.belongsTo(models.User, { as: 'ReturnedUser', foreignKey: 'ReturnBy' });
        MRDFiles.belongsTo(models.User, { as: 'ReceivedUser', foreignKey: 'ReceivedBy' });

    };
    return MRDFiles as SequelizeStatic.Model<i.MRDFilesInstance, i.MRDFilesAttributes>;
}
