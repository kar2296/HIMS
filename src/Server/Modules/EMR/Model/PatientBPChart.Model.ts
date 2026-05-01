import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientBPChartInstance, i.PatientBPChartAttributes> {
    let PatientBPChart = sequelize.define<i.PatientBPChartInstance, i.
        PatientBPChartAttributes>('PatientBPChart', {
            Id: { type: DataTypes.BIGINT, field: 'BPChartId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            BPChartDate: { type: DataTypes.DATE, field: 'BPChartDate' },
            BPChartTime: { type: DataTypes.TIME, field: 'BPChartTime' },
            BPPulseRate: { type: DataTypes.STRING, field: 'BPPulseRate' },
            PPPulseRate: { type: DataTypes.STRING, field: 'PPPulseRate' },
            MAPPulseRate: { type: DataTypes.STRING, field: 'MAPPulseRate' },
            RightArmBPSupine: { type: DataTypes.STRING, field: 'RightArmBPSupine' },
            LeftArmBPSupine: { type: DataTypes.STRING, field: 'LeftArmBPSupine' },
            RightArmBPSitting: { type: DataTypes.STRING, field: 'RightArmBPSitting' },
            LeftArmBPSitting: { type: DataTypes.STRING, field: 'LeftArmBPSitting' },
            RightArmBPStanding: { type: DataTypes.BIGINT, field: 'RightArmBPStanding' },
            LeftArmBPStanding: { type: DataTypes.STRING, field: 'LeftArmBPStanding' },
            RightArmPPSupine: { type: DataTypes.STRING, field: 'RightArmPPSupine' },
            LeftArmPPSupine: { type: DataTypes.STRING, field: 'LeftArmPPSupine' },
            RightArmPPSitting: { type: DataTypes.STRING, field: 'RightArmPPSitting' },
            LeftArmPPSitting: { type: DataTypes.STRING, field: 'LeftArmPPSitting' },
            RightArmPPStanding: { type: DataTypes.BIGINT, field: 'RightArmPPStanding' },
            LeftArmPPStanding: { type: DataTypes.STRING, field: 'LeftArmPPStanding' },
            RightArmMAPSupine: { type: DataTypes.STRING, field: 'RightArmMAPSupine' },
            LeftArmMAPSupine: { type: DataTypes.STRING, field: 'LeftArmMAPSupine' },
            RightArmMAPSitting: { type: DataTypes.STRING, field: 'RightArmMAPSitting' },
            LeftArmMAPSitting: { type: DataTypes.STRING, field: 'LeftArmMAPSitting' },
            RightArmMAPStanding: { type: DataTypes.BIGINT, field: 'RightArmMAPStanding' },
            LeftArmMAPStanding: { type: DataTypes.STRING, field: 'LeftArmMAPStanding' },
            Signatory: { type: DataTypes.STRING, field: 'Signatory' },
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
            tableName: 'hims_bpcharts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientBPChart as any).associate = function (models: Models) {
        PatientBPChart.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientBPChart.belongsTo(models.Encounter);
       //   PatientBPChart.belongsTo(models.ReferenceValue, { as: 'VentilatorMode', targetKey: 'ReferenceValueCodeId' });
    //PatientBPChart.belongsTo(models.ReferenceValue, {
    //         as: 'DiscountMode',
    //         foreignKey: 'GITPercentId', targetKey: 'ReferenceValueCodeId'
         //});
     };
    return PatientBPChart;
}
