import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDiabetesChartInstance, i.PatientDiabetesChartAttributes> {
    let PatientDiabetesChart = sequelize.define<i.PatientDiabetesChartInstance, i.
        PatientDiabetesChartAttributes>('PatientDiabetesChart', {
            Id: { type: DataTypes.BIGINT, field: 'DiabetesChartId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            DiabetesChartDate: { type: DataTypes.DATE, field: 'DiabetesChartDate' },
            DiabetesChartTime: { type: DataTypes.TIME, field: 'DiabetesChartTime' },
            Method: { type: DataTypes.STRING, field: 'Method' },
            InsulinDoseGiven: { type: DataTypes.STRING, field: 'InsulinDoseGiven' },
            BloodSugarFasting: { type: DataTypes.STRING, field: 'BloodSugarFasting' },
            BloodSugarPP: { type: DataTypes.STRING, field: 'BloodSugarPP' },
            BloodSugarRandom: { type: DataTypes.STRING, field: 'BloodSugarRandom' },
            UrineSugarFasting: { type: DataTypes.STRING, field: 'UrineSugarFasting' },
            UrineSugarPP: { type: DataTypes.STRING, field: 'UrineSugarPP' },
            UrineSugarRandom: { type: DataTypes.STRING, field: 'UrineSugarRandom' },
            HBA1C: { type: DataTypes.STRING, field: 'HBA1C' },
            EAG: { type: DataTypes.STRING, field: 'EAG' },
            MicroAlbumin: { type: DataTypes.STRING, field: 'MicroAlbumin' },
            Signature: { type: DataTypes.STRING, field: 'Signature' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            EnteredBy: { type: DataTypes.STRING, field: 'EnteredBy' },
            CheckedBy: { type: DataTypes.STRING, field: 'CheckedBy' },
            TimePeriodId: { type: DataTypes.BIGINT, field: 'TimePeriodId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
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
            tableName: 'hims_diabetescharts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientDiabetesChart as any).associate = function (models: Models) {
        PatientDiabetesChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientDiabetesChart.belongsTo(models.Encounter);
        PatientDiabetesChart.belongsTo(models.ReferenceValue, { as: 'TimePeriod', targetKey: 'ReferenceValueCodeId' });
        PatientDiabetesChart.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
     };
    return PatientDiabetesChart;
}
