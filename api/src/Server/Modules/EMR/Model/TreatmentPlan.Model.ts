import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TreatmentPlanInstance, i.TreatmentPlanAttributes> {
    let TreatmentPlan = sequelize.define<i.TreatmentPlanInstance, i.TreatmentPlanAttributes>('TreatmentPlan', {
        Id: { type: DataTypes.BIGINT, field: 'TreatmentPlanId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        ConsultationId: { type: DataTypes.INTEGER, field: 'ConsultationId' },
        PlanNumber: { type: DataTypes.STRING, field: 'PlanNumber' },
        PlanRequestDate: { type: DataTypes.DATE, field: 'PlanRequestDate' },
        PlanScheduledFrom: { type: DataTypes.DATE, field: 'PlanScheduledFrom' },
        PlanScheduledTo: { type: DataTypes.DATE, field: 'PlanScheduledTo' },
        NoOfDays: { type: DataTypes.STRING, field: 'NoOfDays' },
        IntervalDays: { type: DataTypes.STRING, field: 'IntervalDays' },
        PlanStatusId: { type: DataTypes.INTEGER, field: 'PlanStatusId' },
        PlanCompletedDate: { type: DataTypes.DATE, field: 'PlanCompletedDate' },
        PlanPriorityId: { type: DataTypes.INTEGER, field: 'PlanPriorityId' },
        TotalAmount: { type: DataTypes.INTEGER, field: 'TotalAmount' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        BillingStatusId: { type: DataTypes.INTEGER, field: 'BillingStatusId' },
        PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
        BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
        BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        IsPaid: { type: DataTypes.BOOLEAN, field: 'IsPaid' },
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
            tableName: 'hims_treatmentplan',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (TreatmentPlan as any).associate = function (models: Models) {
        TreatmentPlan.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        TreatmentPlan.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        TreatmentPlan.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        TreatmentPlan.belongsTo(models.ReferenceValue, {
            as: 'OrderPriority', foreignKey: 'PlanPriorityId',
            targetKey: 'ReferenceValueCodeId'
        });
        TreatmentPlan.belongsTo(models.ReferenceValue, {
            as: 'PlanStatus', targetKey: 'ReferenceValueCodeId'
        });
        TreatmentPlan.hasMany(models.TreatmentPlanDetail);
    };
    return TreatmentPlan;
}
