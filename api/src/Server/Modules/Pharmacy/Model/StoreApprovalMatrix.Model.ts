import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StoreApprovalMatrixInstance, i.StoreApprovalMatrixAttributes> {
    let StoreApprovalMatrix =
        sequelize.define<i.StoreApprovalMatrixInstance, i.StoreApprovalMatrixAttributes>('StoreApprovalMatrix', {
            Id: { type: DataTypes.BIGINT, field: 'StoreApprovalMatrixId', primaryKey: true, autoIncrement: true },
            StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            PoTypeId: { type: DataTypes.BIGINT, field: 'PoTypeId' },
            UserTypeId: { type: DataTypes.BIGINT, field: 'UserTypeId' },
            UserId: { type: DataTypes.BIGINT, field: 'UserId' },
            PoStatusId: { type: DataTypes.BIGINT, field: 'PoStatusId' },
            IsFinalApprover: { type: DataTypes.BOOLEAN, field: 'IsFinalApprover' },
            MinPoValue: { type: DataTypes.DECIMAL, field: 'MinPoValue' },
            MaxPoValue: { type: DataTypes.DECIMAL, field: 'MaxPoValue' },
            ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
            ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'storeapprovalmatrix',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

     (StoreApprovalMatrix as any).associate = function(models: Models) {
                        StoreApprovalMatrix.belongsTo(models.User);
                        StoreApprovalMatrix.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
                        StoreApprovalMatrix.belongsTo(models.Facility);
                        StoreApprovalMatrix.belongsTo(models.ReferenceValue, { as: 'UserType', targetKey: 'ReferenceValueCodeId' });
                        StoreApprovalMatrix.belongsTo(models.ReferenceValue, { as: 'PoType', targetKey: 'ReferenceValueCodeId' });
                        StoreApprovalMatrix.belongsTo(models.ReferenceValue, { as: 'PoStatus', targetKey: 'ReferenceValueCodeId' });
                    };
 return StoreApprovalMatrix;
}
