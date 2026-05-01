export enum CostDetailFilters {
    Id,
    DepartmentId,//1
    ActiveStatus,//2
    FacilityId,//3
    ItemName,//4
}
export enum LabourCostFilters {
    Id,
    CostDetailId,
	FacilityId
}
export enum ConsumablesFilters {
    Id,
    CostDetailId,
	FacilityId
}
export enum NotionalRentFilters {
    Id,
    CostDetailId,
	 FacilityId
}
export enum PowerCostFilters {
    Id,
    CostDetailId,
	FacilityId
}
export enum RadiationBatchesFilters {
    Id,
    CostDetailId,
}
export enum StatisticsFilters {
    Id,
    CostDetailId,
}
export enum DepreciationFilters {
    Id,
    CostDetailId,
}
