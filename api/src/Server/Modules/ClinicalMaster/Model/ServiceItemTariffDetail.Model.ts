import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';
export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceItemTariffDetailInstance, i.ServiceItemTariffDetailAttributes> {
    let ServiceItemTariffDetail = sequelize.define<i.ServiceItemTariffDetailInstance,
        i.ServiceItemTariffDetailAttributes>('ServiceItemTariffDetail', {
            Id: { type: DataTypes.BIGINT, field: 'TariffDetailId', primaryKey: true, autoIncrement: true },
            ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
            ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' }, // Add this missing field
            Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
            EmergencyRate: { type: DataTypes.DECIMAL, field: 'EmergencyRate' },
            ShareTypeId: { type: DataTypes.BIGINT, field: 'ShareTypeId' },
            DoctorShareValue: { type: DataTypes.DECIMAL, field: 'DoctorShareValue' },
            DoctorShare: { type: DataTypes.DECIMAL, field: 'DoctorShare' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            EffectiveFrom: { type: DataTypes.DATE, field: 'EffectiveFrom' },
            EffectiveTo: { type: DataTypes.DATE, field: 'EffectiveTo' },
            CurrencyId: { type: DataTypes.BIGINT, field: 'CurrencyId' },
            DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
            Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
            ExternalPrice: { type: DataTypes.DECIMAL, field: 'ExternalPrice' },
            StatusId: { type: DataTypes.BOOLEAN, field: 'StatusId' },
            TariffTypeId: { type: DataTypes.INTEGER, field: 'TariffTypeId' },
            InsuranceId: { type: DataTypes.INTEGER, field: 'InsuranceId' },
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
                tableName: 'serviceitemtariffdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });
    (ServiceItemTariffDetail as any).associate = function (models: any) {
        ServiceItemTariffDetail.belongsTo(models.ServiceItem);
        ServiceItemTariffDetail.belongsTo(models.ServiceRateCategory, { foreignKey: 'ServiceRateCategoryId' });
        ServiceItemTariffDetail.belongsTo(models.ReferenceValue, {
            as: 'PatientType',
            foreignKey: 'PatientTypeId',
            targetKey: 'ReferenceValueCodeId'
        }); // Add association for PatientType
    };
    return ServiceItemTariffDetail;
}
