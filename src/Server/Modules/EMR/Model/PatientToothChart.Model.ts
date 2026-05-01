import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientToothChartInstance, i.PatientToothChartAttributes> {
    let PatientToothChart = sequelize.define<i.PatientToothChartInstance, i.
        PatientToothChartAttributes>('PatientToothChart', {
            Id: { type: DataTypes.BIGINT, field: 'ToothChartId', primaryKey: true, autoIncrement: true },
            ToothChartTypeId: { type: DataTypes.INTEGER, field: 'ToothChartTypeId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            ToothChartDatetime: { type: DataTypes.DATE, field: 'ToothChartDatetime' },
            ToothImgId: { type: DataTypes.STRING, field: 'ToothImgId' },
            Implant: { type: DataTypes.STRING, field: 'Implant' },
            Crack: { type: DataTypes.STRING, field: 'Crack' },
            PerioSurgery: { type: DataTypes.STRING, field: 'PerioSurgery' },
            MissingTooth: { type: DataTypes.STRING, field: 'MissingTooth' },
            Crown: { type: DataTypes.STRING, field: 'Crown' },
            Braces: { type: DataTypes.STRING, field: 'Braces' },
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
            tableName: 'toothcharts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

        (PatientToothChart as any).associate = function (models: Models) {
            PatientToothChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
            PatientToothChart.belongsTo(models.Encounter);
          };
    return PatientToothChart;
}
