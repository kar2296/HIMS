import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemStoreMapInstance, i.ItemStoreMapAttributes> {
    let ItemStoreMap = sequelize.define<i.ItemStoreMapInstance, i.ItemStoreMapAttributes>('ItemStoreMap', {
        Id: { type: DataTypes.BIGINT, field: 'ItemStoreMapId', primaryKey: true, autoIncrement: true },
        ItemFacilityMapId: { type: DataTypes.BIGINT, field: 'ItemFacilityMapId', primaryKey: true },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId', primaryKey: true },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId', primaryKey: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId', primaryKey: true },
        RackId: { type: DataTypes.BIGINT, field: 'RackId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        SubProductTypeId: { type: DataTypes.BIGINT, field: 'SubProductTypeId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        StoreCode: { type: DataTypes.STRING, field: 'StoreCode' },
        FacilityCode: { type: DataTypes.STRING, field: 'FacilityCode' },
        RackCode: { type: DataTypes.STRING, field: 'RackCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        FacilityName: { type: DataTypes.STRING, field: 'FacilityName' },
        RackName: { type: DataTypes.STRING, field: 'RackName' },
        Self: { type: DataTypes.STRING, field: 'Self' },
        Tray: { type: DataTypes.STRING, field: 'Tray' },
        MinQty: { type: DataTypes.INTEGER, field: 'MinQty' },
        MaxQty: { type: DataTypes.INTEGER, field: 'MaxQty' },
        ROLQty: { type: DataTypes.INTEGER, field: 'ROLQty' },
        LeadTime: { type: DataTypes.INTEGER, field: 'LeadTime' },
        MaxForeCast: { type: DataTypes.INTEGER, field: 'MaxForeCast' },
        FactorOnUnReliable: { type: DataTypes.INTEGER, field: 'FactorOnUnReliable' },
        TargetInventory: { type: DataTypes.INTEGER, field: 'TargetInventory' },
        BReT: { type: DataTypes.INTEGER, field: 'BReT' },
        OLT: { type: DataTypes.INTEGER, field: 'OLT' },
        PLT: { type: DataTypes.INTEGER, field: 'PLT' },
        TLT: { type: DataTypes.INTEGER, field: 'TLT' },
        SLT: { type: DataTypes.INTEGER, field: 'SLT' },
        RT: { type: DataTypes.INTEGER, field: 'RT' },
        IsBillable: { type: DataTypes.BOOLEAN, field: 'IsBillable' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'itemstoremap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

    (ItemStoreMap as any).associate = function (models: Models) {
        ItemStoreMap.belongsTo(models.ItemFacilityMap, { foreignKey: 'ItemFacilityMapId' });
        ItemStoreMap.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        ItemStoreMap.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        ItemStoreMap.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    };
    return ItemStoreMap;
}
