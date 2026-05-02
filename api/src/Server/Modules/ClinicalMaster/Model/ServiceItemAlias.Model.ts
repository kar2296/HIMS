import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceItemAliasInstance, i.ServiceItemAliasAttributes> {
    let ServiceItemAlias = sequelize.define<i.ServiceItemAliasInstance, i.ServiceItemAliasAttributes>('ServiceItemAlias', {
        Id: { type: DataTypes.BIGINT, field: 'ServiceItemAliasId', primaryKey: true, autoIncrement: true },
        ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
        AliasTypeId: { type: DataTypes.BIGINT, field: 'AliasTypeId' },
        ExternalProviderId: { type: DataTypes.BIGINT, field: 'ExternalProviderId' },
        AliasId: { type: DataTypes.STRING, field: 'AliasId' },
        AliasName: { type: DataTypes.STRING, field: 'AliasName' },
        GroupId: { type: DataTypes.BIGINT, field: 'GroupId' },
        IsSupplementary: { type: DataTypes.BOOLEAN, field: 'IsSupplementary' },
        Surcharge: { type: DataTypes.STRING, field: 'Surcharge' },
        Discount: { type: DataTypes.STRING, field: 'Discount' },
        StatusId: { type: DataTypes.BOOLEAN, field: 'StatusId' },
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
            tableName: 'serviceitemalias',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return ServiceItemAlias;
}
