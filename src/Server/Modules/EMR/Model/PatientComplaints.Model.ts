import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientComplaintsInstance, i.PatientComplaintsAttributes> {
    let PatientComplaints = sequelize.define<i.PatientComplaintsInstance, i.
        PatientComplaintsAttributes>('PatientComplaints', {
            Id: { type: DataTypes.BIGINT, field: 'PatientComplaintId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            SymptomId: { type: DataTypes.BIGINT, field: 'SymptomId' },
            LDurationPeriodId: { type: DataTypes.BIGINT, field: 'LDurationPeriodId' },
            LDuration: { type: DataTypes.STRING, field: 'LDuration' },
            RDurationPeriodId: { type: DataTypes.BIGINT, field: 'RDurationPeriodId' },
            RDuration: { type: DataTypes.STRING, field: 'RDuration' },
            LOnset: { type: DataTypes.STRING, field: 'LOnset' },
            ROnset: { type: DataTypes.STRING, field: 'ROnset' },
            LProgression: { type: DataTypes.STRING, field: 'LProgression' },
            RProgression: { type: DataTypes.STRING, field: 'RProgression' },
            LTreatmentTaken: { type: DataTypes.STRING, field: 'LTreatmentTaken' },
            RTreatmentTaken: { type: DataTypes.STRING, field: 'RTreatmentTaken' },
            LSeverityId: { type: DataTypes.BIGINT, field: 'LSeverityId' },
            RSeverityId: { type: DataTypes.BIGINT, field: 'RSeverityId' },
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
            tableName: 'patientcomplaints',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientComplaints as any).associate = function (models: Models) {
        PatientComplaints.belongsTo(models.ChiefComplaint, { foreignKey: 'SymptomId' });
        PatientComplaints.belongsTo(models.ReferenceValue,
            { as: 'LDurationPeriod', targetKey: 'ReferenceValueCodeId', foreignKey: 'LDurationPeriodId' });
        PatientComplaints.belongsTo(models.ReferenceValue,
            { as: 'RDurationPeriod', targetKey: 'ReferenceValueCodeId', foreignKey: 'RDurationPeriodId' });
    };
    return PatientComplaints;
}
