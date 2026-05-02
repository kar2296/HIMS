import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AERegistrationInstance, i.AERegistrationAttributes> {
    let AERegistration = sequelize.define<i.AERegistrationInstance, i.AERegistrationAttributes>('AERegistration', {
        Id: { type: DataTypes.BIGINT, field: 'AERegistrationId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ERTypeId: { type: DataTypes.BIGINT, field: 'ERTypeId' },
        ArrivalModeId: { type: DataTypes.BIGINT, field: 'ArrivalModeId' },
        EscortedById: { type: DataTypes.BIGINT, field: 'EscortedById' },
        EscortTypeId: { type: DataTypes.BIGINT, field: 'EscortTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        EmergencyDate: { type: DataTypes.DATE, field: 'EmergencyDate' },
        EmergencyConditionId: { type: DataTypes.BIGINT, field: 'EmergencyConditionId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        IsBroughtDead: { type: DataTypes.BOOLEAN, field: 'IsBroughtDead' },
        IsMRDRequest: { type: DataTypes.BOOLEAN, field: 'IsMRDRequest' },
        InjuryReason: { type: DataTypes.STRING, field: 'InjuryReason' },
        ExaminationDetails: { type: DataTypes.STRING, field: 'ExaminationDetails' },
        IncidentAddress: { type: DataTypes.STRING, field: 'IncidentAddress' },
        Address1: { type: DataTypes.STRING, field: 'Address1' },
        Address2: { type: DataTypes.STRING, field: 'Address2' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        Area: { type: DataTypes.BIGINT, field: 'Area' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        TriageLevelId: { type: DataTypes.BIGINT, field: 'TriageLevelId' },
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
            tableName: 'aeregistration',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (AERegistration as any).associate = function(models: Models) {
                    AERegistration.belongsTo(models.Patient, { foreignKey: 'PatientId' });
                    AERegistration.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
                    AERegistration.belongsTo(models.PatientGuarantor, { foreignKey: 'GuarantorId' });
                    AERegistration.belongsTo(models.User, { foreignKey: 'DoctorId' });
                    AERegistration.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
                    AERegistration.belongsTo(models.ReferenceValue, { as: 'ERType', targetKey: 'ReferenceValueCodeId' });
                    AERegistration.belongsTo(models.ReferenceValue, {
                        as: 'ModeOfTransport', foreignKey: 'ArrivalModeId',
                        targetKey: 'ReferenceValueCodeId'
                    });
                };
 return AERegistration;
}
