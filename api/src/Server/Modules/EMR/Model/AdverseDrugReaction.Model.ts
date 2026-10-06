import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AdverseDrugReactionInstance, i.AdverseDrugReactionAttributes> {
    let AdverseDrugReaction = sequelize.define<i.AdverseDrugReactionInstance, i.AdverseDrugReactionAttributes>('AdverseDrugReaction', {
        Id: { type: DataTypes.BIGINT, field: 'PatientAdverseDrugReactionId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        DiagnosisName: { type: DataTypes.STRING, field: 'DiagnosisName' },
        AdverseDateTime: { type: DataTypes.DATE, field: 'AdverseDateTime' },
        AdverseDrugReactionTypeId: { type: DataTypes.INTEGER, field: 'AdverseDrugReactionTypeId' },
        AdverseDrugReactionStatusId: { type: DataTypes.INTEGER, field: 'AdverseDrugReactionStatusId' },
        ConsultantName: { type: DataTypes.STRING, field: 'ConsultantName' },
        DateSuspectedADR: { type: DataTypes.STRING, field: 'DateSuspectedADR' },
        BrandNameGeneric: { type: DataTypes.STRING, field: 'BrandNameGeneric' },
        DosageFrequencyOrdered: { type: DataTypes.STRING, field: 'DosageFrequencyOrdered' },
        RouteofAdministration: { type: DataTypes.STRING, field: 'RouteofAdministration' },
        BatchNoExpiryDate: { type: DataTypes.STRING, field: 'BatchNoExpiryDate' },
        SourceofDrugId: { type: DataTypes.BIGINT, field: 'SourceofDrugId' },
        DetailGenericName: { type: DataTypes.STRING, field: 'DetailGenericName' },
        PreviousAllergies: { type: DataTypes.STRING, field: 'PreviousAllergies' },
        TypeofReactionId: { type: DataTypes.BIGINT, field: 'TypeofReactionId' },
        OtherReaction: { type: DataTypes.STRING, field: 'OtherReaction' },
        LevelofReaction: { type: DataTypes.STRING, field: 'LevelofReaction' },
        OutcomeofADR: { type: DataTypes.STRING, field: 'OutcomeofADR' },
        CorrectiveAction: { type: DataTypes.STRING, field: 'CorrectiveAction' },
        PreventiveAction: { type: DataTypes.STRING, field: 'PreventiveAction' },
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
            tableName: 'patientadversedrugreaction',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AdverseDrugReaction as any).associate = function (models: Models) {
        AdverseDrugReaction.belongsTo(models.Facility);
        AdverseDrugReaction.belongsTo(models.Patient);
        AdverseDrugReaction.belongsTo(models.Diagnosis);
        AdverseDrugReaction.belongsTo(models.ReferenceValue, { as: 'SourceofDrug',
        foreignKey: 'SourceofDrugId', targetKey: 'ReferenceValueCodeId' });
        AdverseDrugReaction.belongsTo(models.ReferenceValue, { as: 'TypeofReaction',
        foreignKey: 'TypeofReactionId', targetKey: 'ReferenceValueCodeId' });
        AdverseDrugReaction.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        AdverseDrugReaction.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
        AdverseDrugReaction.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        AdverseDrugReaction.belongsTo(models.ReferenceValue, { as: 'AdverseDrugReactionType', targetKey: 'ReferenceValueCodeId' });
        AdverseDrugReaction.belongsTo(models.ReferenceValue, { as: 'AdverseDrugReactionStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return AdverseDrugReaction;
}
