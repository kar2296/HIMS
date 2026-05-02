import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IncidentReportingInstance, i.IncidentReportingAttributes> {
    let IncidentReporting =
    sequelize.define<i.IncidentReportingInstance, i.IncidentReportingAttributes>('IncidentReporting', {
        Id: { type: DataTypes.BIGINT, field: 'PatientIncidentReportingId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        IncidentReportingTime: { type: DataTypes.DATE, field: 'IncidentReportingTime' },
        IncidentReportingTypeId: { type: DataTypes.INTEGER, field: 'IncidentReportingTypeId' },
        IncidentReportingStatusId: { type: DataTypes.INTEGER, field: 'IncidentReportingStatusId' },
        ReportedBy: { type: DataTypes.STRING, field: 'ReportedBy' },
        EmpId: { type: DataTypes.STRING, field: 'EmpId' },
        Department: { type: DataTypes.STRING, field: 'Department' },
        InvolvedPersonName: { type: DataTypes.STRING, field: 'InvolvedPersonName' },
        AgeGender: { type: DataTypes.STRING, field: 'AgeGender' },
        UHID: { type: DataTypes.STRING, field: 'UHID' },
        IncidentDate: { type: DataTypes.STRING, field: 'IncidentDate' },
        IncidentTime: { type: DataTypes.STRING, field: 'IncidentTime' },
        IncidentLocation: { type: DataTypes.STRING, field: 'IncidentLocation' },
        IncidentDescription: { type: DataTypes.STRING, field: 'IncidentDescription' },
        RootCause: { type: DataTypes.STRING, field: 'RootCause' },
        CorrectiveAction: { type: DataTypes.STRING, field: 'CorrectiveAction' },
        PreventiveAction: { type: DataTypes.STRING, field: 'PreventiveAction' },
        SupervisorComments: { type: DataTypes.STRING, field: 'SupervisorComments' },
        IncidentOccurredId: { type: DataTypes.INTEGER, field: 'IncidentOccurredId' },
        OtherIncident: { type: DataTypes.STRING, field: 'OtherIncident' },
        ClassificationIncidentId: { type: DataTypes.INTEGER, field: 'ClassificationIncidentId' },
        TypeOfIncidentId: { type: DataTypes.INTEGER, field: 'TypeOfIncidentId' },
        AdverseDrugId: { type: DataTypes.INTEGER, field: 'AdverseDrugId' },
        FallId: { type: DataTypes.INTEGER, field: 'FallId' },
        SurgicalErrorId: { type: DataTypes.INTEGER, field: 'SurgicalErrorId' },
        OtherSurgicalError: { type: DataTypes.STRING, field: 'OtherSurgicalError' },
        PatientCareId: { type: DataTypes.INTEGER, field: 'PatientCareId' },
        OtherPatientCare: { type: DataTypes.STRING, field: 'OtherPatientCare' },
        MiscellaneousId: { type: DataTypes.INTEGER, field: 'MiscellaneousId' },
        OtherMiscellaneous: { type: DataTypes.STRING, field: 'OtherMiscellaneous' },
        EquipmentId: { type: DataTypes.INTEGER, field: 'EquipmentId' },
        SecurityId: { type: DataTypes.INTEGER, field: 'SecurityId' },
        OtherSecurity: { type: DataTypes.STRING, field: 'OtherSecurity' },
        Attachment1: { type: DataTypes.STRING, field: 'Attachment1' },
        Attachment2: { type: DataTypes.STRING, field: 'Attachment2' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedAt: { type: DataTypes.DATE, field: 'ApprovedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientincidentreporting',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (IncidentReporting as any).associate = function (models: Models) {
        IncidentReporting.belongsTo(models.Facility);
        IncidentReporting.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        IncidentReporting.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
        IncidentReporting.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'IncidentReportingType', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'IncidentReportingStatus', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'IncidentOccurred',
        foreignKey: 'IncidentOccurredId', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'ClassificationIncident',
        foreignKey: 'ClassificationIncidentId', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'TypeOfIncident',
        foreignKey: 'TypeOfIncidentId', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'AdverseDrug',
        foreignKey: 'AdverseDrugId', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'Fall',
        foreignKey: 'FallId', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'SurgicalError',
        foreignKey: 'SurgicalErrorId', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'PatientCare',
        foreignKey: 'PatientCareId', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'Miscellaneous',
        foreignKey: 'MiscellaneousId', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'Equipment',
        foreignKey: 'EquipmentId', targetKey: 'ReferenceValueCodeId' });
        IncidentReporting.belongsTo(models.ReferenceValue, { as: 'Security',
        foreignKey: 'SecurityId', targetKey: 'ReferenceValueCodeId' });
    };
    return IncidentReporting;
}
