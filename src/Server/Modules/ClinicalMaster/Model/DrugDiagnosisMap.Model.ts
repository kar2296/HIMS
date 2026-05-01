import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DrugDiagnosisMapInstance, i.DrugDiagnosisMapAttributes> {
    let DrugDiagnosisMap = sequelize.define<i.DrugDiagnosisMapInstance, i.DrugDiagnosisMapAttributes>('DrugDiagnosisMap', {
        DrugId: { type: DataTypes.BIGINT, field: 'DrugId', primaryKey: true },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId', primaryKey: true },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'drugdiagnosismap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

    (DrugDiagnosisMap as any).equalComparer = function (current: i.DrugDiagnosisMapAttributes,
        other: i.DrugDiagnosisMapAttributes): boolean {
        /*
        equalComparer: (current: i.DrugDiagnosisMapAttributes,
                other: i.DrugDiagnosisMapAttributes): boolean => {
                return current &&
                    other &&
                    current.DrugId === other.DrugId &&
                    current.DiagnosisId === other.DiagnosisId;
            }
            */
        return (current &&
            other &&
            current.DrugId === other.DrugId &&
            current.DiagnosisId === other.DiagnosisId);

    };

    return DrugDiagnosisMap;
}
