import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientMedicationInstance, i.PatientMedicationAttributes> {
    let PatientMedication = sequelize.define<i.PatientMedicationInstance, i.PatientMedicationAttributes>('PatientMedication', {
        Id: { type: DataTypes.BIGINT, field: 'PatientMedicationId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
        IsGeneric: { type: DataTypes.BOOLEAN, field: 'IsGeneric' },
        GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
        PrescriptionId: { type: DataTypes.BIGINT, field: 'PrescriptionId' },
        DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
        DrugName: { type: DataTypes.STRING, field: 'DrugName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        DrugFormId: { type: DataTypes.BIGINT, field: 'DrugFormId' },
        StartDate: { type: DataTypes.DATE, field: 'StartDate' },
        EndDate: { type: DataTypes.DATE, field: 'EndDate' },
        MedicationStatus: { type: DataTypes.INTEGER, field: 'MedicationStatus' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        PatientMedicationStatusId: { type: DataTypes.BIGINT, field: 'PatientMedicationStatusId' },
        PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
        PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
        Dosage: { type: DataTypes.STRING, field: 'Dosage' },
        Morning: { type: DataTypes.BIGINT, field: 'Morning' },
        Noon: { type: DataTypes.BIGINT, field: 'Noon' },
        Night: { type: DataTypes.BIGINT, field: 'Night' },
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
            tableName: 'hims_patientmedications',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientMedication as any).associate = function (models: Models) {
        PatientMedication.belongsTo(models.DrugMaster, { foreignKey: 'DrugId' });
        PatientMedication.belongsTo(models.GenericMaster, { foreignKey: 'GenericId' });
        PatientMedication.belongsTo(models.ReferenceValue, {
            as: 'PatientMedicationStatus',
            targetKey: 'ReferenceValueCodeId'
        });
    };
    return PatientMedication;
}
