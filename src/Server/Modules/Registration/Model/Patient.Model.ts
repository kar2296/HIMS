import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientInstance, i.PatientAttributes> {
    let Patient = sequelize.define<i.PatientInstance, i.PatientAttributes>('Patient', {
        Id: { type: DataTypes.BIGINT, field: 'PatientId', primaryKey: true, autoIncrement: true },
        TitleId: { type: DataTypes.BIGINT, field: 'TitleId' },
        FirstName: { type: DataTypes.STRING, field: 'FirstName' },
        MiddleName: { type: DataTypes.STRING, field: 'MiddleName' },
        LastName: { type: DataTypes.STRING, field: 'LastName' },
        Age: { type: DataTypes.INTEGER, field: 'Age' },
        DOB: { type: DataTypes.DATE, field: 'DOB' },
        MaritalStatusId: { type: DataTypes.BIGINT, field: 'MaritalStatusId' },
        GuardianTypeId: { type: DataTypes.BIGINT, field: 'GuardianTypeId' },
        GuardianName: { type: DataTypes.STRING, field: 'GuardianName' },
        IsIvfRegistration: { type: DataTypes.BOOLEAN, field: 'IsIvfRegistration' },
        FamilyUniqueId: { type: DataTypes.STRING, field: 'FamilyUniqueId' },
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
        IsMLC: { type: DataTypes.BOOLEAN, field: 'IsMLC' },
        MLCInfo: { type: DataTypes.STRING, field: 'MLCInfo' },
        IsRecipient: { type: DataTypes.BOOLEAN, field: 'IsRecipient' },
        //PatientAssociate: { type: DataTypes.STRING, field: 'PatientAssociate' },
        CovidVaccineId: { type: DataTypes.BIGINT, field: 'CovidVaccineId' },
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
        // IsSmsCommunicationPreference: { type: DataTypes.BOOLEAN, field: 'IsSmsCommunicationPreference' },
        // IsEmailCommunicationPreference: { type: DataTypes.BOOLEAN, field: 'IsEmailCommunicationPreference' },
        IsMRDRequest: { type: DataTypes.BOOLEAN, field: 'IsMRDRequest' },
        GenderId: { type: DataTypes.INTEGER, field: 'GenderId' },
        MRN: { type: DataTypes.STRING, field: 'MRN' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        // WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        // Ward: { type: DataTypes.STRING, field: 'Ward' },
        DistrictId: { type: DataTypes.BIGINT, field: 'DistrictId' },
        District: { type: DataTypes.STRING, field: 'District' },
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
        // ICENo: { type: DataTypes.STRING, field: 'ICENo' },
        Income: { type: DataTypes.STRING, field: 'Income' },
        IsInsurance: { type: DataTypes.BOOLEAN, field: 'IsInsurance' },
        ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
        // NooFVisitFree: { type: DataTypes.INTEGER, field: 'NooFVisitFree' },
        IsAdditionalVisit: { type: DataTypes.BOOLEAN, field: 'IsAdditionalVisit' },
        NewVisitFree: { type: DataTypes.INTEGER, field: 'NewVisitFree' },
        IsMerged: { type: DataTypes.BOOLEAN, field: 'IsMerged' },
        MergePatientId: { type: DataTypes.BIGINT, field: 'MergePatientId' },
        MergeMRN: { type: DataTypes.STRING, field: 'MergeMRN' },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        Staff: { type: DataTypes.BOOLEAN, field: 'Staff' },
        IsCorporateCustomer: { type: DataTypes.BOOLEAN, field: 'IsCorporateCustomer' },
        IsEmergencyPatient: { type: DataTypes.BOOLEAN, field: 'IsEmergencyPatient' },
        EmergencyContactName: { type: DataTypes.STRING, field: 'EmergencyContactName' },
        AlternateMobileNum: { type: DataTypes.STRING, field: 'AlternateMobileNum' },
        AlternateEmail: { type: DataTypes.STRING, field: 'AlternateEmail' },
        Relation: { type: DataTypes.STRING, field: 'Relation' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        DeactivatedDate: { type: DataTypes.DATE, field: 'DeactivatedDate' },
        NotificationToken: { type: DataTypes.STRING, field: 'NotificationToken' },
        // SwosthaPatientId: { type: DataTypes.BIGINT, field: 'SwosthaPatientId' },
        ParentPatientId: { type: DataTypes.BIGINT, field: 'ParentPatientId' },
        CardTypeId: { type: DataTypes.BIGINT, field: 'CardTypeId' },
        VipTypeId: { type: DataTypes.BIGINT, field: 'VipTypeId' },
        PromotionSchemeId: { type: DataTypes.BIGINT, field: 'PromotionSchemeId' },
        CardNo: { type: DataTypes.STRING, field: 'CardNo' },
        HolderName: { type: DataTypes.STRING, field: 'HolderName' },
        ValidTo: { type: DataTypes.DATE, field: 'ValidTo' },
        // SwosthaPatientMRN: { type: DataTypes.STRING, field: 'SwosthaPatientMRN' },
        BabyBirthTime: { type: DataTypes.TIME, field: 'BabyBirthTime' },
        IsExcelUpload: { type: DataTypes.BOOLEAN, field: 'IsExcelUpload' },
        CustomerId: { type: DataTypes.BIGINT, field: 'CustomerId' },
        patientdatatpl: { type: DataTypes.TEXT, field: 'patientdatatpl', allowNull: true },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patients',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Patient as any).associate = function (models: Models) {
        Patient.belongsTo(models.ReferenceValue, { as: 'Gender', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'ReferralType', foreignKey: 'ReferTypeId', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'GuardianType', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'PatientType', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'Title', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'PatientStatus', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'MaritalStatus', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'Religion', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'Nationality', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'BloodGroup', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.ReferenceValue, { as: 'VipType', targetKey: 'ReferenceValueCodeId' });
        Patient.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        Patient.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
        Patient.belongsTo(models.User, { as: 'DeathUpdated', foreignKey: 'DeathUpdatedBy' });
        Patient.belongsTo(models.User, { as: 'DeathApproved', foreignKey: 'DeathApprovedBy' });
        Patient.belongsTo(models.Referral, { as: 'Referrer', foreignKey: 'ReferrerId' });
        Patient.belongsTo(models.PatientGuarantor, { foreignKey: 'GuarantorId' });
        Patient.belongsTo(models.Occupation, { foreignKey: 'OccupationId' });
        Patient.belongsTo(models.Guarantor);
        Patient.belongsTo(models.Referral, { foreignKey: 'ReferrerId' });
        Patient.belongsTo(models.Remark, { foreignKey: 'RemarkId' });
        Patient.belongsTo(models.CityMaster, { foreignKey: 'CityId' });
        Patient.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
        Patient.belongsTo(models.DistrictMaster, { foreignKey: 'DistrictId' });
        Patient.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
        Patient.hasMany(models.Appointment);
        Patient.hasMany(models.Encounter);
        Patient.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        Patient.hasMany(models.PatientTracker);
        Patient.hasMany(models.EncounterDoctor);
        Patient.hasMany(models.PatientBills);
        Patient.hasOne(models.AppointmentDisplay);

    };
    return Patient as SequelizeStatic.Model<i.PatientInstance, i.PatientAttributes>;
}
