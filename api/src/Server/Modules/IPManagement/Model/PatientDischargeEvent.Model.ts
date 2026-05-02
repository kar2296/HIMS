import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDischargeEventInstance, i.PatientDischargeEventAttributes> {
    let PatientDischargeEvent = sequelize.define<i.PatientDischargeEventInstance, i.PatientDischargeEventAttributes>
        ('PatientDischargeEvent', {
            Id: { type: DataTypes.BIGINT, field: 'PatientdischargeId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            Pharmacystatus: { type: DataTypes.INTEGER, field: 'Pharmacystatus' },
            OTstatus: { type: DataTypes.INTEGER, field: 'OTstatus' },
            DischargeorderstatusId: { type: DataTypes.BIGINT, field: 'DischargeorderstatusId' },
            Dischargesummarystatus: { type: DataTypes.INTEGER, field: 'Dischargesummarystatus' },
            DischargeTypeId: { type: DataTypes.BIGINT, field: 'DischargeTypeId' },
            FitFordischargedate: { type: DataTypes.DATE, field: 'FitFordischargedate' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            ClicalDischargeId: { type: DataTypes.BIGINT, field: 'ClicalDischargeId' },
            DischargeOrderDate: { type: DataTypes.DATE, field: 'DischargeOrderDate' },
            ClinicalDischargeDate: { type: DataTypes.DATE, field: 'ClinicalDischargeDate' },
            DeathDate: { type: DataTypes.DATE, field: 'DeathDate' },
            OutcomeId: { type: DataTypes.BIGINT, field: 'OutcomeId' },
            ModeofTransportId: { type: DataTypes.BIGINT, field: 'ModeofTransportId' },
            AdmissionStatusId: { type: DataTypes.BIGINT, field: 'AdmissionStatusId' },
            Followupdays: { type: DataTypes.BIGINT, field: 'Followupdays' },
            PeriodId: { type: DataTypes.BIGINT, field: 'PeriodId' },
            Ishomemedication: { type: DataTypes.INTEGER, field: 'Ishomemedication' },
            InfectiontypeId: { type: DataTypes.BIGINT, field: 'InfectiontypeId' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            certificateStatusId: { type: DataTypes.BIGINT, field: 'certificateStatusId' }, // ADDED: Missing property
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            FitFordischargeById: { type: DataTypes.BIGINT, field: 'FitFordischargeById' },
            FinancialDischargeById: { type: DataTypes.BIGINT, field: 'FinancialDischargeById' },
            FinancialDischargeDate: { type: DataTypes.DATE, field: 'FinancialDischargeDate' },
            PhysicalDischargeById: { type: DataTypes.BIGINT, field: 'PhysicalDischargeById' },
            PhysicalDischargeDate: { type: DataTypes.DATE, field: 'PhysicalDischargeDate' },
            AdmissionCancelledById: { type: DataTypes.BIGINT, field: 'AdmissionCancelledById' },
            AdmissionCancelledDate: { type: DataTypes.DATE, field: 'AdmissionCancelledDate' },
            Tentativedischargedate: { type: DataTypes.DATE, field: 'Tentativedischargedate' },
            ClicalDischargeById: { type: DataTypes.BIGINT, field: 'ClicalDischargeById' },
        },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientdischargeevent',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientDischargeEvent as any).associate = function(models: Models) {
                    PatientDischargeEvent.belongsTo(models.Encounter);
                    PatientDischargeEvent.belongsTo(models.Patient);
                    PatientDischargeEvent.belongsTo(models.User, { as: 'FitFordischargeBy', foreignKey: 'FitFordischargeById' });
                    PatientDischargeEvent.belongsTo(models.User, { as: 'ClicalDischargeBy', foreignKey: 'ClicalDischargeById' });
                    PatientDischargeEvent.belongsTo(models.User, { as: 'PhysicalDischargeBy', foreignKey: 'PhysicalDischargeById' });
                    // PatientDischargeEvent.belongsTo(models.ReferenceValue, { as: 'AdmissionStatus', targetKey: 'AdmissionStatusId' });
                };
 return PatientDischargeEvent as SequelizeStatic.Model<i.PatientDischargeEventInstance, i.PatientDischargeEventAttributes>;
}
