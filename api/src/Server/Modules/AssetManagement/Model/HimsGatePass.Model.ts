import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GatePassInstance, i.GatePassAttributes> {
    let GatePass = sequelize.define<i.GatePassInstance, i.GatePassAttributes>('GatePass', {
        Id: { type: DataTypes.BIGINT, field: 'GatePassId', primaryKey: true, autoIncrement: true },
        GatePassNo: { type: DataTypes.STRING, field: 'GatePassNo' },
        GatePassTypeId: { type: DataTypes.BIGINT, field: 'GatePassTypeId' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        AssetTypeId: { type: DataTypes.BIGINT, field: 'AssetTypeId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        SerialNo: { type: DataTypes.STRING, field: 'SerialNo' },
        ModelNo: { type: DataTypes.STRING, field: 'ModelNo' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        VendorId: { type: DataTypes.BIGINT, field: 'VendorId' },
        GatePassPurpose: { type: DataTypes.STRING, field: 'GatePassPurpose' },
        GatePassDate: { type: DataTypes.DATE, field: 'GatePassDate' },
        DispatchedTypeId: { type: DataTypes.BIGINT, field: 'DispatchedTypeId' },
        DisposedBy: { type: DataTypes.BIGINT, field: 'DisposedBy' },
        ApprovedBy: { type: DataTypes.BIGINT, field: 'ApprovedBy' },
        GatePassStatusId: { type: DataTypes.BIGINT, field: 'GatePassStatusId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'hims_gatepass',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (GatePass as any).associate = function (models: Models) {
        GatePass.belongsTo(models.ReferenceValue,
            { foreignKey: 'GatePassTypeId', as: 'GatePassType', targetKey: 'ReferenceValueCodeId' });
        GatePass.belongsTo(models.ReferenceValue,
            { foreignKey: 'DispatchedTypeId', as: 'DispatchedType', targetKey: 'ReferenceValueCodeId' });
        GatePass.belongsTo(models.ReferenceValue,
            { foreignKey: 'GatePassStatusId', as: 'GatePassStatus', targetKey: 'ReferenceValueCodeId' });
        GatePass.belongsTo(models.Asset, { foreignKey: 'AssetId' });
        GatePass.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        GatePass.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        GatePass.belongsTo(models.User, { as: 'DisposedUser', foreignKey: 'DisposedBy' });
        GatePass.belongsTo(models.VendorMaster, { foreignKey: 'VendorId' });
        GatePass.belongsTo(models.Department, { foreignKey: 'DepartmentId' });

    };
    return GatePass;
}
