import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ExternalprovidersInstance, i.ExternalprovidersAttributes> {
    let Externalproviders = sequelize.define<i.ExternalprovidersInstance, i.ExternalprovidersAttributes>('Externalproviders', {
        Id: { type: DataTypes.BIGINT, field: 'ExtPrvId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ExternalprovidersId: { type: DataTypes.BIGINT, field: 'ExternalprovidersId' },
        TestmasterId: { type: DataTypes.BIGINT, field: 'TestmasterId' },
        AliasCode: { type: DataTypes.STRING, field: 'AliasCode' },
        AliasName: { type: DataTypes.STRING, field: 'AliasName' },
        UCP: { type: DataTypes.STRING, field: 'UCP' },
        ResultReleaseDate: { type: DataTypes.DATE, field: 'ResultReleaseDate' },
        IsAttachementRequired: { type: DataTypes.INTEGER, field: 'IsAttachementRequired' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        OtherCost: { type: DataTypes.STRING, field: 'OtherCost' },
        Activefrom: { type: DataTypes.DATE, field: 'Activefrom' },
        Activeto: { type: DataTypes.DATE, field: 'Activeto' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'externalproviders',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Externalproviders as any).associate = function(models: Models) {
                    Externalproviders.belongsTo(models.Department, { as: 'Department', foreignKey: 'ExternalprovidersId' });
                    Externalproviders.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return Externalproviders;
}
