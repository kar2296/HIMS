import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDialysisChartInstance, i.PatientDialysisChartAttributes> {
    let PatientDialysisChart = sequelize.define<i.PatientDialysisChartInstance, i.
        PatientDialysisChartAttributes>('PatientDialysisChart', {
            Id: { type: DataTypes.BIGINT, field: 'DialysisChartId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            DialysisChartDate: { type: DataTypes.DATE, field: 'DialysisChartDate' },
            DialysisChartTime: { type: DataTypes.TIME, field: 'DialysisChartTime' },
            StartTime: { type: DataTypes.TIME, field: 'StartTime' },
            EndTime: { type: DataTypes.TIME, field: 'EndTime' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            PreDialysisWt: { type: DataTypes.STRING, field: 'PreDialysisWt' },
            PostDialysisWt: { type: DataTypes.STRING, field: 'PostDialysisWt' },
            Examinations: { type: DataTypes.STRING, field: 'Examinations' },
            BP: { type: DataTypes.STRING, field: 'BP' },
            Pulse: { type: DataTypes.STRING, field: 'Pulse' },
            Resp: { type: DataTypes.STRING, field: 'Resp' },
            Temp: { type: DataTypes.STRING, field: 'Temp' },
            BIFlow: { type: DataTypes.STRING, field: 'BIFlow' },
            NegativePressure: { type: DataTypes.STRING, field: 'NegativePressure' },
            VenusePressure: { type: DataTypes.STRING, field: 'VenusePressure' },
            Haparin: { type: DataTypes.STRING, field: 'Haparin' },
            Salin: { type: DataTypes.STRING, field: 'Salin' },
            BF: { type: DataTypes.STRING, field: 'BF' },
            AP: { type: DataTypes.STRING, field: 'AP' },
            VP: { type: DataTypes.STRING, field: 'VP' },
            NP: { type: DataTypes.STRING, field: 'NP' },
            UFR: { type: DataTypes.STRING, field: 'UFR' },
            CapturedBy: { type: DataTypes.INTEGER, field: 'CapturedBy' },
            Signatory: { type: DataTypes.STRING, field: 'Signatory' },
            TreatmentHours: { type: DataTypes.STRING, field: 'TreatmentHours' },
            Sugar: { type: DataTypes.STRING, field: 'Sugar' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'hims_dialysischarts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientDialysisChart as any).associate = function (models: Models) {
        PatientDialysisChart.belongsTo(models.Encounter);
        PatientDialysisChart.belongsTo(models.User, { as: 'CapturedByUser', foreignKey: 'CapturedBy' });
        PatientDialysisChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        // PatientDialysisChart.belongsTo(models.ReferenceValue, {
        //     as: 'DiscountMode',
        //     foreignKey: 'GITPercentId', targetKey: 'ReferenceValueCodeId'
        // });
    };
    return PatientDialysisChart;
}
