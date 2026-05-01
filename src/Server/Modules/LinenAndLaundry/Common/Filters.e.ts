export enum LinenItemMasterFilters {
    Id,
    Code,
    Name,
    LinenTypeId,
    LinenCategoryId,
    ActiveStatusId,
    DepartmentId
}
export enum LinenStockTransferFilters {
    Id,
    FromDepartmentId,
    LinenStockTransferNo,
    LinenStockTransferDate,
    From,
    To,
    LinenStockTransferStatusId,
    ToDepartmentId

}
export enum LinenStockTransferDetailFilters {
    Id,
    LinenStockTransferId
}
export enum LinenStockEntryFilters {
    Id,
    LinenStockEntryNumber,
    DepartmentId,
    LinenStockEntryStatusId,
    EnteredDate,
    From,
    To
}
export enum LinenStockEntryDetailFilters {
    Id,
    LinenStockEntryId,
    LinenItemMasterId
}
export enum LinenStockItemsFilters {
    Id,
    DepartmentId,
    LinenItemMasterId
}

