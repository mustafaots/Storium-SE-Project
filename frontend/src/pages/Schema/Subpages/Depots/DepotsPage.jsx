import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaWarehouse, FaArrowLeft, FaPlus } from 'react-icons/fa';

import NavBar from '../../../../components/UI/NavBar/NavBar';
import Header from '../../../../components/UI/Header/Header';
import Button from '../../../../components/UI/Button/Button';
import DataTable from '../../../../components/UI/DataTable/DataTable';
import DepotForm from '../../../../components/Layout/DepotsLayout/DepotForm';
import useTableSearch from '../../../../hooks/useTableSearch';
import { useActiveNavItem } from '../../../../hooks/useActiveNavItem';
import { useDepots } from '../../../../hooks/useDepots';
import { depotsConfig } from '../../../../config/depotsConfig';
import { depotsHandlers } from '../../../../handlers/depotsHandlers';
import { depotsController } from '../../../../controllers/depotsController';

import styles from './DepotsPage.module.css';

function DepotsPage() {
	const { locationId } = useParams();
	const { state } = useLocation();
	const navigate = useNavigate();
	const activeItem = useActiveNavItem();

	const locationName = state?.locationName;

	const {
		depots,
		loading,
		error,
		showForm,
		isEditing,
		currentDepot,
		pagination,
		setError,
		setShowForm,
		setIsEditing,
		setCurrentDepot,
		loadDepots,
		deleteDepot,
		handlePageChange,
		handlePageSizeChange
	} = useDepots(locationId);

	const search = useTableSearch('');

	useEffect(() => {
		if (locationId) {
			loadDepots(1, pagination.pageSize, search.debouncedSearch);
		}
	}, [locationId, search.debouncedSearch, loadDepots, pagination.pageSize]);

	const reloadCurrent = useMemo(
		() => () => loadDepots(pagination.currentPage, pagination.pageSize, search.debouncedSearch),
		[loadDepots, pagination.currentPage, pagination.pageSize, search.debouncedSearch]
	);

	const onFormSuccess = useMemo(
		() => () => depotsHandlers.onFormSuccess(
			setShowForm,
			setIsEditing,
			setCurrentDepot,
			reloadCurrent
		),
		[reloadCurrent, setCurrentDepot, setIsEditing, setShowForm]
	);

	const handlers = useMemo(() => ({
		onEdit: (depot) => depotsHandlers.onEdit(
			depot,
			setCurrentDepot,
			setIsEditing,
			setShowForm,
			setError
		),
		onNew: () => depotsHandlers.onNew(
			setCurrentDepot,
			setIsEditing,
			setShowForm,
			setError
		),
		onFormSuccess,
		onCancel: () => depotsHandlers.onCancel(
			setShowForm,
			setIsEditing,
			setCurrentDepot,
			setError
		),
		onDelete: (id) => depotsHandlers.onDelete(
			id,
			(depotId) => deleteDepot(depotId, search.debouncedSearch)
		),
		onCreate: (formData) => depotsController.createDepot(
			locationId,
			formData,
			() => {},
			setError,
			onFormSuccess
		),
		onUpdate: (formData) => depotsController.updateDepot(
			locationId,
			currentDepot?.depot_id,
			formData,
			() => {},
			setError,
			onFormSuccess
		),
	}), [locationId, locationName, navigate, setCurrentDepot, setIsEditing, setShowForm, setError, onFormSuccess, deleteDepot, search.debouncedSearch, currentDepot?.depot_id]);

	const columns = useMemo(
		() => depotsConfig.columns(styles, {
			onEdit: handlers.onEdit,
			onDelete: handlers.onDelete
		}),
		[handlers]
	);

	const handleRowClick = (depot) => {
		navigate(`/locations/${locationId}/depots/${depot.depot_id}/aisles`, {
			state: {
				locationName,
				depotName: depot.name
			}
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
						<DepotForm
							isEditing={isEditing}
							currentDepot={currentDepot}
							loading={loading}
							error={error}
							onSubmit={handleSubmit}
							onCancel={handlers.onCancel}
							onError={setError}
						/>
					) : (
						<div className={styles.listContainer}>
							<div className={styles.headerRow}>
								<span className={styles.backLink} onClick={() => navigate('/locations')}>
									<FaArrowLeft style={{ marginRight: '8px' }} /> Back to Locations
								</span>
								{locationName && (
									<span className={styles.locationBadge}>Location: {locationName}</span>
								)}
							</div>
							<Header
								title="DEPOTS"
								subtitle="Manage depots within this location"
								size="small"
								align="left"
								icon={<FaWarehouse size={28} />}
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
								data={depots}
								columns={columns}
								keyField="depot_id"
								loading={loading}
								emptyMessage={search.debouncedSearch ? 'No depots match this search' : 'No depots found'}
								className={styles.depotsTable}
								pagination={pagination}
								onPageChange={(page) => handlePageChange(page, search.debouncedSearch)}
								onPageSizeChange={(size) => handlePageSizeChange(size, search.debouncedSearch)}
								showPagination={true}
								showSearch={true}
								searchPlaceholder="Search depots..."
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

export default DepotsPage;
