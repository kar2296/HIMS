import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CdChartInstance, i.CdChartAttributes> {
    let CdChart = sequelize.define<i.CdChartInstance, i.
        CdChartAttributes>('CdChart', {
            Id: { type: DataTypes.BIGINT, field: 'CdChartId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            CdChartDate: { type: DataTypes.DATE, field: 'CdChartDate' },
            CdChartTime: { type: DataTypes.TIME, field: 'CdChartTime' },
            Cd4: { type: DataTypes.STRING, field: 'Cd4' },
            Cd8: { type: DataTypes.STRING, field: 'Cd8' },
            ViralLoad: { type: DataTypes.STRING, field: 'ViralLoad' },
            CreatedById: { type: DataTypes.BIGINT, field: 'CreatedById' },
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
                tableName: 'hims_cdchart',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (CdChart as any).associate = function (models: Models) {
        CdChart.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedById' });
        CdChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        CdChart.belongsTo(models.Encounter);
        //   CdChart.belongsTo(models.ReferenceValue, { as: 'VentilatorMode', targetKey: 'ReferenceValueCodeId' });
        //CdChart.belongsTo(models.ReferenceValue, {
        //         as: 'DiscountMode',
        //         foreignKey: 'GITPercentId', targetKey: 'ReferenceValueCodeId'
        //});
    };
    return CdChart;
}
