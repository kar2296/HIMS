import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientEstimationInstance, i.PatientEstimationAttributes> {
    let PatientEstimation = sequelize.define<i.PatientEstimationInstance, i.PatientEstimationAttributes>('PatientEstimation', {
        Id: { type: DataTypes.BIGINT, field: 'PatientEstimationId', primaryKey: true, autoIncrement: true },
        EstimationDate: { type: DataTypes.DATE, field: 'EstimationDate' },
        BedTypeId: { type: DataTypes.BIGINT, field: 'BedTypeId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        ContactDetails: { type: DataTypes.STRING, field: 'ContactDetails' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        EstimationInclusion: { type: DataTypes.STRING, field: 'EstimationInclusion' },
        EstimationExclusion: { type: DataTypes.STRING, field: 'EstimationExclusion' },
        AttendersName: { type: DataTypes.STRING, field: 'AttendersName' },
        RelationshipId: { type: DataTypes.STRING, field: 'RelationshipId' },
        Treatment: { type: DataTypes.STRING, field: 'Treatment' },
        SaveTypeId: { type: DataTypes.BIGINT, field: 'SaveTypeId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        Age: { type: DataTypes.INTEGER, field: 'Age' },
        GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientestimation',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
        (PatientEstimation as any).associate = function (models: Models) {
            PatientEstimation.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
            PatientEstimation.belongsTo(models.Patient, { foreignKey: 'PatientId' });
            PatientEstimation.belongsTo(models.DoctorInvoiceDetails, { foreignKey: 'DoctorId' });
            PatientEstimation.hasMany(models.PatientEstimationDetails);
            PatientEstimation.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
            PatientEstimation.belongsTo(models.ReferenceValue, {
                as: 'BedType',
                foreignKey: 'BedTypeId', targetKey: 'ReferenceValueCodeId'
            });
            PatientEstimation.belongsTo(models.ReferenceValue, {
                as: 'GuarantorType',
                foreignKey: 'GuarantorId', targetKey: 'ReferenceValueCodeId'
            });
            PatientEstimation.belongsTo(models.ReferenceValue, {
                as: 'Relationship',
                foreignKey: 'RelationshipId', targetKey: 'ReferenceValueCodeId'
            });
            PatientEstimation.belongsTo(models.ReferenceValue, {
                as: 'SaveType',
                foreignKey: 'SaveTypeId', targetKey: 'ReferenceValueCodeId'
            });
            PatientEstimation.belongsTo(models.ReferenceValue, {
                as: 'Gender',
                foreignKey: 'GenderId', targetKey: 'ReferenceValueCodeId'
            });
        };
    return PatientEstimation;
}
