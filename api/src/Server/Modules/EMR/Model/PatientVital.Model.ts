import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientVitalInstance, i.PatientVitalAttributes> {
    let PatientVital = sequelize.define<i.PatientVitalInstance, i.PatientVitalAttributes>('PatientVital', {
        Id: { type: DataTypes.BIGINT, field: 'PatientVitalId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        VitalId: { type: DataTypes.BIGINT, field: 'VitalId' },
        VitalValue: { type: DataTypes.STRING, field: 'VitalValue' },
        VitalName: { type: DataTypes.STRING, field: 'VitalName' },
        UOM: { type: DataTypes.STRING, field: 'UOM' },
        GraphTypeId: { type: DataTypes.BIGINT, field: 'GraphTypeId' },
        VitalValueTypeId: { type: DataTypes.BIGINT, field: 'VitalValueTypeId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        LoincCode: { type: DataTypes.STRING, field: 'LoincCode' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
        ValueFormat: { type: DataTypes.STRING, field: 'ValueFormat' },
        ReferenceRangeFrom: { type: DataTypes.STRING, field: 'ReferenceRangeFrom' },
        ReferenceRangeTo: { type: DataTypes.STRING, field: 'ReferenceRangeTo' },
        Mnemonic: { type: DataTypes.STRING, field: 'Mnemonic' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        PatientVitalStatusId: { type: DataTypes.BIGINT, field: 'PatientVitalStatusId' },
        VitalQualifier: { type: DataTypes.STRING, field: 'VitalQualifier' },
        VitalQualifierId: { type: DataTypes.BIGINT, field: 'VitalQualifierId' },
        GroupId: { type: DataTypes.BIGINT, field: 'GroupId' },
        PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
        PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
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
            tableName: 'hims_patientvitals',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientVital as any).associate = function (models: Models) {
        PatientVital.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientVital.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientVital.belongsTo(models.VitalMaster, { foreignKey: 'VitalId' });
        PatientVital.belongsTo(models.User, { as: 'PerformedUser', foreignKey: 'PerformedBy' });
        PatientVital.belongsTo(models.ReferenceValue, { as: 'PatientVitalStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientVital;
}
