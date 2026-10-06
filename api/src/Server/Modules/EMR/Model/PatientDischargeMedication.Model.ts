import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDischargeMedicationInstance, i.PatientDischargeMedicationAttributes> {
    let PatientDischargeMedication = sequelize.define<i.PatientDischargeMedicationInstance, i.
        PatientDischargeMedicationAttributes>('PatientDischargeMedication', {
            Id: { type: DataTypes.BIGINT, field: 'DischargeMedicationId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
            DrugName: { type: DataTypes.STRING, field: 'DrugName' },
            IsSelectedDrug: { type: DataTypes.BOOLEAN, field: 'IsSelectedDrug' },
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
            tableName: 'patientdischargemedications',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    // (PatientDischargeMedication as any).associate = function (models: Models) {
    //     PatientDischargeMedication.hasMany(models.PatientDischargeMedication);
    //     PatientDischargeMedication.belongsTo(models.ReferenceValue, {
    //         as: 'DietType',
    //         foreignKey: 'DietTypes', targetKey: 'ReferenceValueCodeId'
    //     });
    //     PatientDischargeMedication.belongsTo(models.ReferenceValue, { as: 'DietPreferrence', targetKey: 'ReferenceValueCodeId' });
    //     PatientDischargeMedication.belongsTo(models.ReferenceValue, {
    //         as: 'FoodPreference', foreignKey: 'FoodPreferrence', targetKey: 'ReferenceValueCodeId'
    //     });
    //     PatientDischargeMedication.belongsTo(models.ReferenceValue, { as: 'TherapeuticDiet', targetKey: 'ReferenceValueCodeId' });
    // };
    return PatientDischargeMedication;
}
