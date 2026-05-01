import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GuarantorAgreementInstance, i.GuarantorAgreementAttributes> {
    let GuarantorAgreement = sequelize.define<i.GuarantorAgreementInstance, i.GuarantorAgreementAttributes>(
        'GuarantorAgreement', {
        Id: { type: DataTypes.BIGINT, field: 'GuarantorAgreementId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        ServiceCategoryCode: { type: DataTypes.STRING, field: 'ServiceCategoryCode' },
        ServiceCategoryName: { type: DataTypes.STRING, field: 'ServiceCategoryName' },
        // Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        // DiscountRate: { type: DataTypes.DECIMAL, field: 'DiscountRate' },
        OPDiscount: { type: DataTypes.DECIMAL, field: 'OPDiscount' },
        OPDiscountRate: { type: DataTypes.DECIMAL, field: 'OPDiscountRate' },
        IPDiscount: { type: DataTypes.DECIMAL, field: 'IPDiscount' },
        IPDiscountRate: { type: DataTypes.DECIMAL, field: 'IPDiscountRate' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'guarantoragreements',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return GuarantorAgreement;
}
