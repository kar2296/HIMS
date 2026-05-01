import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PositionBpChartInstance, i.PositionBpChartAttributes> {
    let PositionBpChart = sequelize.define<i.PositionBpChartInstance, i.
        PositionBpChartAttributes>('PositionBpChart', {
            Id: { type: DataTypes.BIGINT, field: 'PositionBPChartId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            PositionBPChartDate: { type: DataTypes.DATE, field: 'PositionBPChartDate' },
            PositionBPChartTime: { type: DataTypes.TIME, field: 'PositionBPChartTime' },
            RightSittingSys: { type: DataTypes.STRING, field: 'RightSittingSys' },
            RightSittingDia: { type: DataTypes.STRING, field: 'RightSittingDia' },
            LeftSittingSys: { type: DataTypes.STRING, field: 'LeftSittingSys' },
            LeftSittingDia: { type: DataTypes.STRING, field: 'LeftSittingDia' },
            RightStandingSys: { type: DataTypes.STRING, field: 'RightStandingSys' },
            RightStandingDia: { type: DataTypes.STRING, field: 'RightStandingDia' },
            LeftStandingSys: { type: DataTypes.STRING, field: 'LeftStandingSys' },
            LeftStandingDia: { type: DataTypes.STRING, field: 'LeftStandingDia' },
            RightLyingSys: { type: DataTypes.STRING, field: 'RightLyingSys' },
            RightLyingDia: { type: DataTypes.STRING, field: 'RightLyingDia' },
            LeftLyingSys: { type: DataTypes.STRING, field: 'LeftLyingSys' },
            LeftLyingDia: { type: DataTypes.STRING, field: 'LeftLyingDia' },
            // CreatedById: { type: DataTypes.BIGINT, field: 'CreatedById' },
            ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
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
                tableName: 'hims_positionbpchart',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PositionBpChart as any).associate = function (models: Models) {
        PositionBpChart.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedById' });
        PositionBpChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PositionBpChart.belongsTo(models.Encounter);
        //   PositionBpChart.belongsTo(models.ReferenceValue, { as: 'VentilatorMode', targetKey: 'ReferenceValueCodeId' });
        //PositionBpChart.belongsTo(models.ReferenceValue, {
        //         as: 'DiscountMode',
        //         foreignKey: 'GITPercentId', targetKey: 'ReferenceValueCodeId'
        //});
    };
    return PositionBpChart;
}
