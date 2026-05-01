import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EncounterMLCInstance, i.EncounterMLCAttributes> {
    let EncounterMLC = sequelize.define<i.EncounterMLCInstance, i.EncounterMLCAttributes>('EncounterMLC', {
        Id: { type: DataTypes.BIGINT, field: 'EncounterMLCId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EscortTypeId: { type: DataTypes.BIGINT, field: 'EscortTypeId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EscortUserId: { type: DataTypes.BIGINT, field: 'EscortUserId' },
        EscortName: { type: DataTypes.STRING, field: 'EscortName' },
        VeichleNo: { type: DataTypes.STRING, field: 'VeichleNo' },
        MLCNo: { type: DataTypes.STRING, field: 'MLCNo' },
        AccidentTypeId: { type: DataTypes.BIGINT, field: 'AccidentTypeId' },
        BriefOfAccident: { type: DataTypes.STRING, field: 'BriefOfAccident' },
        IsMLC: { type: DataTypes.BOOLEAN, field: 'IsMLC' },
        IncidentDate: { type: DataTypes.DATE, field: 'IncidentDate' },
        AddressOfAcident2: { type: DataTypes.STRING, field: 'AddressOfAcident2' },
        CertificateNo: { type: DataTypes.STRING, field: 'CertificateNo' },
        BuckleNo: { type: DataTypes.STRING, field: 'BuckleNo' },
        PoliceCertificateDate: { type: DataTypes.DATE, field: 'PoliceCertificateDate' },
        IdentificationMark: { type: DataTypes.STRING, field: 'IdentificationMark' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        MLCPatientStatus: { type: DataTypes.BIGINT, field: 'MLCPatientStatus' },
        PoliceStation: { type: DataTypes.STRING, field: 'PoliceStation' },
        AddressOfAcident: { type: DataTypes.STRING, field: 'AddressOfAcident' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        MLCStatusId: { type: DataTypes.BIGINT, field: 'MLCStatusId' },
        ContactNo: { type: DataTypes.STRING, field: 'ContactNo' },
        Reflink: { type: DataTypes.STRING, field: 'Reflink' },
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
            tableName: 'encountermlc',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (EncounterMLC as any).associate = function (models: Models) {
        EncounterMLC.belongsTo(models.Encounter);
        EncounterMLC.hasMany(models.EncounterMLCOfficer);
        EncounterMLC.belongsTo(models.ReferenceValue, { as: 'AccidentType', targetKey: 'ReferenceValueCodeId' });
        EncounterMLC.belongsTo(models.ReferenceValue, { as: 'EscortType', targetKey: 'ReferenceValueCodeId' });
        EncounterMLC.belongsTo(models.PincodeMaster, { foreignKey: 'PinCodeId' });
        EncounterMLC.belongsTo(models.CityMaster, { foreignKey: 'CityId' });
        EncounterMLC.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
        EncounterMLC.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
        EncounterMLC.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
    };
    return EncounterMLC;
}
