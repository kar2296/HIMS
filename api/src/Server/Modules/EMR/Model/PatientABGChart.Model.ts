import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientABGChartInstance, i.PatientABGChartAttributes> {
    let PatientABGChart = sequelize.define<i.PatientABGChartInstance, i.
        PatientABGChartAttributes>('PatientABGChart', {
            Id: { type: DataTypes.BIGINT, field: 'ABGChartId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            ABGChartDate: { type: DataTypes.DATE, field: 'ABGChartDate' },
            ABGChartTime: { type: DataTypes.TIME, field: 'ABGChartTime' },
            ABGParameters: { type: DataTypes.STRING, field: 'ABGParameters' },
            ParameterValues: { type: DataTypes.STRING, field: 'ParameterValues' },
            Signatory: { type: DataTypes.STRING, field: 'Signatory' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            Qualifier: { type: DataTypes.STRING, field: 'Qualifier' },
            QualifierId: { type: DataTypes.INTEGER, field: 'QualifierId' },
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
            tableName: 'hims_abgcharts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

        (PatientABGChart as any).associate = function (models: Models) {
            PatientABGChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
            PatientABGChart.belongsTo(models.Encounter);
          };
    return PatientABGChart;
}
