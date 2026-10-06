import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';

export interface UserListItem {
  Id: number;
  FirstName: string;
  LastName?: string;
  MiddleName?: string;
  UserName: string;
  Email?: string;
  Mobile?: string;
  GenderId?: number;
  UserTypeId?: number;
  UserGroupId?: number;
  ActiveStatusId?: number;
  IsProfile?: boolean;
  Title?: {
    Id: number;
    Description: string;
  };
  Gender?: {
    Id: number;
    Description: string;
  };
  UserType?: {
    Id: number;
    Description: string;
  };
  Group?: {
    Id: number;
    GroupName: string;
  };
  UserDept?: {
    Id: number;
    DepartmentName: string;
  };
  ActiveStatus?: {
    Id: number;
    Description: string;
  };
  Facility?: {
    Id: number;
    FacilityName: string;
  };
  Organization?: {
    Id: number;
    OrgName: string;
  };
  Speciality?: {
    Id: number;
    SpecialityName: string;
  };
  ClinicalRole?: {
    Id: number;
    Description: string;
  };
  [key: string]: any;
}

export interface UsersListScreenProps {
  reactProps?: {
    items?: UserListItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      UserType?: Array<{ Id: number; Text: string }>;
      Department?: Array<{ Id: number; Text: string }>;
      Group?: Array<{ Id: number; Text: string }>;
      ActiveStatus?: Array<{ Id: number; Text: string }>;
      Facility?: Array<{ Id: number; Text: string }>;
      Organization?: Array<{ Id: number; Text: string }>;
      Speciality?: Array<{ Id: number; Text: string }>;
      clinicalrole?: Array<{ Id: number; Text: string }>;
      DoctorShareClass?: Array<{ Id: number; Text: string }>;
      Gender?: Array<{ Id: number; Text: string }>;
      Country?: Array<{ Id: number; Text: string }>;
      State?: Array<{ Id: number; Text: string }>;
      City?: Array<{ Id: number; Text: string }>;
      Pincode?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    currentfilter?: {
      username?: string;
      usertypeid?: number;
      DepartmentId?: number;
      groupid?: number;
      ActiveStatusId?: number;
      facilityid?: number;
    };
    advancedfilter?: Record<string, any>;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const UsersListScreen: React.FC<UsersListScreenProps> = ({ reactProps, onAction }) => {
  const isBridged = Boolean(onAction || (reactProps && reactProps.items !== undefined));

  // Quick Filter States
  const [username, setUsername] = useState<string>(reactProps?.currentfilter?.username || '');
  const [searchQuery, setSearchQuery] = useState<string>(reactProps?.currentfilter?.username || '');
  const [userTypeId, setUserTypeId] = useState<number>(reactProps?.currentfilter?.usertypeid ?? -1);
  const [departmentId, setDepartmentId] = useState<number>(reactProps?.currentfilter?.DepartmentId ?? -1);
  const [groupId, setGroupId] = useState<number>(reactProps?.currentfilter?.groupid ?? -1);
  const [activeStatusId, setActiveStatusId] = useState<number>(reactProps?.currentfilter?.ActiveStatusId ?? 2);
  const [facilityId, setFacilityId] = useState<number>(reactProps?.currentfilter?.facilityid ?? -1);

  // Advanced Filter Modal & Values
  const [showAdvFilter, setShowAdvFilter] = useState<boolean>(false);
  const [advOrgId, setAdvOrgId] = useState<number>(-1);
  const [advSpecialityId, setAdvSpecialityId] = useState<number>(-1);
  const [advClinicalRoleId, setAdvClinicalRoleId] = useState<number>(-1);
  const [advDoctorShareClassId, setAdvDoctorShareClassId] = useState<number>(-1);
  const [advGenderId, setAdvGenderId] = useState<number>(-1);
  const [advMobile, setAdvMobile] = useState<string>('');
  const [advArea, setAdvArea] = useState<string>('');
  const [advCountryId, setAdvCountryId] = useState<number>(-1);
  const [advStateId, setAdvStateId] = useState<number>(-1);
  const [advCityId, setAdvCityId] = useState<number>(-1);
  const [advPincodeId, setAdvPincodeId] = useState<number>(-1);

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState<number>(reactProps?.pageSize || 25);
  const [totalItems, setTotalItems] = useState<number>(reactProps?.totalItems || 0);

  // Data & Request States
  const [items, setItems] = useState<UserListItem[]>(reactProps?.items || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lookups
  const [userTypeOptions, setUserTypeOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.UserType || []
  );
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.Department || []
  );
  const [groupOptions, setGroupOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.Group || []
  );
  const [activeStatusOptions, setActiveStatusOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.ActiveStatus || []
  );
  const [facilityOptions, setFacilityOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.Facility || []
  );
  const [orgOptions, setOrgOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.Organization || []
  );
  const [specialityOptions, setSpecialityOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.Speciality || []
  );
  const [clinicalRoleOptions, setClinicalRoleOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.clinicalrole || []
  );
  const [doctorShareOptions, setDoctorShareOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.DoctorShareClass || []
  );
  const [genderOptions, setGenderOptions] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.Gender || []
  );

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    item: UserListItem | null;
  }>({
    isOpen: false,
    item: null
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Synchronize incoming bridged reactProps
  useEffect(() => {
    if (reactProps) {
      if (reactProps.items !== undefined) setItems(reactProps.items);
      if (reactProps.totalItems !== undefined) setTotalItems(reactProps.totalItems);
      if (reactProps.currentPage !== undefined) setCurrentPage(reactProps.currentPage);
      if (reactProps.pageSize !== undefined) setPageSize(reactProps.pageSize);

      if (reactProps.lookup) {
        if (reactProps.lookup.UserType) setUserTypeOptions(reactProps.lookup.UserType);
        if (reactProps.lookup.Department) setDepartmentOptions(reactProps.lookup.Department);
        if (reactProps.lookup.Group) setGroupOptions(reactProps.lookup.Group);
        if (reactProps.lookup.ActiveStatus) setActiveStatusOptions(reactProps.lookup.ActiveStatus);
        if (reactProps.lookup.Facility) setFacilityOptions(reactProps.lookup.Facility);
        if (reactProps.lookup.Organization) setOrgOptions(reactProps.lookup.Organization);
        if (reactProps.lookup.Speciality) setSpecialityOptions(reactProps.lookup.Speciality);
        if (reactProps.lookup.clinicalrole) setClinicalRoleOptions(reactProps.lookup.clinicalrole);
        if (reactProps.lookup.DoctorShareClass) setDoctorShareOptions(reactProps.lookup.DoctorShareClass);
        if (reactProps.lookup.Gender) setGenderOptions(reactProps.lookup.Gender);
      }

      if (reactProps.currentfilter) {
        if (reactProps.currentfilter.username !== undefined) {
          setUsername(reactProps.currentfilter.username);
          setSearchQuery(reactProps.currentfilter.username);
        }
        if (reactProps.currentfilter.usertypeid !== undefined) setUserTypeId(reactProps.currentfilter.usertypeid);
        if (reactProps.currentfilter.DepartmentId !== undefined) setDepartmentId(reactProps.currentfilter.DepartmentId);
        if (reactProps.currentfilter.groupid !== undefined) setGroupId(reactProps.currentfilter.groupid);
        if (reactProps.currentfilter.ActiveStatusId !== undefined) setActiveStatusId(reactProps.currentfilter.ActiveStatusId);
        if (reactProps.currentfilter.facilityid !== undefined) setFacilityId(reactProps.currentfilter.facilityid);
      }
    }
  }, [reactProps]);

  // Load lookups in standalone mode
  useEffect(() => {
    if (isBridged) return;

    let isMounted = true;
    const fetchLookups = async () => {
      try {
        const lookupPayload = [
          { Key: 'Facility' },
          { Key: 'Organization' },
          { Key: 'Department' },
          { Key: 'Speciality' },
          { Key: 'clinicalrole' },
          { Key: 'DoctorShareClass' },
          { Key: 'UserType' },
          { Key: 'Group' },
          { Key: 'ActiveStatus' },
          { Key: 'Gender' }
        ];

        const res = await apiFetch<any>('General/Options/getoptions', lookupPayload);
        if (isMounted && res) {
          if (res.UserType) setUserTypeOptions(res.UserType);
          if (res.Department) setDepartmentOptions(res.Department);
          if (res.Group) setGroupOptions(res.Group);
          if (res.ActiveStatus) setActiveStatusOptions(res.ActiveStatus);
          if (res.Facility) setFacilityOptions(res.Facility);
          if (res.Organization) setOrgOptions(res.Organization);
          if (res.Speciality) setSpecialityOptions(res.Speciality);
          if (res.clinicalrole) setClinicalRoleOptions(res.clinicalrole);
          if (res.DoctorShareClass) setDoctorShareOptions(res.DoctorShareClass);
          if (res.Gender) setGenderOptions(res.Gender);
        }
      } catch (err) {
        console.error('Failed to load user lookups:', err);
      }
    };

    fetchLookups();

    return () => {
      isMounted = false;
    };
  }, [isBridged]);

  // Count active advanced filters
  const activeAdvFiltersCount = useMemo(() => {
    let count = 0;
    if (advOrgId > 0) count++;
    if (advSpecialityId > 0) count++;
    if (advClinicalRoleId > 0) count++;
    if (advDoctorShareClassId > 0) count++;
    if (advGenderId > 0) count++;
    if (advMobile.trim()) count++;
    if (advArea.trim()) count++;
    if (advCountryId > 0) count++;
    if (advStateId > 0) count++;
    if (advCityId > 0) count++;
    if (advPincodeId > 0) count++;
    return count;
  }, [
    advOrgId,
    advSpecialityId,
    advClinicalRoleId,
    advDoctorShareClassId,
    advGenderId,
    advMobile,
    advArea,
    advCountryId,
    advStateId,
    advCityId,
    advPincodeId
  ]);

  // Fetch Users List
  const fetchUsersList = useCallback(
    async (
      page: number = currentPage,
      size: number = pageSize,
      filtersOverride?: Partial<{
        username: string;
        userTypeId: number;
        departmentId: number;
        groupId: number;
        activeStatusId: number;
        facilityId: number;
      }>
    ) => {
      const qUser = filtersOverride?.username !== undefined ? filtersOverride.username : username;
      const qType = filtersOverride?.userTypeId !== undefined ? filtersOverride.userTypeId : userTypeId;
      const qDept = filtersOverride?.departmentId !== undefined ? filtersOverride.departmentId : departmentId;
      const qGroup = filtersOverride?.groupId !== undefined ? filtersOverride.groupId : groupId;
      const qStatus = filtersOverride?.activeStatusId !== undefined ? filtersOverride.activeStatusId : activeStatusId;
      const qFacility = filtersOverride?.facilityId !== undefined ? filtersOverride.facilityId : facilityId;

      if (isBridged && onAction) {
        onAction('filterChange', {
          currentfilter: {
            username: qUser,
            usertypeid: qType,
            DepartmentId: qDept,
            groupid: qGroup,
            ActiveStatusId: qStatus,
            facilityid: qFacility
          },
          advancedfilter: {
            OrgId: advOrgId,
            SpecialityId: advSpecialityId,
            ClinicalRoleId: advClinicalRoleId,
            DoctorShareClassId: advDoctorShareClassId,
            GenderId: advGenderId,
            Mobile: advMobile,
            Area: advArea,
            CountryId: advCountryId,
            StateId: advStateId,
            CityId: advCityId,
            PincodeId: advPincodeId
          },
          pageContext: {
            currentPage: page,
            pageSize: size
          }
        });
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const params: Array<{ Key: number; Value: any }> = [
          { Key: 1, Value: qUser || '' },
          { Key: 2, Value: qFacility > 0 ? qFacility : null },
          { Key: 3, Value: qType > 0 ? qType : null },
          { Key: 4, Value: qGroup > 0 ? qGroup : null },
          { Key: 5, Value: qStatus > 0 ? qStatus : null },
          { Key: 32, Value: 8 }, // Not a Patient
          { Key: 6, Value: advOrgId > 0 ? advOrgId : null },
          { Key: 7, Value: qDept > 0 ? qDept : null },
          { Key: 8, Value: advSpecialityId > 0 ? advSpecialityId : null },
          { Key: 9, Value: advClinicalRoleId > 0 ? advClinicalRoleId : null },
          { Key: 10, Value: advPincodeId > 0 ? advPincodeId : null },
          { Key: 11, Value: advCountryId > 0 ? advCountryId : null },
          { Key: 12, Value: advStateId > 0 ? advStateId : null },
          { Key: 13, Value: advCityId > 0 ? advCityId : null },
          { Key: 14, Value: advArea ? advArea : null },
          { Key: 15, Value: advDoctorShareClassId > 0 ? advDoctorShareClassId : null },
          { Key: 16, Value: advMobile ? advMobile : null },
          { Key: 17, Value: advGenderId > 0 ? advGenderId : null }
        ];

        const reqBody = {
          Params: params,
          PageContext: {
            PageSize: size,
            PageNumber: page
          }
        };

        const res = await apiFetch<any>('SystemSettings/user/GetUsers', reqBody);
        if (res) {
          setItems(res.Data || []);
          if (res.PageContext?.TotalRecords !== undefined) {
            setTotalItems(res.PageContext.TotalRecords);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setErrorMsg(err.message || 'Failed to fetch users list.');
      } finally {
        setLoading(false);
      }
    },
    [
      isBridged,
      onAction,
      username,
      userTypeId,
      departmentId,
      groupId,
      activeStatusId,
      facilityId,
      advOrgId,
      advSpecialityId,
      advClinicalRoleId,
      advDoctorShareClassId,
      advGenderId,
      advMobile,
      advArea,
      advCountryId,
      advStateId,
      advCityId,
      advPincodeId,
      currentPage,
      pageSize
    ]
  );

  // Trigger search on mount and filter changes in standalone mode
  useEffect(() => {
    if (!isBridged) {
      fetchUsersList(currentPage, pageSize);
    }
  }, [currentPage, pageSize, userTypeId, departmentId, groupId, activeStatusId, facilityId]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUsername(searchQuery);
    setCurrentPage(1);
    fetchUsersList(1, pageSize, { username: searchQuery });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setUsername('');
    setCurrentPage(1);
    fetchUsersList(1, pageSize, { username: '' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setUsername('');
    setUserTypeId(-1);
    setDepartmentId(-1);
    setGroupId(-1);
    setActiveStatusId(2);
    setAdvOrgId(-1);
    setAdvSpecialityId(-1);
    setAdvClinicalRoleId(-1);
    setAdvDoctorShareClassId(-1);
    setAdvGenderId(-1);
    setAdvMobile('');
    setAdvArea('');
    setAdvCountryId(-1);
    setAdvStateId(-1);
    setAdvCityId(-1);
    setAdvPincodeId(-1);
    setCurrentPage(1);

    fetchUsersList(1, pageSize, {
      username: '',
      userTypeId: -1,
      departmentId: -1,
      groupId: -1,
      activeStatusId: 2
    });
  };

  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    } else {
      window.location.hash = '#/app/usertab/0/general';
    }
  };

  const handleEdit = (user: UserListItem) => {
    if (onAction) {
      onAction('handleEvents', {
        actionType: 'edit',
        entity: user
      });
    } else {
      window.location.hash = `#/app/usertab/${user.Id}/general`;
    }
  };

  const handleDeleteClick = (user: UserListItem) => {
    setDeleteModalState({
      isOpen: true,
      item: user
    });
  };

  const handleConfirmDelete = async () => {
    const item = deleteModalState.item;
    if (!item) return;

    if (onAction) {
      onAction('handleEvents', {
        actionType: 'delete',
        entity: item
      });
      setDeleteModalState({ isOpen: false, item: null });
      return;
    }

    setIsDeleting(true);
    try {
      await apiFetch<any>('SystemSettings/user/DeleteUser', { Id: item.Id });
      setDeleteModalState({ isOpen: false, item: null });
      fetchUsersList(currentPage, pageSize);
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (isBridged && onAction) {
      onAction('getList', { page: newPage, pageSize });
    } else {
      fetchUsersList(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (isBridged && onAction) {
      onAction('getList', { page: 1, pageSize: newSize });
    } else {
      fetchUsersList(1, newSize);
    }
  };

  // Helper function to build user display name
  const getUserDisplayName = (user: UserListItem) => {
    const parts = [
      user.Title?.Description,
      user.FirstName,
      user.LastName
    ].filter(Boolean);
    return parts.join(' ') || user.UserName;
  };

  // Helper function to get role/type badge color
  const getUserTypeBadgeStyle = (typeDesc?: string) => {
    const desc = (typeDesc || '').toLowerCase();
    if (desc.includes('doc') || desc.includes('physician')) {
      return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
    }
    if (desc.includes('nurse')) {
      return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
    }
    if (desc.includes('admin') || desc.includes('manager')) {
      return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    }
    if (desc.includes('pharma')) {
      return { bg: '#f3e8ff', text: '#7c3aed', border: '#ddd6fe' };
    }
    return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
  };

  // Generate avatar initials
  const getInitials = (user: UserListItem) => {
    const first = (user.FirstName || user.UserName || 'U').charAt(0).toUpperCase();
    const last = user.LastName ? user.LastName.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
  };

  return (
    <div
      style={{
        backgroundColor: colors.background.primary,
        minHeight: '100%',
        padding: spacing.md,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        fontFamily: typography.fontFamily
      }}
    >
      {/* Top Banner / Navigation Card */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          backgroundColor: colors.background.secondary,
          padding: `${spacing.sm} ${spacing.md}`,
          borderRadius: radii.md,
          border: `1px solid ${colors.border.subtle}`,
          boxShadow: shadows.sm
        }}
      >
        {/* Title, Icon & Total Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.md,
              backgroundColor: 'rgba(37, 99, 235, 0.10)',
              color: colors.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}
          >
            <i className="fa fa-users" aria-hidden="true" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.semibold,
                  color: colors.text.primary
                }}
              >
                Users Management
              </h2>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  backgroundColor: colors.primaryLight,
                  color: colors.primary.main,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: typography.fontWeights.semibold
                }}
              >
                {totalItems} {totalItems === 1 ? 'User' : 'Users'}
              </span>
            </div>
            <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
              Configure hospital staff, doctor accounts, role memberships, and departmental assignments
            </span>
          </div>
        </div>

        {/* Quick Search & Add Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <i
              className="fa fa-search"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 10,
                color: colors.textMuted,
                fontSize: 13,
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name or Login..."
              style={{
                padding: '7px 28px 7px 30px',
                fontSize: typography.fontSizes.sm,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                outline: 'none',
                width: 220,
                transition: 'border-color 0.15s ease'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: 8,
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: 2
                }}
              >
                <i className="fa fa-times" />
              </button>
            )}
          </form>

          {/* Advanced Filter Button */}
          <button
            type="button"
            onClick={() => setShowAdvFilter(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.medium,
              borderRadius: radii.sm,
              border: `1px solid ${activeAdvFiltersCount > 0 ? colors.primary.main : colors.border.subtle}`,
              backgroundColor: activeAdvFiltersCount > 0 ? colors.primaryLight : colors.background.primary,
              color: activeAdvFiltersCount > 0 ? colors.primary.main : colors.text.secondary,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <i className="fa fa-sliders-h" />
            <span>Filters</span>
            {activeAdvFiltersCount > 0 && (
              <span
                style={{
                  backgroundColor: colors.primary.main,
                  color: '#fff',
                  borderRadius: radii.full,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 5px',
                  lineHeight: '12px'
                }}
              >
                {activeAdvFiltersCount}
              </span>
            )}
          </button>

          {/* Add User Button */}
          <button
            type="button"
            onClick={handleAddNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.semibold,
              borderRadius: radii.sm,
              border: 'none',
              backgroundColor: colors.primary.main,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: shadows.sm,
              transition: 'background-color 0.15s ease'
            }}
          >
            <i className="fa fa-plus" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          backgroundColor: colors.background.secondary,
          padding: `${spacing.xs} ${spacing.md}`,
          borderRadius: radii.md,
          border: `1px solid ${colors.border.subtle}`
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md }}>
          {/* User Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <label style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, fontWeight: typography.fontWeights.medium }}>
              User Type:
            </label>
            <select
              value={userTypeId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setUserTypeId(val);
                setCurrentPage(1);
                fetchUsersList(1, pageSize, { userTypeId: val });
              }}
              style={{
                fontSize: typography.fontSizes.sm,
                padding: '5px 8px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                outline: 'none',
                minWidth: 130
              }}
            >
              <option value={-1}>All Types</option>
              {userTypeOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <label style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, fontWeight: typography.fontWeights.medium }}>
              Department:
            </label>
            <select
              value={departmentId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDepartmentId(val);
                setCurrentPage(1);
                fetchUsersList(1, pageSize, { departmentId: val });
              }}
              style={{
                fontSize: typography.fontSizes.sm,
                padding: '5px 8px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                outline: 'none',
                minWidth: 150
              }}
            >
              <option value={-1}>All Departments</option>
              {departmentOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Group Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <label style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, fontWeight: typography.fontWeights.medium }}>
              Group:
            </label>
            <select
              value={groupId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setGroupId(val);
                setCurrentPage(1);
                fetchUsersList(1, pageSize, { groupId: val });
              }}
              style={{
                fontSize: typography.fontSizes.sm,
                padding: '5px 8px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                outline: 'none',
                minWidth: 130
              }}
            >
              <option value={-1}>All Groups</option>
              {groupOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <label style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, fontWeight: typography.fontWeights.medium }}>
              Status:
            </label>
            <select
              value={activeStatusId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setActiveStatusId(val);
                setCurrentPage(1);
                fetchUsersList(1, pageSize, { activeStatusId: val });
              }}
              style={{
                fontSize: typography.fontSizes.sm,
                padding: '5px 8px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                outline: 'none',
                minWidth: 110
              }}
            >
              <option value={-1}>All Statuses</option>
              {activeStatusOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters CTA */}
        {(username || userTypeId !== -1 || departmentId !== -1 || groupId !== -1 || activeStatusId !== 2 || activeAdvFiltersCount > 0) && (
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textMuted,
              fontSize: typography.fontSizes.xs,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: '4px 6px'
            }}
          >
            <i className="fa fa-undo" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: radii.sm,
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: typography.fontSizes.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <i className="fa fa-exclamation-circle" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchUsersList(currentPage, pageSize)}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontWeight: typography.fontWeights.medium,
              cursor: 'pointer',
              fontSize: typography.fontSizes.xs,
              textDecoration: 'underline'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Data Table */}
      <div
        style={{
          backgroundColor: colors.background.secondary,
          borderRadius: radii.md,
          border: `1px solid ${colors.border.subtle}`,
          boxShadow: shadows.sm,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: typography.fontSizes.sm
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  color: colors.text.secondary,
                  fontWeight: typography.fontWeights.semibold,
                  fontSize: typography.fontSizes.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '12px 16px', width: 260 }}>User Details</th>
                <th style={{ padding: '12px 16px', width: 140 }}>User Type</th>
                <th style={{ padding: '12px 16px', width: 160 }}>Primary Group</th>
                <th style={{ padding: '12px 16px', width: 180 }}>Department</th>
                <th style={{ padding: '12px 16px', width: 100 }}>Gender</th>
                <th style={{ padding: '12px 16px', width: 120 }}>Status</th>
                <th style={{ padding: '12px 16px', width: 100, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr
                    key={`skeleton-${idx}`}
                    style={{
                      borderBottom: `1px solid ${colors.border.subtle}`,
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: radii.full,
                            backgroundColor: '#e2e8f0',
                            animation: 'pulse 1.5s infinite'
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ width: 120, height: 14, backgroundColor: '#e2e8f0', borderRadius: 4 }} />
                          <div style={{ width: 80, height: 10, backgroundColor: '#f1f5f9', borderRadius: 4 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ width: 70, height: 16, backgroundColor: '#e2e8f0', borderRadius: 12 }} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ width: 90, height: 14, backgroundColor: '#e2e8f0', borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ width: 110, height: 14, backgroundColor: '#e2e8f0', borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ width: 50, height: 14, backgroundColor: '#e2e8f0', borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ width: 65, height: 18, backgroundColor: '#e2e8f0', borderRadius: 12 }} />
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <div style={{ width: 26, height: 26, backgroundColor: '#e2e8f0', borderRadius: 4 }} />
                        <div style={{ width: 26, height: 26, backgroundColor: '#e2e8f0', borderRadius: 4 }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: spacing.sm,
                        color: colors.textMuted
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: radii.full,
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          color: colors.text.secondary
                        }}
                      >
                        <i className="fa fa-user-slash" />
                      </div>
                      <div style={{ fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium, color: colors.text.primary }}>
                        No users found
                      </div>
                      <div style={{ fontSize: typography.fontSizes.xs, maxWidth: 320, color: colors.text.secondary }}>
                        We couldn't find any users matching your filter or search criteria. Try resetting filters or creating a new user.
                      </div>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        style={{
                          marginTop: spacing.xs,
                          padding: '6px 14px',
                          fontSize: typography.fontSizes.xs,
                          fontWeight: typography.fontWeights.medium,
                          borderRadius: radii.sm,
                          border: `1px solid ${colors.border.subtle}`,
                          backgroundColor: '#ffffff',
                          color: colors.primary.main,
                          cursor: 'pointer'
                        }}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // Users Data Rows
                items.map((user, idx) => {
                  const typeBadge = getUserTypeBadgeStyle(user.UserType?.Description);
                  const isActive = user.ActiveStatusId === 1 || user.ActiveStatusId === 2 || user.ActiveStatus?.Description?.toLowerCase().includes('active');

                  return (
                    <tr
                      key={user.Id || `user-${idx}`}
                      style={{
                        borderBottom: `1px solid ${colors.border.subtle}`,
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                        transition: 'background-color 0.12s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fcfcfd')}
                    >
                      {/* User Details */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {/* Avatar Circle */}
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: radii.full,
                              backgroundColor: typeBadge.bg,
                              color: typeBadge.text,
                              border: `1px solid ${typeBadge.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: typography.fontWeights.semibold,
                              fontSize: 13,
                              flexShrink: 0
                            }}
                          >
                            {getInitials(user)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span
                              style={{
                                fontWeight: typography.fontWeights.semibold,
                                color: colors.text.primary,
                                fontSize: typography.fontSizes.sm,
                                cursor: 'pointer'
                              }}
                              onClick={() => handleEdit(user)}
                            >
                              {getUserDisplayName(user)}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <span style={{ fontSize: 11, color: colors.text.secondary }}>
                                <i className="fa fa-id-badge" style={{ marginRight: 3, opacity: 0.7 }} />
                                {user.UserName}
                              </span>
                              {user.Mobile && (
                                <>
                                  <span style={{ color: colors.textMuted, fontSize: 10 }}>•</span>
                                  <span style={{ fontSize: 11, color: colors.textMuted }}>
                                    <i className="fa fa-phone" style={{ marginRight: 3, opacity: 0.6 }} />
                                    {user.Mobile}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* User Type */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: radii.full,
                            fontSize: typography.fontSizes.xs,
                            fontWeight: typography.fontWeights.medium,
                            backgroundColor: typeBadge.bg,
                            color: typeBadge.text,
                            border: `1px solid ${typeBadge.border}`
                          }}
                        >
                          {user.UserType?.Description || 'Standard User'}
                        </span>
                      </td>

                      {/* Primary Group */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: typography.fontSizes.sm,
                            color: colors.text.primary,
                            fontWeight: typography.fontWeights.medium
                          }}
                        >
                          {user.Group?.GroupName || '—'}
                        </span>
                      </td>

                      {/* Department */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: typography.fontSizes.sm, color: colors.text.primary }}>
                            {user.UserDept?.DepartmentName || '—'}
                          </span>
                          {user.Speciality?.SpecialityName && (
                            <span style={{ fontSize: 11, color: colors.textMuted }}>
                              {user.Speciality.SpecialityName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Gender */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: typography.fontSizes.sm, color: colors.text.secondary }}>
                          {user.Gender?.Description || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: radii.full,
                            fontSize: 11,
                            fontWeight: typography.fontWeights.semibold,
                            backgroundColor: isActive ? '#ecfdf5' : '#fef2f2',
                            color: isActive ? '#059669' : '#dc2626',
                            border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: radii.full,
                              backgroundColor: isActive ? '#10b981' : '#ef4444'
                            }}
                          />
                          {user.ActiveStatus?.Description || (isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            title="Edit User"
                            onClick={() => handleEdit(user)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: radii.sm,
                              border: `1px solid ${colors.border.subtle}`,
                              backgroundColor: '#ffffff',
                              color: colors.primary.main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: 12,
                              transition: 'all 0.12s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primaryLight;
                              e.currentTarget.style.borderColor = colors.primary.main;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = colors.border.subtle;
                            }}
                          >
                            <i className="fa fa-pen" />
                          </button>

                          <button
                            type="button"
                            title="Delete User"
                            onClick={() => handleDeleteClick(user)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: radii.sm,
                              border: `1px solid ${colors.border.subtle}`,
                              backgroundColor: '#ffffff',
                              color: '#dc2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: 12,
                              transition: 'all 0.12s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                              e.currentTarget.style.borderColor = '#fca5a5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = colors.border.subtle;
                            }}
                          >
                            <i className="fa fa-trash-alt" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
            padding: `${spacing.sm} ${spacing.md}`,
            borderTop: `1px solid ${colors.border.subtle}`,
            backgroundColor: '#ffffff'
          }}
        >
          {/* Page size and records summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
              Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: typography.fontSizes.xs, color: colors.textMuted }}>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{
                  padding: '3px 6px',
                  fontSize: typography.fontSizes.xs,
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.border.subtle}`,
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                  outline: 'none'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Page controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(1)}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: '#ffffff',
                color: currentPage <= 1 ? colors.textMuted : colors.text.primary,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
              title="First Page"
            >
              <i className="fa fa-angle-double-left" />
            </button>

            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: '#ffffff',
                color: currentPage <= 1 ? colors.textMuted : colors.text.primary,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
              title="Previous Page"
            >
              <i className="fa fa-angle-left" />
            </button>

            <span style={{ fontSize: typography.fontSizes.xs, padding: '0 8px', color: colors.text.secondary }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: '#ffffff',
                color: currentPage >= totalPages ? colors.textMuted : colors.text.primary,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
              title="Next Page"
            >
              <i className="fa fa-angle-right" />
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(totalPages)}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: '#ffffff',
                color: currentPage >= totalPages ? colors.textMuted : colors.text.primary,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
              title="Last Page"
            >
              <i className="fa fa-angle-double-right" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Modal Dialog */}
      {showAdvFilter && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: spacing.md
          }}
          onClick={() => setShowAdvFilter(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.lg,
              border: `1px solid ${colors.border.subtle}`,
              boxShadow: shadows.xl,
              width: '100%',
              maxWidth: 680,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: spacing.lg
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: spacing.sm,
                borderBottom: `1px solid ${colors.border.subtle}`,
                marginBottom: spacing.md
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <i className="fa fa-sliders-h" style={{ color: colors.primary.main, fontSize: 16 }} />
                <h3 style={{ margin: 0, fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold, color: colors.text.primary }}>
                  Advanced User Filters
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvFilter(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                <i className="fa fa-times" />
              </button>
            </div>

            {/* Modal Form Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: spacing.md,
                marginBottom: spacing.lg
              }}
            >
              {/* Organization / Facility */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.text.secondary }}>
                  Organization / Facility
                </label>
                <select
                  value={advOrgId}
                  onChange={(e) => setAdvOrgId(Number(e.target.value))}
                  style={{
                    padding: '8px 10px',
                    fontSize: typography.fontSizes.sm,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.border.subtle}`,
                    backgroundColor: colors.background.primary,
                    outline: 'none'
                  }}
                >
                  <option value={-1}>All Organizations</option>
                  {orgOptions.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speciality */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.text.secondary }}>
                  Speciality
                </label>
                <select
                  value={advSpecialityId}
                  onChange={(e) => setAdvSpecialityId(Number(e.target.value))}
                  style={{
                    padding: '8px 10px',
                    fontSize: typography.fontSizes.sm,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.border.subtle}`,
                    backgroundColor: colors.background.primary,
                    outline: 'none'
                  }}
                >
                  <option value={-1}>All Specialities</option>
                  {specialityOptions.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clinical Role */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.text.secondary }}>
                  Clinical Role
                </label>
                <select
                  value={advClinicalRoleId}
                  onChange={(e) => setAdvClinicalRoleId(Number(e.target.value))}
                  style={{
                    padding: '8px 10px',
                    fontSize: typography.fontSizes.sm,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.border.subtle}`,
                    backgroundColor: colors.background.primary,
                    outline: 'none'
                  }}
                >
                  <option value={-1}>All Clinical Roles</option>
                  {clinicalRoleOptions.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Share Class */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.text.secondary }}>
                  Doctor Share Class
                </label>
                <select
                  value={advDoctorShareClassId}
                  onChange={(e) => setAdvDoctorShareClassId(Number(e.target.value))}
                  style={{
                    padding: '8px 10px',
                    fontSize: typography.fontSizes.sm,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.border.subtle}`,
                    backgroundColor: colors.background.primary,
                    outline: 'none'
                  }}
                >
                  <option value={-1}>All Share Classes</option>
                  {doctorShareOptions.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.text.secondary }}>
                  Gender
                </label>
                <select
                  value={advGenderId}
                  onChange={(e) => setAdvGenderId(Number(e.target.value))}
                  style={{
                    padding: '8px 10px',
                    fontSize: typography.fontSizes.sm,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.border.subtle}`,
                    backgroundColor: colors.background.primary,
                    outline: 'none'
                  }}
                >
                  <option value={-1}>All Genders</option>
                  {genderOptions.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.text.secondary }}>
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={advMobile}
                  onChange={(e) => setAdvMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  style={{
                    padding: '8px 10px',
                    fontSize: typography.fontSizes.sm,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.border.subtle}`,
                    backgroundColor: colors.background.primary,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.text.secondary }}>
                  Area / Locality
                </label>
                <input
                  type="text"
                  value={advArea}
                  onChange={(e) => setAdvArea(e.target.value)}
                  placeholder="e.g. Central Sector"
                  style={{
                    padding: '8px 10px',
                    fontSize: typography.fontSizes.sm,
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.border.subtle}`,
                    backgroundColor: colors.background.primary,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: spacing.sm,
                paddingTop: spacing.md,
                borderTop: `1px solid ${colors.border.subtle}`
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAdvOrgId(-1);
                  setAdvSpecialityId(-1);
                  setAdvClinicalRoleId(-1);
                  setAdvDoctorShareClassId(-1);
                  setAdvGenderId(-1);
                  setAdvMobile('');
                  setAdvArea('');
                  setAdvCountryId(-1);
                  setAdvStateId(-1);
                  setAdvCityId(-1);
                  setAdvPincodeId(-1);
                }}
                style={{
                  padding: '8px 14px',
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.medium,
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.border.subtle}`,
                  backgroundColor: '#ffffff',
                  color: colors.text.secondary,
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAdvFilter(false);
                  setCurrentPage(1);
                  fetchUsersList(1, pageSize);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.semibold,
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: colors.primary.main,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: shadows.sm
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {deleteModalState.isOpen && deleteModalState.item && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: spacing.md
          }}
          onClick={() => !isDeleting && setDeleteModalState({ isOpen: false, item: null })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.lg,
              border: `1px solid ${colors.border.subtle}`,
              boxShadow: shadows.xl,
              width: '100%',
              maxWidth: 440,
              padding: spacing.lg
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: spacing.md }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radii.full,
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0
                }}
              >
                <i className="fa fa-exclamation-triangle" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold, color: colors.text.primary }}>
                  Confirm User Deletion
                </h3>
                <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
                  This will mark the user account as deleted in the system.
                </span>
              </div>
            </div>

            <p style={{ fontSize: typography.fontSizes.sm, color: colors.text.primary, margin: `0 0 ${spacing.lg} 0` }}>
              Are you sure you want to delete user{' '}
              <strong>{getUserDisplayName(deleteModalState.item)}</strong> (Login: <code>{deleteModalState.item.UserName}</code>)?
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalState({ isOpen: false, item: null })}
                style={{
                  padding: '8px 14px',
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.medium,
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.border.subtle}`,
                  backgroundColor: '#ffffff',
                  color: colors.text.secondary,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.semibold,
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  boxShadow: shadows.sm
                }}
              >
                {isDeleting ? (
                  <>
                    <i className="fa fa-spinner fa-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-trash-alt" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
