import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.WardInsuranceTariffInstance, i.WardInsuranceTariffAttributes> {
    let WardInsuranceTariff = sequelize.define<i.WardInsuranceTariffInstance, i.WardInsuranceTariffAttributes>('WardInsuranceTariff', {
        Id: { type: DataTypes.BIGINT, field: 'WardInsuranceTariffId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        InsuranceId: { type: DataTypes.BIGINT, field: 'InsuranceId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RateTypeId: { type: DataTypes.BIGINT, field: 'RateTypeId' },
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
            tableName: 'wardinsurancetariff',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    // (WardInsuranceTariff as any).associate = function (models: Models) {
    //     WardInsuranceTariff.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    // };
    return WardInsuranceTariff;
}
