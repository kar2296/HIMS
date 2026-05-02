import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ReferralInstance, i.ReferralAttributes> {
    let Referral = sequelize.define<i.ReferralInstance, i.ReferralAttributes>('Referral', {
        Id: { type: DataTypes.BIGINT, field: 'ReferralId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ReferralTypeId: { type: DataTypes.BIGINT, field: 'ReferralTypeId' },
        ReferralCode: { type: DataTypes.STRING, field: 'ReferralCode' },
        ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
        MarketingPersonId: { type: DataTypes.BIGINT, field: 'MarketingPersonId' },
        ContactPerson: { type: DataTypes.STRING, field: 'ContactPerson' },
        PhoneNo: { type: DataTypes.STRING, field: 'PhoneNo' },
        FaxNo: { type: DataTypes.STRING, field: 'FaxNo' },
        Email: { type: DataTypes.STRING, field: 'Email' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        BirthDate: { type: DataTypes.DATE, field: 'BirthDate' },
        AnniversaryDate: { type: DataTypes.DATE, field: 'AnniversaryDate' },
        Qualification: { type: DataTypes.STRING, field: 'Qualification' },
        SpecialityId: { type: DataTypes.BIGINT, field: 'SpecialityId' },
        PANNo: { type: DataTypes.STRING, field: 'PANNo' },
        AccountNo: { type: DataTypes.STRING, field: 'AccountNo' },
        BankNo: { type: DataTypes.STRING, field: 'BankNo' },
        IFSCCode: { type: DataTypes.STRING, field: 'IFSCCode' },
        Source: { type: DataTypes.STRING, field: 'Source' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsDefault: { type: DataTypes.BOOLEAN, field: 'IsDefault' },
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
            tableName: 'referrals',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Referral as any).associate = function (models: Models) {
        Referral.belongsTo(models.Facility);
        Referral.belongsTo(models.CityMaster, { foreignKey: 'CityId' });
        Referral.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
        Referral.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
        Referral.belongsTo(models.ReferenceValue, { as: 'ReferralType', targetKey: 'ReferenceValueCodeId' });
        Referral.belongsTo(models.ReferenceValue, { as: 'MarketingPerson', targetKey: 'ReferenceValueCodeId' });
        Referral.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return Referral;
}
