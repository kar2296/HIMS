import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PrescriptionPadInstance, i.PrescriptionPadAttributes> {
    let PrescriptionPad = sequelize.define<i.PrescriptionPadInstance, i.PrescriptionPadAttributes>('PrescriptionPad', {
        Id: { type: DataTypes.BIGINT, field: 'PrescriptionPadId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        PrescribedOn: { type: DataTypes.DATE, field: 'PrescribedOn' },
        PrescriptionTypeId: { type: DataTypes.BIGINT, field: 'PrescriptionTypeId' },
        PrescriptionSheet: { type: DataTypes.STRING, field: 'PrescriptionSheet' },
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
            tableName: 'hims_prescriptionpad',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PrescriptionPad as any).associate = function (models: Models) {
        PrescriptionPad.belongsTo(models.ReferenceValue, { as: 'PrescriptionType', targetKey: 'ReferenceValueCodeId' });
        PrescriptionPad.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });

    };
    return PrescriptionPad;
}
