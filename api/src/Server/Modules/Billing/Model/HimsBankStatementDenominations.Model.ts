import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BankStatementDenominationsInstance, i.BankStatementDenominationsAttributes> {
    let BankStatementDenominations = sequelize.define<i.BankStatementDenominationsInstance,
     i.BankStatementDenominationsAttributes>('BankStatementDenominations', {
            Id: { type: DataTypes.BIGINT, field: 'BankStatementDenominationId', primaryKey: true, autoIncrement: true },
            BankStatementId: { type: DataTypes.BIGINT, field: 'BankStatementId' },
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
                tableName: 'bankstatementdenominations',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (BankStatementDenominations as any).associate = function (models: Models) {
        BankStatementDenominations.belongsTo(models.ReferenceValue, { as: 'CurrencyCode', targetKey: 'ReferenceValueCodeId' });
        BankStatementDenominations.belongsTo(models.ReferenceValue, { as: 'Denomination', targetKey: 'ReferenceValueCodeId' });
    };
    return BankStatementDenominations;
}
