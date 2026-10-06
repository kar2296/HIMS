import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PhysiotheraphyTreatementInstance, i.PhysiotheraphyTreatementAttributes> {
    let PhysiotheraphyTreatement = sequelize.define<i.PhysiotheraphyTreatementInstance,
        i.PhysiotheraphyTreatementAttributes>('PhysiotheraphyTreatement', {
            Id: { type: DataTypes.BIGINT, field: 'PhysiotheraphyId', primaryKey: true, autoIncrement: true },
            PhysiotheraphyDate: { type: DataTypes.DATE, field: 'PhysiotheraphyDate' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            TreatementModalityId: { type: DataTypes.INTEGER, field: 'TreatementModalityId' },
            ClinicNotes: { type: DataTypes.STRING, field: 'ClinicNotes' },
            ModalityName: { type: DataTypes.STRING, field: 'ModalityName' },
            PhysiotherapistName: { type: DataTypes.STRING, field: 'PhysiotherapistName' },
            StartTime: { type: DataTypes.TIME, field: 'StartTime' },
            EndTime: { type: DataTypes.TIME, field: 'EndTime' },
            Duration: { type: DataTypes.STRING, field: 'Duration' },
            BP: { type: DataTypes.STRING, field: 'BP' },
            RBSFBS: { type: DataTypes.STRING, field: 'RBSFBS' },
            Signature: { type: DataTypes.STRING, field: 'Signature' },
            PhysiotheraphyStatusId: { type: DataTypes.BIGINT, field: 'PhysiotheraphyStatusId' },
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
                tableName: 'physiotheraphytreatment',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PhysiotheraphyTreatement as any).associate = function (models: Models) {
        PhysiotheraphyTreatement.belongsTo(models.ReferenceValue, { as: 'PhysiotheraphyStatus', targetKey: 'ReferenceValueCodeId' });
        PhysiotheraphyTreatement.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PhysiotheraphyTreatement.belongsTo(models.TreatementModality, { foreignKey: 'TreatementModalityId' });

    };
    return PhysiotheraphyTreatement;
}
