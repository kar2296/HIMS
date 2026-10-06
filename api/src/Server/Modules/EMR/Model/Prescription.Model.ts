import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PrescriptionInstance, i.PrescriptionAttributes> {
    let Prescription = sequelize.define<i.PrescriptionInstance, i.PrescriptionAttributes>('Prescription', {
        Id: { type: DataTypes.BIGINT, field: 'Prescriptiond', primaryKey: true, autoIncrement: true },
        Identifier: { type: DataTypes.STRING, field: 'PrescriptionIdentifier' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        PrescriptionDate: { type: DataTypes.DATE, field: 'PrescriptionDate' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        PrescriptionPriorityId: { type: DataTypes.BIGINT, field: 'PrescriptionPriorityId' },
        PharmacyId: { type: DataTypes.BIGINT, field: 'PharmacyId' },
        PrecriptionStatusId: { type: DataTypes.BIGINT, field: 'PrecriptionStatusId' },
        DispenseStatusId: { type: DataTypes.BIGINT, field: 'DispenseStatusId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AppointmentId: { type: DataTypes.BIGINT, field: 'AppointmentId' },
        AdviceInstructions: { type: DataTypes.STRING, field: 'AdviceInstructions' },
        EmergencyContactNote: { type: DataTypes.STRING, field: 'EmergencyContactNote' },
        DiagnosisComments: { type: DataTypes.STRING, field: 'DiagnosisComments' },
        SurgeryComments: { type: DataTypes.STRING, field: 'SurgeryComments' },
        IsDischargeMedication: { type: DataTypes.BOOLEAN, field: 'IsDischargeMedication' },
        IsCash: { type: DataTypes.BOOLEAN, field: 'IsCash' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        OtherDiagnosis: { type: DataTypes.STRING, field: 'OtherDiagnosis' },
        Physiotheraphy: { type: DataTypes.STRING, field: 'Physiotheraphy' },
        PhysiotheraphyId: { type: DataTypes.BIGINT, field: 'PhysiotheraphyId' },
        PhysiotheraphyDuration: { type: DataTypes.STRING, field: 'PhysiotheraphyDuration' },
        PhysioFreqId: { type: DataTypes.BIGINT, field: 'PhysioFreqId' },
        AdministerStatusId: { type: DataTypes.BIGINT, field: 'AdministerStatusId' },
        IseMAR: { type: DataTypes.BOOLEAN, field: 'IseMAR' },
        ReviewDate: { type: DataTypes.DATE, field: 'ReviewDate' },
        SurgeryDate: { type: DataTypes.DATE, field: 'SurgeryDate' },
        SurgeryId: { type: DataTypes.BIGINT, field: 'SurgeryId' },
        OtherSurgery: { type: DataTypes.STRING, field: 'OtherSurgery' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'hims_prescriptions',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Prescription as any).associate = function (models: Models) {
        // Prescription.belongsTo(models.User, { foreignKey: 'DoctorId' });
        Prescription.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        Prescription.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        Prescription.belongsTo(models.StoreMaster, { foreignKey: 'PharmacyId' });
        Prescription.belongsTo(models.Department);
        Prescription.belongsTo(models.ReferenceValue, { as: 'PrescriptionPriority', targetKey: 'ReferenceValueCodeId' });
        Prescription.belongsTo(models.ReferenceValue, { as: 'Pharmacy', targetKey: 'ReferenceValueCodeId' });
        Prescription.belongsTo(models.ReferenceValue, { as: 'PrecriptionStatus', targetKey: 'ReferenceValueCodeId' });
        Prescription.belongsTo(models.ReferenceValue, { as: 'DispenseStatus', targetKey: 'ReferenceValueCodeId' });
        Prescription.hasMany(models.PrescriptionDetail);
        Prescription.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        Prescription.belongsTo(models.Diagnosis, { foreignKey: 'DiagnosisId' });
        Prescription.belongsTo(models.ServiceItem, { foreignKey: 'PhysiotheraphyId' });
        Prescription.belongsTo(models.Procedure, { foreignKey: 'SurgeryId' });
    };
    return Prescription;
}
