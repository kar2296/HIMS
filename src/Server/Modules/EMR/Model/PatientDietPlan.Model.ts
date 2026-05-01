import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDietPlanInstance, i.PatientDietPlanAttributes> {
    let PatientDietPlan = sequelize.define<i.PatientDietPlanInstance, i.PatientDietPlanAttributes>('PatientDietPlan', {
        Id: { type: DataTypes.BIGINT, field: 'PatientDietPlanId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        DietTypes: { type: DataTypes.STRING, field: 'DietTypes' },
        DietPreferrenceId: { type: DataTypes.BIGINT, field: 'DietPreferrenceId' },
        FoodPreferrence: { type: DataTypes.STRING, field: 'FoodPreferrence' },
        TherapeuticDietId: { type: DataTypes.BIGINT, field: 'TherapeuticDietId' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        StartDate: { type: DataTypes.DATE, field: 'StartDate' },
        EndDate: { type: DataTypes.DATE, field: 'EndDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
        PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
        PatientDietPlanStatusId: { type: DataTypes.BIGINT, field: 'PatientDietPlanStatusId' },
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
            tableName: 'patientdietplan',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientDietPlan as any).associate = function(models: Models) {
                    PatientDietPlan.hasMany(models.PatientDietPlanLog);
                    PatientDietPlan.belongsTo(models.ReferenceValue, {
                        as: 'DietType',
                        foreignKey: 'DietTypes', targetKey: 'ReferenceValueCodeId'
                    });
                    PatientDietPlan.belongsTo(models.ReferenceValue, { as: 'DietPreferrence', targetKey: 'ReferenceValueCodeId' });
                    PatientDietPlan.belongsTo(models.ReferenceValue, {
                        as: 'FoodPreference', foreignKey: 'FoodPreferrence', targetKey: 'ReferenceValueCodeId'
                    });
                    PatientDietPlan.belongsTo(models.ReferenceValue, { as: 'TherapeuticDiet', targetKey: 'ReferenceValueCodeId' });

                };
 return PatientDietPlan;
}
