import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientVentilatorChartInstance, i.PatientVentilatorChartAttributes> {
    let PatientVentilatorChart = sequelize.define<i.PatientVentilatorChartInstance, i.
        PatientVentilatorChartAttributes>('PatientVentilatorChart', {
            Id: { type: DataTypes.BIGINT, field: 'VentilatorChartId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            VentilatorDate: { type: DataTypes.DATE, field: 'VentilatorDate' },
            VentilatorTime: { type: DataTypes.TIME, field: 'VentilatorTime' },
            VentilatorModeId: { type: DataTypes.BIGINT, field: 'VentilatorModeId' },
            Rate: { type: DataTypes.STRING, field: 'Rate' },
            TV: { type: DataTypes.STRING, field: 'TV' },
            MV: { type: DataTypes.STRING, field: 'MV' },
            PS: { type: DataTypes.STRING, field: 'PS' },
            Signatory: { type: DataTypes.STRING, field: 'Signatory' },
            PeakPress: { type: DataTypes.STRING, field: 'PeakPress' },
            Peep: { type: DataTypes.STRING, field: 'Peep' },
            MeanPress: { type: DataTypes.DECIMAL, field: 'MeanPress' },
            FIO2: { type: DataTypes.STRING, field: 'FIO2' },
            FIO2PercentId: { type: DataTypes.BIGINT, field: 'FIO2PercentId' },
            IsSuction: { type: DataTypes.BOOLEAN, field: 'IsSuction' },
            Posture: { type: DataTypes.STRING, field: 'Posture' },
            PowerScore: { type: DataTypes.STRING, field: 'PowerScore' },
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
            tableName: 'hims_ventilatorcharts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientVentilatorChart as any).associate = function (models: Models) {
        PatientVentilatorChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientVentilatorChart.belongsTo(models.Encounter);
        PatientVentilatorChart.belongsTo(models.ReferenceValue, { as: 'VentilatorMode', targetKey: 'ReferenceValueCodeId' });
        PatientVentilatorChart.belongsTo(models.ReferenceValue, {
            as: 'DiscountMode',
            foreignKey: 'FIO2PercentId', targetKey: 'ReferenceValueCodeId'
        });
    };
    return PatientVentilatorChart;
}
