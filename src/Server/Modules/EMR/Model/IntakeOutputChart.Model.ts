import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IntakeOutputChartInstance, i.IntakeOutputChartAttributes> {
    let IntakeOutputChart = sequelize.define<i.IntakeOutputChartInstance, i.
        IntakeOutputChartAttributes>('IntakeOutputChart', {
            Id: { type: DataTypes.BIGINT, field: 'IntakeOutputChartId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            IntakeOutputChartDate: { type: DataTypes.DATE, field: 'IntakeOutputChartDate' },
            IntakeOutputChartTime: { type: DataTypes.TIME, field: 'IntakeOutputChartTime' },
            IV: { type: DataTypes.DECIMAL, field: 'IV' },
            Oral: { type: DataTypes.DECIMAL, field: 'Oral' },
            IVName: { type: DataTypes.STRING, field: 'IVName' },
            OralName: { type: DataTypes.STRING, field: 'OralName' },
            Drains: { type: DataTypes.DECIMAL, field: 'Drains' },
            IntakeTotal: { type: DataTypes.DECIMAL, field: 'IntakeTotal' },
            Urine: { type: DataTypes.DECIMAL, field: 'Urine' },
            Aspiration: { type: DataTypes.DECIMAL, field: 'Aspiration' },
            VomitousDiarhoea: { type: DataTypes.DECIMAL, field: 'VomitousDiarhoea' },
            OutputTotal: { type: DataTypes.DECIMAL, field: 'OutputTotal' },
            Signatory: { type: DataTypes.STRING, field: 'Signatory' },
            CapturedBy: { type: DataTypes.BIGINT, field: 'CapturedBy' },
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
                tableName: 'hims_intakeoutputchart',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (IntakeOutputChart as any).associate = function (models: Models) {
        IntakeOutputChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        IntakeOutputChart.belongsTo(models.User, { foreignKey: 'CapturedBy', as: 'CapturedUser' });
        IntakeOutputChart.belongsTo(models.Encounter);
    };
    return IntakeOutputChart;
}
