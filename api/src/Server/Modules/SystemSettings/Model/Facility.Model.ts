import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FacilityInstance, i.FacilityAttributes> {
    let Facility = sequelize.define<i.FacilityInstance, i.FacilityAttributes>('Facility', {
        Id: { type: DataTypes.BIGINT, field: 'FacilityId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityCode: { type: DataTypes.STRING, field: 'FacilityCode' },
        FacilityName: { type: DataTypes.STRING, field: 'FacilityName' },
        FacilityTypeId: { type: DataTypes.INTEGER, field: 'FacilityTypeId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        PinCode: { type: DataTypes.STRING, field: 'PinCode' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        City: { type: DataTypes.STRING, field: 'City' },
        State: { type: DataTypes.STRING, field: 'State' },
        Country: { type: DataTypes.STRING, field: 'Country' },
        LandLine: { type: DataTypes.STRING, field: 'LandLine' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        FaxNo: { type: DataTypes.STRING, field: 'FaxNo' },
        Email: { type: DataTypes.STRING, field: 'Email' },
        LanguageId: { type: DataTypes.INTEGER, field: 'LanguageId' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        IsPurchaseReturnEditable: { type: DataTypes.BOOLEAN, field: 'IsPurchaseReturnEditable' },
        IsGstRegistered: { type: DataTypes.BOOLEAN, field: 'IsGstRegistered' },
        IsDeptWiseLabPrint: { type: DataTypes.BOOLEAN, field: 'IsDeptWiseLabPrint' },
        GstNumber: { type: DataTypes.STRING, field: 'GstNumber' },
        RegistrationNo: { type: DataTypes.STRING, field: 'RegistrationNo' },
        TaxActiveFrom: { type: DataTypes.DATE, field: 'TaxActiveFrom' },
        TaxActiveTo: { type: DataTypes.DATE, field: 'TaxActiveTo' },
        LicenseExpiryDate: { type: DataTypes.DATE, field: 'LicenseExpiryDate' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        Ward: { type: DataTypes.STRING, field: 'Ward' },
        DistrictId: { type: DataTypes.BIGINT, field: 'DistrictId' },
        District: { type: DataTypes.STRING, field: 'District' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        PAN: { type: DataTypes.STRING, field: 'PAN' },
        TAXPlayerUserName: { type: DataTypes.STRING, field: 'TAXPlayerUserName' },
        TAXPlayerPassword: { type: DataTypes.STRING, field: 'TAXPlayerPassword' },
        FacilityLogo: { type: DataTypes.TEXT, field: 'FacilityLogo' },
        LogoPath: { type: DataTypes.STRING, field: 'LogoPath' },
        SecondLogoPath: { type: DataTypes.STRING, field: 'SecondLogoPath' },
        IsShowItemType: { type: DataTypes.BOOLEAN, field: 'IsShowItemType' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsLabCentre: { type: DataTypes.BOOLEAN, field: 'IsLabCentre' },
        IsMedicineCentre: { type: DataTypes.BOOLEAN, field: 'IsMedicineCentre' },
        IsVAT: { type: DataTypes.BOOLEAN, field: 'IsVAT' },
        IsConvertionQtyEdit: { type: DataTypes.BOOLEAN, field: 'IsConvertionQtyEdit' },
        IsAddressSearch: { type: DataTypes.BOOLEAN, field: 'IsAddressSearch' },
        IsAlternateEmailMandatory: { type: DataTypes.BOOLEAN, field: 'IsAlternateEmailMandatory' },
        IsAlternateMobileMandatory: { type: DataTypes.BOOLEAN, field: 'IsAlternateMobileMandatory' },
        IsDueBill: { type: DataTypes.BOOLEAN, field: 'IsDueBill' },
        IsDoctorShare: { type: DataTypes.BOOLEAN, field: 'IsDoctorShare' },
        IsAdmissionDate: { type: DataTypes.BOOLEAN, field: 'IsAdmissionDate' },
        // IsPatientSearchbyEnter: { type: DataTypes.BOOLEAN, field: 'IsPatientSearchbyEnter' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Lat: { type: DataTypes.FLOAT, field: 'Lat' },
        Lng: { type: DataTypes.FLOAT, field: 'Lng' },
        ResultFormatTypeId: { type: DataTypes.BIGINT, field: 'ResultFormatTypeId' },
        MaxRescheduleTime: { type: DataTypes.INTEGER, field: 'MaxRescheduleTime' },
        IsSwosthaIntegration: { type: DataTypes.BOOLEAN, field: 'IsSwosthaIntegration' },
        IsMultipleDiscount: { type: DataTypes.BOOLEAN, field: 'IsMultipleDiscount' },
        IsItemmasterDrugshow: { type: DataTypes.BOOLEAN, field: 'IsItemmasterDrugshow' },
        ShowAliasInfo: { type: DataTypes.BOOLEAN, field: 'ShowAliasInfo' },
        IsPincodeFreeText: { type: DataTypes.BOOLEAN, field: 'IsPincodeFreeText' },
        IsWardRoomEditable: { type: DataTypes.BOOLEAN, field: 'IsWardRoomEditable' },
        ShowMrp: { type: DataTypes.BOOLEAN, field: 'ShowMrp' },
        MrpPercent: { type: DataTypes.STRING, field: 'MrpPercent' },
        SwosthaURI: { type: DataTypes.STRING, field: 'SwosthaURI' },
        SwosthaKey: { type: DataTypes.STRING, field: 'SwosthaKey' },
        SeniorCitizenDiscount: { type: DataTypes.INTEGER, field: 'SeniorCitizenDiscount' },
        IsItemCodeEdit: { type: DataTypes.BOOLEAN, field: 'IsItemCodeEdit' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        HouseKeepingNumber: { type: DataTypes.STRING, field: 'HouseKeepingNumber' },
        IsCashPatientEmrIndent: { type: DataTypes.BOOLEAN, field: 'IsCashPatientEmrIndent' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'facilities',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Facility as any).associate = function (models: Models) {
        Facility.belongsTo(models.Organization);
        Facility.belongsTo(models.PincodeMaster, { foreignKey: 'PinCodeId' });
        Facility.belongsTo(models.CityMaster, { foreignKey: 'CityId' });
        Facility.belongsTo(models.DistrictMaster, { foreignKey: 'DistrictId' });
        Facility.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
        Facility.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
        Facility.belongsTo(models.ReferenceValue, { as: 'FacilityType', targetKey: 'ReferenceValueCodeId' });
        Facility.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        Facility.hasMany(models.UserFacilityMap);
        Facility.belongsToMany(models.ServiceItem, { through: models.ServiceItemFacilityMap });
    };
    return Facility;
}
