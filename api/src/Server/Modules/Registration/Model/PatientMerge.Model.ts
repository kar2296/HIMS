import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientMergeInstance, i.PatientMergeAttributes> {
    let PatientMerge = sequelize.define<i.PatientMergeInstance, i.PatientMergeAttributes>('PatientMerge', {
        Id: { type: DataTypes.BIGINT, field: 'PatientMergeId', primaryKey: true, autoIncrement: true },
        TrasactionId: { type: DataTypes.BIGINT, field: 'TrasactionId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        TitleId: { type: DataTypes.BIGINT, field: 'TitleId' },
        FirstName: { type: DataTypes.STRING, field: 'FirstName' },
        MiddleName: { type: DataTypes.STRING, field: 'MiddleName' },
        LastName: { type: DataTypes.STRING, field: 'LastName' },
        Age: { type: DataTypes.INTEGER, field: 'Age' },
        DOB: { type: DataTypes.DATE, field: 'DOB' },
        MaritalStatusId: { type: DataTypes.BIGINT, field: 'MaritalStatusId' },
        GuardianTypeId: { type: DataTypes.BIGINT, field: 'GuardianTypeId' },
        GuardianName: { type: DataTypes.STRING, field: 'GuardianName' },
        ReligionId: { type: DataTypes.BIGINT, field: 'ReligionId' },
        PreferredLanguageId: { type: DataTypes.BIGINT, field: 'PreferredLanguageId' },
        Qualification: { type: DataTypes.STRING, field: 'Qualification' },
        NationalityId: { type: DataTypes.BIGINT, field: 'NationalityId' },
        NationalityIdentifier: { type: DataTypes.STRING, field: 'NationalityIdentifier' },
        PasspostNumber: { type: DataTypes.STRING, field: 'PasspostNumber' },
        VisaTypeId: { type: DataTypes.BIGINT, field: 'VisaTypeId' },
        VisaNumber: { type: DataTypes.STRING, field: 'VisaNumber' },
        VisaExpiry: { type: DataTypes.DATE, field: 'VisaExpiry' },
        IsVip: { type: DataTypes.BOOLEAN, field: 'IsVip' },
        IsCouple: { type: DataTypes.BOOLEAN, field: 'IsCouple' },
        IsRecipient: { type: DataTypes.BOOLEAN, field: 'IsRecipient' },
        PatientAssociate: { type: DataTypes.STRING, field: 'PatientAssociate' },
        VipTypeId: { type: DataTypes.BIGINT, field: 'VipTypeId' },
        PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
        OccupationId: { type: DataTypes.BIGINT, field: 'OccupationId' },
        BloodGroupId: { type: DataTypes.BIGINT, field: 'BloodGroupId' },
        ReferTypeId: { type: DataTypes.BIGINT, field: 'ReferTypeId' },
        ReferrerId: { type: DataTypes.BIGINT, field: 'ReferrerId' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        Pincode: { type: DataTypes.STRING, field: 'Pincode' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        City: { type: DataTypes.STRING, field: 'City' },
        State: { type: DataTypes.STRING, field: 'State' },
        Country: { type: DataTypes.STRING, field: 'Country' },
        LandLine: { type: DataTypes.STRING, field: 'LandLine' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        Email: { type: DataTypes.STRING, field: 'Email' },
        IsSmsCommunicationPreference: { type: DataTypes.BOOLEAN, field: 'IsSmsCommunicationPreference' },
        IsEmailCommunicationPreference: { type: DataTypes.BOOLEAN, field: 'IsEmailCommunicationPreference' },
        IsMRDRequest: { type: DataTypes.BOOLEAN, field: 'IsMRDRequest' },
        GenderId: { type: DataTypes.INTEGER, field: 'GenderId' },
        MRN: { type: DataTypes.STRING, field: 'MRN' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        AliasName: { type: DataTypes.STRING, field: 'AliasName' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        RegisteredDate: { type: DataTypes.DATE, field: 'RegisteredDate' },
        PatientStatusId: { type: DataTypes.INTEGER, field: 'PatientStatusId' },
        MRNTypeId: { type: DataTypes.INTEGER, field: 'MRNTypeId' },
        PhotoPath: { type: DataTypes.STRING, field: 'PhotoPath' },
        IsBirthDateApproximate: { type: DataTypes.BOOLEAN, field: 'IsBirthDateApproximate' },
        DeathDate: { type: DataTypes.DATE, field: 'DeathDate' },
        DeathTypeId: { type: DataTypes.BIGINT, field: 'DeathTypeId' },
        DeathPlaceId: { type: DataTypes.BIGINT, field: 'DeathPlaceId' },
        IsDeathConfirmed: { type: DataTypes.BOOLEAN, field: 'IsDeathConfirmed' },
        DeathConfirmedBy: { type: DataTypes.BIGINT, field: 'DeathConfirmedBy' },
        DeathComents: { type: DataTypes.STRING, field: 'DeathComents' },
        DeathUpdatedBy: { type: DataTypes.BIGINT, field: 'DeathUpdatedBy' },
        DeathUpdatedDate: { type: DataTypes.DATE, field: 'DeathUpdatedDate' },
        DeathApprovedBy: { type: DataTypes.BIGINT, field: 'DeathApprovedBy' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
        MRNShortCode: { type: DataTypes.STRING, field: 'MRNShortCode' },
        ICENo: { type: DataTypes.STRING, field: 'ICENo' },
        Income: { type: DataTypes.STRING, field: 'Income' },
        IsInsurance: { type: DataTypes.BOOLEAN, field: 'IsInsurance' },
        ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
        NooFVisitFree: { type: DataTypes.INTEGER, field: 'NooFVisitFree' },
        IsAdditionalVisit: { type: DataTypes.BOOLEAN, field: 'IsAdditionalVisit' },
        NewVisitFree: { type: DataTypes.INTEGER, field: 'NewVisitFree' },
        IsMerged: { type: DataTypes.BOOLEAN, field: 'IsMerged' },
        MergePatientId: { type: DataTypes.BIGINT, field: 'MergePatientId'},
        MergeMRN: { type: DataTypes.STRING, field: 'MergeMRN' },
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
            tableName: 'patientmerge',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientMerge as any).associate = function (models: Models) {
        PatientMerge.belongsTo(models.ReferenceValue, { as: 'Gender', targetKey: 'ReferenceValueCodeId' });
        PatientMerge.belongsTo(models.ReferenceValue, { as: 'Title', targetKey: 'ReferenceValueCodeId' });
        PatientMerge.belongsTo(models.ReferenceValue, { as: 'PatientStatus', targetKey: 'ReferenceValueCodeId' });
        PatientMerge.belongsTo(models.ReferenceValue, { as: 'MaritalStatus', targetKey: 'ReferenceValueCodeId' });
        PatientMerge.belongsTo(models.ReferenceValue, { as: 'Religion', targetKey: 'ReferenceValueCodeId' });
        PatientMerge.belongsTo(models.ReferenceValue, { as: 'Nationality', targetKey: 'ReferenceValueCodeId' });
        PatientMerge.belongsTo(models.ReferenceValue, { as: 'BloodGroup', targetKey: 'ReferenceValueCodeId' });
        PatientMerge.belongsTo(models.User, { as: 'DeathUpdated', foreignKey: 'DeathUpdatedBy' });
        PatientMerge.belongsTo(models.User, { as: 'DeathApproved', foreignKey: 'DeathApprovedBy' });
        PatientMerge.belongsTo(models.Referral, { as: 'Referrer', foreignKey: 'ReferrerId' });
        PatientMerge.belongsTo(models.Occupation, { foreignKey: 'OccupationId' });
        PatientMerge.belongsTo(models.Guarantor);
        PatientMerge.belongsTo(models.Referral, { foreignKey: 'ReferrerId' });
        PatientMerge.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    };
    return PatientMerge;
}
