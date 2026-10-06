import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LensPrescriptionInstance, i.LensPrescriptionAttributes> {
    let LensPrescription = sequelize.define<i.LensPrescriptionInstance, i.
        LensPrescriptionAttributes>('LensPrescription', {
            Id: { type: DataTypes.BIGINT, field: 'LensPrescriptionId', primaryKey: true, autoIncrement: true },
            LensIdentifier: { type: DataTypes.STRING, field: 'LensIdentifier' },
            LensPrescriptionDate: { type: DataTypes.DATE, field: 'LensPrescriptionDate' },
            PrescriptionId: { type: DataTypes.BIGINT, field: 'PrescriptionId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            LeftDistanceSph: { type: DataTypes.STRING, field: 'LeftDistanceSph' },
            LeftReadingSph: { type: DataTypes.STRING, field: 'LeftReadingSph' },
            LeftDistanceCyl: { type: DataTypes.STRING, field: 'LeftDistanceCyl' },
            LeftReadingCyl: { type: DataTypes.STRING, field: 'LeftReadingCyl' },
            LeftDistanceAxis: { type: DataTypes.STRING, field: 'LeftDistanceAxis' },
            LeftReadingAxis: { type: DataTypes.STRING, field: 'LeftReadingAxis' },
            LeftDistancePrism: { type: DataTypes.STRING, field: 'LeftDistancePrism' },
            LeftReadingPrism: { type: DataTypes.STRING, field: 'LeftReadingPrism' },
            LeftDistanceBase: { type: DataTypes.STRING, field: 'LeftDistanceBase' },
            LeftReadingBase: { type: DataTypes.STRING, field: 'LeftReadingBase' },
            LeftAdd: { type: DataTypes.STRING, field: 'LeftAdd' },
            LeftDec: { type: DataTypes.STRING, field: 'LeftDec' },
            RightDistanceSph: { type: DataTypes.STRING, field: 'RightDistanceSph' },
            RightReadingSph: { type: DataTypes.STRING, field: 'RightReadingSph' },
            RightDistanceCyl: { type: DataTypes.STRING, field: 'RightDistanceCyl' },
            RightReadingCyl: { type: DataTypes.STRING, field: 'RightReadingCyl' },
            RightDistanceAxis: { type: DataTypes.STRING, field: 'RightDistanceAxis' },
            RightReadingAxis: { type: DataTypes.STRING, field: 'RightReadingAxis' },
            RightDistancePrism: { type: DataTypes.STRING, field: 'RightDistancePrism' },
            RightReadingPrism: { type: DataTypes.STRING, field: 'RightReadingPrism' },
            RightDistanceBase: { type: DataTypes.STRING, field: 'RightDistanceBase' },
            RightReadingBase: { type: DataTypes.STRING, field: 'RightReadingBase' },
            RightAdd: { type: DataTypes.STRING, field: 'RightAdd' },
            RightDec: { type: DataTypes.STRING, field: 'RightDec' },
            LensForm: { type: DataTypes.STRING, field: 'LensForm' },
            LensTint: { type: DataTypes.STRING, field: 'LensTint' },
            TypeOfLens: { type: DataTypes.STRING, field: 'TypeOfLens' },
            SegDetails: { type: DataTypes.STRING, field: 'SegDetails' },
            LensSize: { type: DataTypes.DECIMAL, field: 'LensSize' },
            LensShape: { type: DataTypes.STRING, field: 'LensShape' },
            DistanceCentres: { type: DataTypes.STRING, field: 'DistanceCentres' },
            NearCentres: { type: DataTypes.STRING, field: 'NearCentres' },
            Instructions: { type: DataTypes.STRING, field: 'Instructions' },
            LensPrescriptionStatusId: { type: DataTypes.BIGINT, field: 'LensPrescriptionStatusId' },
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
            tableName: 'lensprescription',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (LensPrescription as any).associate = function (models: Models) {
        LensPrescription.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        LensPrescription.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        LensPrescription.belongsTo(models.Department);
        LensPrescription.belongsTo(models.Patient);
        LensPrescription.belongsTo(models.ReferenceValue, { as: 'LensPrescriptionStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return LensPrescription;
}
