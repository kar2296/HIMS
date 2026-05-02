import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientMonitorChartInstance, i.PatientMonitorChartAttributes> {
    let PatientMonitorChart = sequelize.define<i.PatientMonitorChartInstance, i.
        PatientMonitorChartAttributes>('PatientMonitorChart', {
            Id: { type: DataTypes.BIGINT, field: 'MonitorChartId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            MonitorChartDate: { type: DataTypes.DATE, field: 'MonitorChartDate' },
            MonitorChartTime: { type: DataTypes.TIME, field: 'MonitorChartTime' },
            Pulse: { type: DataTypes.STRING, field: 'Pulse' },
            BP: { type: DataTypes.STRING, field: 'BP' },
            Temperature: { type: DataTypes.STRING, field: 'Temperature' },
            Rate: { type: DataTypes.STRING, field: 'Rate' },
            LS: { type: DataTypes.STRING, field: 'LS' },
            Grade: { type: DataTypes.STRING, field: 'Grade' },
            LeftPupil: { type: DataTypes.STRING, field: 'LeftPupil' },
            LeftPupilPercentId: { type: DataTypes.BIGINT, field: 'LeftPupilPercentId' },
            RightPupil: { type: DataTypes.STRING, field: 'RightPupil' },
            RightPupilPercentId: { type: DataTypes.BIGINT, field: 'RightPupilPercentId' },
            GIT: { type: DataTypes.STRING, field: 'GIT' },
            GITPercentId: { type: DataTypes.BIGINT, field: 'GITPercentId' },
            SPO2: { type: DataTypes.STRING, field: 'SPO2' },
            SPO2PercentId: { type: DataTypes.BIGINT, field: 'SPO2PercentId' },
            Remarks: { type: DataTypes.STRING, field: 'Remarks' },
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
            tableName: 'hims_monitorcharts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientMonitorChart as any).associate = function (models: Models) {
        PatientMonitorChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientMonitorChart.belongsTo(models.Encounter);
        // PatientMonitorChart.belongsTo(models.ReferenceValue, { as: 'VentilatorMode', targetKey: 'ReferenceValueCodeId' });
        PatientMonitorChart.belongsTo(models.ReferenceValue, {
            as: 'DiscountMode',
            foreignKey: 'GITPercentId', targetKey: 'ReferenceValueCodeId'
        });
    };
    return PatientMonitorChart;
}
