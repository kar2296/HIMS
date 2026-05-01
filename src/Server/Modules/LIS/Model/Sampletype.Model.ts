import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SampletypeInstance, i.SampletypeAttributes> {
    let Sampletype = sequelize.define<i.SampletypeInstance, i.SampletypeAttributes>('Sampletype', {
        Id: { type: DataTypes.BIGINT, field: 'SampletypeId', primaryKey: true, autoIncrement: true },
        // Add virtual field for SampleTypeId that references the same database field
        SampleTypeId: {
            type: DataTypes.VIRTUAL,
            get: function() {
                return this.getDataValue('Id');
            },
            set: function(value: any) {
                this.setDataValue('Id', value);
            }
        },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Mnemonics: { type: DataTypes.STRING, field: 'Mnemonics' },
        SAMPLETYPId: { type: DataTypes.BIGINT, field: 'SAMPLETYPId' },
        Volume: { type: DataTypes.INTEGER, field: 'Volume' },
        SampleUnitsId: { type: DataTypes.INTEGER, field: 'SampleUnitsId' },
        StorageInst: { type: DataTypes.STRING, field: 'StorageInst' },
        OtherInst: { type: DataTypes.STRING, field: 'OtherInst' },
        ExpDys: { type: DataTypes.INTEGER, field: 'ExpDys' },
        CollectionSiteId: { type: DataTypes.INTEGER, field: 'CollectionSiteId' },
        CollectionMethodId: { type: DataTypes.INTEGER, field: 'CollectionMethodId' },
        CollectionRouteId: { type: DataTypes.INTEGER, field: 'CollectionRouteId' },
        ContainerTypeId: { type: DataTypes.BIGINT, field: 'ContainerTypeId' },
        Reflink: { type: DataTypes.STRING, field: 'Reflink' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        Ext_DID: { type: DataTypes.STRING, field: 'Ext_DID' },
        GENERICINDId: { type: DataTypes.BIGINT, field: 'GENERICINDId' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsMicro: { type: DataTypes.BOOLEAN, field: 'IsMicro' },
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
            tableName: 'sampletype',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Sampletype as any).associate = function(models: any) {
        Sampletype.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        Sampletype.belongsTo(models.ReferenceValue, { as: 'SAMPLETYP', targetKey: 'ReferenceValueCodeId' });
        Sampletype.belongsTo(models.ReferenceValue, { as: 'GENERICIND', targetKey: 'ReferenceValueCodeId' });
        Sampletype.belongsTo(models.ReferenceValue, { as: 'CollectionSite', targetKey: 'ReferenceValueCodeId' });
        Sampletype.belongsTo(models.ReferenceValue, { as: 'CollectionMethod', targetKey: 'ReferenceValueCodeId' });
        Sampletype.belongsTo(models.ReferenceValue, { as: 'CollectionRoute', targetKey: 'ReferenceValueCodeId' });
        Sampletype.belongsTo(models.ReferenceValue, { as: 'SampleUnits', targetKey: 'ReferenceValueCodeId' });
    };

    return Sampletype as SequelizeStatic.Model<i.SampletypeInstance, i.SampletypeAttributes>;
}

