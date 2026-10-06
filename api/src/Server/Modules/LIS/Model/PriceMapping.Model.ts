import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PriceMappingInstance, i.PriceMappingAttributes> {
    let PriceMapping = sequelize.define<i.PriceMappingInstance, i.PriceMappingAttributes>('PriceMapping', {
        Id: { type: DataTypes.BIGINT, field: 'ExternalProviderPriceId', primaryKey: true, autoIncrement: true },
        ExternalProviderId: { type: DataTypes.BIGINT, field: 'ExternalProviderId' },
        TestId: { type: DataTypes.BIGINT, field: 'TestId' },
        TestCode: { type: DataTypes.STRING, field: 'TestCode' },
        TestName: { type: DataTypes.STRING, field: 'TestName' },
        TESTMASTERTYPId: { type: DataTypes.BIGINT, field: 'TESTMASTERTYPId' },
        AliasCode: { type: DataTypes.STRING, field: 'AliasCode' },
        AliasName: { type: DataTypes.STRING, field: 'AliasName' },
        ProviderName: { type: DataTypes.STRING, field: 'ProviderName' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        UCP: { type: DataTypes.STRING, field: 'UCP' },
        ResultReleaseDate: { type: DataTypes.DATE, field: 'ResultReleaseDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        OtherCost: { type: DataTypes.DECIMAL, field: 'OtherCost' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
        Price: { type: DataTypes.DECIMAL, field: 'Price' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        IsAttachementRequired: { type: DataTypes.BOOLEAN, field: 'IsAttachementRequired' },
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
            tableName: 'externalproviderprice',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PriceMapping as any).associate = function(models: Models) {
                    PriceMapping.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    PriceMapping.belongsTo(models.ReferenceValue,
                        { as: 'TESTMASTERTYP', foreignKey: 'TESTMASTERTYPId', targetKey: 'ReferenceValueCodeId' });
                    PriceMapping.belongsTo(models.Testmaster, { foreignKey: 'TestId' });
                };
 return PriceMapping;
}
