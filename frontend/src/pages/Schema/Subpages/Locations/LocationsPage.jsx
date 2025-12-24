import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPlus } from 'react-icons/fa';

import NavBar from '../../../../components/UI/NavBar/NavBar';
import Header from '../../../../components/UI/Header/Header';
import Button from '../../../../components/UI/Button/Button';
import DataTable from '../../../../components/UI/DataTable/DataTable';
import LocationForm from '../../../../components/Layout/LocationsLayout/LocationForm';
import useTableSearch from '../../../../hooks/useTableSearch';
import { useLocations } from '../../../../hooks/useLocations';
import { useActiveNavItem } from '../../../../hooks/useActiveNavItem';
import { locationsConfig } from '../../../../config/locationsConfig';
import { locationsHandlers } from '../../../../handlers/locationsHandlers';
import { locationsController } from '../../../../controllers/locationsController';

import styles from './LocationsPage.module.css';

function LocationsPage() {
	const activeItem = useActiveNavItem();
	const navigate = useNavigate();

	const {
		locations,
		loading,
		error,
		showForm,
		isEditing,
		currentLocation,
		pagination,
		setError,
		setShowForm,
		setIsEditing,
		setCurrentLocation,
		loadLocations,
		deleteLocation,
		handlePageChange,
		handlePageSizeChange
	} = useLocations();

	const search = useTableSearch('');


	useEffect(() => {
		loadLocations(1, pagination.pageSize, search.debouncedSearch);
	}, [search.debouncedSearch, loadLocations, pagination.pageSize]);

	const reloadCurrent = useMemo(
		() => () => loadLocations(pagination.currentPage, pagination.pageSize, search.debouncedSearch),
		[loadLocations, pagination.currentPage, pagination.pageSize, search.debouncedSearch]
	);

	const onFormSuccess = useMemo(
		() => () => locationsHandlers.onFormSuccess(
			setShowForm,
			setIsEditing,
			setCurrentLocation,
			reloadCurrent
		),
		[reloadCurrent, setCurrentLocation, setIsEditing, setShowForm]
	);

	const handlers = useMemo(() => ({
		onEdit: (location) => locationsHandlers.onEdit(
			location,
			setCurrentLocation,
			setIsEditing,
			setShowForm,
			setError
		),
		onNew: () => locationsHandlers.onNew(
			setCurrentLocation,
			setIsEditing,
			setShowForm,
			setError
		),
		onFormSuccess,
		onCancel: () => locationsHandlers.onCancel(
			setShowForm,
			setIsEditing,
			setCurrentLocation,
			setError
		),
		onDelete: (id) => locationsHandlers.onDelete(
			id,
			(locationId) => deleteLocation(locationId, search.debouncedSearch)
		),
		onCreate: (formData) => locationsController.createLocation(
			formData,
			() => {},
			setError,
			onFormSuccess
		),
		onUpdate: (formData) => locationsController.updateLocation(
			currentLocation?.location_id,
			formData,
			() => {},
			setError,
			onFormSuccess
		),
	}), [navigate, setCurrentLocation, setIsEditing, setShowForm, setError, onFormSuccess, deleteLocation, search.debouncedSearch, currentLocation?.location_id]);

	const columns = useMemo(
		() => locationsConfig.columns(styles, {
			onEdit: handlers.onEdit,
			onDelete: handlers.onDelete
		}),
		[handlers]
	);

	const handleRowClick = (location) => {
		navigate(`/locations/${location.location_id}/depots`, {
			state: { locationName: location.name }
		});
	};

	const handleSubmit = (formData) => {
		if (isEditing) {
			return handlers.onUpdate(formData);
		}
		return handlers.onCreate(formData);
	};

	return (
		<div className={styles.pageWrapper}>
			<div className={styles.mainContent}>
				<div className={styles.content}>
					{showForm ? (
						<LocationForm
							isEditing={isEditing}
							currentLocation={currentLocation}
							loading={loading}
							error={error}
							onSubmit={handleSubmit}
							onCancel={handlers.onCancel}
							onError={setError}
						/>
					) : (
						<div className={styles.listContainer}>
							<Header
								title="LOCATIONS"
								subtitle="Manage your storage locations"
								size="small"
								align="left"
								icon={<FaMapMarkerAlt size={28} />}
							/>

							{error && (
								<div className={styles.errorAlert}>
									<div className={styles.errorContent}>
										<span className={styles.errorMessage}>{error}</span>
										<button onClick={() => setError('')} className={styles.closeBtn}>×</button>
									</div>
								</div>
							)}

							<DataTable
								data={locations}
								columns={columns}
								keyField="location_id"
								loading={loading}
								emptyMessage={search.debouncedSearch ? 'No locations match this search' : 'No locations found'}
								className={styles.locationsTable}
								pagination={pagination}
								onPageChange={(page) => handlePageChange(page, search.debouncedSearch)}
								onPageSizeChange={(size) => handlePageSizeChange(size, search.debouncedSearch)}
								showPagination={true}
								showSearch={true}
								searchPlaceholder="Search locations..."
								onSearchChange={search.setSearchTerm}
								searchTerm={search.searchTerm}
								onRowClick={handleRowClick}
								rightControls={(
									<Button variant="secondary" leadingIcon={<FaPlus />} onClick={handlers.onNew}>
										Add
									</Button>
								)}
							/>
						</div>
					)}
				</div>
			</div>
			<NavBar activeItem={activeItem} />
		</div>
	);
}

export default LocationsPage;
