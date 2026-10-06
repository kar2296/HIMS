import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BankStatementDetailsInstance, i.BankStatementDetailsAttributes> {
    let BankStatementDetails = sequelize.define<i.BankStatementDetailsInstance,
        i.BankStatementDetailsAttributes>('BankStatementDetails', {
            Id: { type: DataTypes.BIGINT, field: 'BankStatementDetailId', primaryKey: true, autoIncrement: true },
            BankStatementId: { type: DataTypes.BIGINT, field: 'BankStatementId' },
            Name: { type: DataTypes.STRING, field: 'Name' },
            UserId: { type: DataTypes.BIGINT, field: 'UserId' },
            Cash: { type: DataTypes.DECIMAL, field: 'Cash' },
            Card: { type: DataTypes.DECIMAL, field: 'Card' },
            Others: { type: DataTypes.DECIMAL, field: 'Others' },
            LHRC: { type: DataTypes.DECIMAL, field: 'LHRC' },
            Voucher: { type: DataTypes.DECIMAL, field: 'Voucher' },
            NetCash: { type: DataTypes.DECIMAL, field: 'NetCash' },
            ExcessShort: { type: DataTypes.DECIMAL, field: 'ExcessShort' },
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
                tableName: 'bankstatementdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (BankStatementDetails as any).associate = function (models: Models) {
        BankStatementDetails.belongsTo(models.User, { as: 'CollectionUser', foreignKey: 'UserId' });
    };
    return BankStatementDetails;
}
