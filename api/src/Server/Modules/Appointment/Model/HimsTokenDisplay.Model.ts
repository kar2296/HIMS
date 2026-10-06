import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TokenDisplayInstance, i.TokenDisplayAttributes> {
    let TokenDisplay = sequelize.define<i.TokenDisplayInstance, i.TokenDisplayAttributes>('TokenDisplay', {
        Id: { type: DataTypes.BIGINT, field: 'TokenDisplayId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        TokenNo: { type: DataTypes.STRING, field: 'TokenNo' },
        RoomNo: { type: DataTypes.STRING, field: 'RoomNo' },
        TokenStatusId: { type: DataTypes.BIGINT, field: 'TokenStatusId' },
        PatientOrderId: { type: DataTypes.BIGINT, field: 'PatientOrderId' },
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
            tableName: 'tokendisplay',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (TokenDisplay as any).associate = function(models: Models) {
                    TokenDisplay.belongsTo(models.Patient);
                    TokenDisplay.belongsTo(models.Department);
                    // TokenDisplay.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
                    TokenDisplay.belongsTo(models.ReferenceValue, { as: 'TokenStatus', targetKey: 'ReferenceValueCodeId' });

                };
 return TokenDisplay;
}
