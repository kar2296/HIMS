import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VendorErpMapInstance, i.VendorErpMapAttributes> {
    let VendorErpMap = sequelize.define<i.VendorErpMapInstance, i.VendorErpMapAttributes>('VendorErpMap', {
        Id: { type: DataTypes.BIGINT, field: 'VendorErpMapId', primaryKey: true, autoIncrement: true },
        VendorFacilityMapId: { type: DataTypes.BIGINT, field: 'VendorFacilityMapId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorCode: { type: DataTypes.STRING, field: 'VendorCode' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        ErpAccountTypeId: { type: DataTypes.BIGINT, field: 'ErpAccountTypeId' },
        ErpSubAccountTypeId: { type: DataTypes.BIGINT, field: 'ErpSubAccountTypeId' },
        ErpGLClassTypeId: { type: DataTypes.BIGINT, field: 'ErpGLClassTypeId' },
        ErpGLClassName: { type: DataTypes.STRING, field: 'ErpGLClassName' },
        ErpCreditAccountNo: { type: DataTypes.STRING, field: 'ErpCreditAccountNo' },
        ErpDebitAccountNo: { type: DataTypes.STRING, field: 'ErpDebitAccountNo' },
        BankId: { type: DataTypes.BIGINT, field: 'BankId' },
        BankAccountNo: { type: DataTypes.STRING, field: 'BankAccountNo' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'Createdby' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'Updatedby' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'vendorerpmap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VendorErpMap as any).associate = function (models: Models) {
        VendorErpMap.belongsTo(models.ReferenceValue, { as: 'ErpAccountType', targetKey: 'ReferenceValueCodeId' });
        VendorErpMap.belongsTo(models.ReferenceValue, { as: 'ErpSubAccountType', targetKey: 'ReferenceValueCodeId' });
        VendorErpMap.belongsTo(models.ReferenceValue, { as: 'ErpGLClassType', targetKey: 'ReferenceValueCodeId' });
        VendorErpMap.belongsTo(models.ReferenceValue, { as: 'Bank', targetKey: 'ReferenceValueCodeId' });
    };
    return VendorErpMap;
}
