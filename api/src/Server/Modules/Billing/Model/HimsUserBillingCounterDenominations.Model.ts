import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserBillingCounterDenominationsInstance, i.UserBillingCounterDenominationsAttributes> {
    let UserBillingCounterDenominations = sequelize.define<i.UserBillingCounterDenominationsInstance,
        i.UserBillingCounterDenominationsAttributes>('UserBillingCounterDenominations', {
            Id: { type: DataTypes.BIGINT, field: 'UserBillingCounterDenominationId', primaryKey: true, autoIncrement: true },
            UserBillingCounterId: { type: DataTypes.BIGINT, field: 'UserBillingCounterId' },
            CurrencyCodeId: { type: DataTypes.BIGINT, field: 'CurrencyCodeId' },
            DenominationId: { type: DataTypes.BIGINT, field: 'DenominationId' },
            DenominationCode: { type: DataTypes.STRING, field: 'DenominationCode' },
            DenominationName: { type: DataTypes.STRING, field: 'DenominationName' },
            DenominationValue: { type: DataTypes.DECIMAL, field: 'DenominationValue' },
            DenominationCount: { type: DataTypes.INTEGER, field: 'DenominationCount' },
            DenominationTotal: { type: DataTypes.DECIMAL, field: 'DenominationTotal' },
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
                tableName: 'userbillingcounterdenominations',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (UserBillingCounterDenominations as any).associate = function (models: Models) {
        UserBillingCounterDenominations.belongsTo(models.ReferenceValue, { as: 'CurrencyCode', targetKey: 'ReferenceValueCodeId' });
        UserBillingCounterDenominations.belongsTo(models.ReferenceValue, { as: 'Denomination', targetKey: 'ReferenceValueCodeId' });
    };
    return UserBillingCounterDenominations;
}
