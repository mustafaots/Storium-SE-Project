# STORIUM
## Inventory Management System
### User Documentation

## Contents
1. [Introduction](#1-introduction)
   - 1.1 [Key capabilities](#11-key-capabilities)
2. [Application Entry](#2-application-entry)
   - 2.1 [Accessing the application](#21-accessing-the-application)
   - 2.2 [Main menu](#22-main-menu)
3. [Inventory Overview](#3-inventory-overview)
   - 3.1 [Overview page](#31-overview-page)
   - 3.2 [Inventory structure at a glance](#32-inventory-structure-at-a-glance)
   - 3.3 [Common actions on the overview](#33-common-actions-on-the-overview)
4. [Locations](#4-locations)
   - 4.1 [Purpose](#41-purpose)
   - 4.2 [Locations table](#42-locations-table)
     - 4.2.1 [Available actions](#421-available-actions)
   - 4.3 [Creating a location](#43-creating-a-location)
5. [Depots](#5-depots)
   - 5.1 [Purpose](#51-purpose)
   - 5.2 [Depots table](#52-depots-table)
     - 5.2.1 [Available features](#521-available-features)
   - 5.3 [Adding a depot](#53-adding-a-depot)
6. [Aisles](#6-aisles)
   - 6.1 [Purpose](#61-purpose)
   - 6.2 [Aisles table](#62-aisles-table)
     - 6.2.1 [Supported features](#621-supported-features)
   - 6.3 [Adding an aisle](#63-adding-an-aisle)
7. [Racks](#7-racks)
   - 7.1 [Purpose](#71-purpose)
   - 7.2 [Racks table and management](#72-racks-table-and-management)
     - 7.2.1 [Available actions](#721-available-actions)
   - 7.3 [Adding a rack](#73-adding-a-rack)
   - 7.4 [Hierarchical structure](#74-hierarchical-structure)
8. [Slots & Stock Placement](#8-slots--stock-placement)
   - 8.1 [Rack overview](#81-rack-overview)
   - 8.2 [Slots by level](#82-slots-by-level)
   - 8.3 [Adding stock](#83-adding-stock)
     - 8.3.1 [Add Stock form](#831-add-stock-form)
9. [Sources](#9-sources)
   - 9.1 [Purpose](#91-purpose)
   - 9.2 [Sources table](#92-sources-table)
     - 9.2.1 [Actions per source](#921-actions-per-source)
   - 9.3 [Adding a new source](#93-adding-a-new-source)
10. [Products](#10-products)
    - 10.1 [Purpose](#101-purpose)
    - 10.2 [Products table](#102-products-table)
      - 10.2.1 [Actions per product](#1021-actions-per-product)
    - 10.3 [Adding a new product](#103-adding-a-new-product)
11. [Transactions](#11-transactions)
    - 11.1 [Purpose](#111-purpose)
    - 11.2 [Transaction history page](#112-transaction-history-page)
      - 11.2.1 [Filtering options](#1121-filtering-options)
      - 11.2.2 [Actions](#1122-actions)
12. [Clients](#12-clients)
    - 12.1 [Purpose](#121-purpose)
    - 12.2 [Clients table](#122-clients-table)
      - 12.2.1 [Actions per client](#1221-actions-per-client)
    - 12.3 [Adding a client](#123-adding-a-client)
13. [Visualizations](#13-visualizations)
    - 13.1 [Filters](#131-filters)
    - 13.2 [Graphical representation](#132-graphical-representation)
    - 13.3 [Inventory statistics](#133-inventory-statistics)
14. [Routines](#14-routines)
    - 14.1 [Creating a new routine](#141-creating-a-new-routine)
    - 14.2 [Routine overview and statistics](#142-routine-overview-and-statistics)
    - 14.3 [Search and filters](#143-search-and-filters)
    - 14.4 [Routines table](#144-routines-table)
15. [Alerts](#15-alerts)
    - 15.1 [Alert filters](#151-alert-filters)
    - 15.2 [Alerts table](#152-alerts-table)
    - 15.3 [Available actions](#153-available-actions)
16. [Search, Filters, and Pagination](#16-search-filters-and-pagination)
    - 16.1 [Search](#161-search)
    - 16.2 [Filters](#162-filters)
    - 16.3 [Pagination](#163-pagination)
17. [Common User Scenarios](#17-common-user-scenarios)
    - 17.1 [Scenario 1: Place new stock in a rack](#171-scenario-1-place-new-stock-in-a-rack)
    - 17.2 [Scenario 2: Investigate low-stock alerts and replenish](#172-scenario-2-investigate-low-stock-alerts-and-replenish)
    - 17.3 [Scenario 3: Monitor warehouse performance over the last month](#173-scenario-3-monitor-warehouse-performance-over-the-last-month)
18. [Error Handling and Troubleshooting](#18-error-handling-and-troubleshooting)
    - 18.1 [Typical messages](#181-typical-messages)
    - 18.2 [General troubleshooting tips](#182-general-troubleshooting-tips)
19. [Best Practices](#19-best-practices)

---

## 1 Introduction

The Inventory Management System "STORIUM" is a web-based application designed to help organizations structure, monitor, and control their stock across locations, depots, aisles, racks, and slots. It is intended for warehouse staff, storekeepers, sales teams, and managers who need a clear, real-time view of stock levels, product information, and inventory movements without requiring technical knowledge.

### 1.1 Key capabilities

- Centralized overview of the entire inventory structure.
- Detailed management of locations, depots, aisles, racks, slots, and active stocks.
- Registration and tracking of products, sources (suppliers), clients, and transactions.
- Analytical visualizations, routines, and alerts to monitor inventory health.
- Powerful search, filtering, and export tools on all main data tables.

## 2 Application Entry

### 2.1 Accessing the application

1. Open your web browser and navigate to the application URL, or start the desktop application if it is installed on your computer.
2. After the application loads successfully, the main menu (home screen) is displayed.

### 2.2 Main menu

After accessing the application, a simple main menu is displayed with three options: Enter, Support, and Exit. Click Enter to open the main website and access all navigation pages (Locations, Sources, Products, Transactions, Clients, and other modules). Use Support to open the help and documentation area, and Exit to close the application session.

## 3 Inventory Overview

### 3.1 Overview page

After entering the system, the Schema page is displayed. This view provides a high-level snapshot of the inventory architecture and key metrics so that users can understand the current state at a glance.

### 3.2 Inventory structure at a glance

The overview typically shows aggregated information for:

- Locations
- Depots
- Aisles
- Racks
- Slots
- Active stocks
- Products

Cards or counters may summarize how many of each element exist and whether there are warnings such as low stock. A Manage Locations action is available to open the detailed structural management area.

### 3.3 Common actions on the overview

- Navigate directly to structural management (locations, depots, aisles, racks, slots).
- Refresh the panel to view the most recent data.

## 4 Locations

### 4.1 Purpose

The Locations section is used to manage all top-level physical or logical locations in which inventory is stored. Each location acts as the parent container for its depots, aisles, racks, and slots.

### 4.2 Locations table

The Locations page presents a table listing all existing locations. Typical columns include: Location name, Address, Coordinates, Created Time, Actions.

#### 4.2.1 Available actions

- **"+ Add"**: Open a form to create a new location with its basic details.

Each row generally provides an "Actions" menu:

- **Manage Depots**: Open the Depots view for the selected location.
- **Edit**: Modify the details of the location.
- **Remove**: Deactivate or remove the location, when allowed.

### 4.3 Creating a location

1. Navigate to the Locations page.
2. Click "+ Add".
3. Fill in required fields: Name, Address, and Coordinates.
4. Confirm and save the form.

**Expected result:** The new location appears in the Locations table and becomes available for depot creation.

## 5 Depots

### 5.1 Purpose

Depots represent subdivisions inside a location, such as areas, halls, or distinct storage zones. They help organize large locations into more manageable sections.

### 5.2 Depots table

When a location is selected and Manage Depots is chosen, the Depots table is displayed for that location. The table lists all depots associated with the current location, usually with columns such as Depot name, Created time, and Actions.

#### 5.2.1 Available features

- **"+ Add"**: Create a new depot in the current location.

Per-depot Actions commonly include:

- **View Aisles**: Open the Aisles view within this depot.
- **Edit**: Update depot details.
- **Remove**: Remove or deactivate the depot, subject to business rules.

### 5.3 Adding a depot

1. Open the Depots view for the desired location.
2. Click "+ Add".
3. Enter the depot name.
4. Click on "Create Depot" to save the form.

**Expected result:** The depot is added to the list and will contain aisles, racks, and slots as needed.

## 6 Aisles

### 6.1 Purpose

Aisles are linear segments or corridors within a depot and provide an intermediate level of structure before racks and slots. They help physically locate products and simplify navigation inside a warehouse.

### 6.2 Aisles table

In the Aisles view, all aisles belonging to the selected depot are listed. Columns typically include Name, Created time and Actions.

#### 6.2.1 Supported features

- **"+ Add"**: Create a new aisle.
- **"Export"**: Export the aisles table.

Per-aisle Actions include:

- **View Racks**: Open the Racks view within this aisle.
- **Edit**: Modify aisle attributes.
- **Remove**: Deactivate or remove the aisle.

### 6.3 Adding an aisle

1. Navigate to the Aisles view for the chosen depot.
2. Click "+ Add".
3. Provide the aisle name.
4. Save the form.

**Expected result:** The aisle appears in the table and can now contain racks.

## 7 Racks

### 7.1 Purpose

Racks represent vertical storage structures within an aisle, made up of multiple slots or levels. They are an essential part of the physical inventory layout, allowing precise mapping of where products are stored.

### 7.2 Racks table and management

The Racks section shows all racks for the selected aisle. From here, racks can be created and managed.

#### 7.2.1 Available actions

- **"+ Add"**: Create a new rack within the aisle.
- **"Edit"**: Change rack properties.
- **"Remove"**: Deactivate or remove the rack.

### 7.3 Adding a rack

1. Navigate to the Racks view for the chosen Aisle.
2. Click "+ Add".
3. Provide the Rack Face, Levels, Bays, Bins per bay.
4. Save the form.

### 7.4 Hierarchical structure

The overall inventory schema is defined by the following hierarchy:

**Locations → Depots → Aisles → Racks → Slots**

This structure ensures that each product can be assigned to a precise physical position and that navigation from high-level to low-level elements is straightforward.

## 8 Slots & Stock Placement

The Rack view is used to manage slots and stock placements within a specific rack. This section allows precise control over how products are stored, tracked, and consumed within each rack and slot.

### 8.1 Rack overview

Upon entering a rack, detailed rack information is displayed, including:

- Rack code
- Layout
- Levels
- Bays
- Bins
- Face type (for example, single face)

Context information is also shown so you always know where the rack is located in the inventory structure:

- Location
- Depot
- Aisle

This context ensures full traceability of stock placement within the inventory hierarchy.

### 8.2 Slots by level

Slots are organized by levels within the rack. Each level typically displays:

- Bays and bins (for example, Bay 1, Bin 1)
- All existing stocks currently stored in each slot

This layout helps you visually understand how space is used and where each product is physically stored.

### 8.3 Adding stock

To place new stock in a slot, select the option "Add Stock" on the desired slot.

#### 8.3.1 Add Stock form

The stock creation form includes the following fields:

- **Product**: Product selection.
- **Quantity**: Number of units to place in the slot.
- **Stock strategy**:
  - FIFO
  - LIFO
  - JIT
- **Product type**:
  - Raw
  - WIP
  - To ship
  - Dead stock
  - Discrepancy
- **Batch**
- **Sale price**
- **Expiry date**
- **Cost price**
- **Consumable**: Option that can be enabled if applicable.

After completing the form, select Create Stock to confirm and save the stock placement in the chosen slot.

## 9 Sources

### 9.1 Purpose

The Sources section is used to manage suppliers and other entities that provide goods to the inventory. Maintaining accurate source data improves traceability and reporting on where products originate.

### 9.2 Sources table

The Sources page typically contains:

- A structured list of all sources with identifiers and key contact details.
- A "+ Add" button for creating new sources.
- Export functionality to download the table.
- Filters to switch between the current view and all sources.
- A search field for finding sources by name, code, or other attributes.

#### 9.2.1 Actions per source

- **Edit**: Update supplier information.
- **Remove**: Deactivate or remove a source as allowed.

### 9.3 Adding a new source

1. Open the Sources section.
2. Click "+ Add".
3. Enter the required supplier details such as name and contact information.
4. Enable the "active" button to activate that source.
5. Save the record.

**Expected result:** The new source appears in the table and becomes selectable in purchase or inflow processes.

## 10 Products

### 10.1 Purpose

The Products section manages all inventory items stored in the system. Accurate product data ensures correct transactions, valuation, and reporting.

### 10.2 Products table

The Products page offers functionality similar to the Sources section:

- **"+ Add"**: Create new products.
- **"Export"**: Download the products list.
- Filters to switch between the current view and all products.
- Search by name, code, or other properties.

#### 10.2.1 Actions per product

- **Edit**: Modify product attributes.
- **Remove**: Deactivate or remove the product.

### 10.3 Adding a new product

1. Go to the Products section.
2. Click "+ Add".
3. Provide product details such as Name, Category, Unit of Measure, and default pricing, select supplier, Description (optional), image URL (optional).
4. Save the record.

**Expected result:** The product becomes available for assignment to slots and for use in transactions.

## 11 Transactions

### 11.1 Purpose

The Transactions section tracks all inventory movements over time. It records entries, exits, and transfers so that stock levels remain consistent and auditable.

### 11.2 Transaction history page

The Transaction History page presents a chronological list of all transactions in a table format. Typical columns include Date, Type, Notes and Actions.

#### 11.2.1 Filtering options

Transactions can be filtered using:

- **"Type"**: Automated, Manual, or Mixed.
- **"Date range"**: Today, This week, This month, or All.

#### 11.2.2 Actions

- **View details**: Open a detailed view of the transaction, showing all related fields.
- **Export**: Download the transaction history for reporting or analysis.

## 12 Clients

### 12.1 Purpose

The Clients section manages customer or internal client records used in outgoing transactions. Up-to-date client information supports accurate invoicing and tracking of deliveries.

### 12.2 Clients table

The Clients page supports:

- Adding new clients via the "+ Add" button.
- Exporting the clients table.
- Filtering between the current view and all clients.
- Searching by client name, or other fields.

#### 12.2.1 Actions per client

- **"Edit"**: Update client details.
- **"Remove"**: Deactivate or remove the client where allowed.

### 12.3 Adding a client

1. Open the "Clients" section.
2. Click "+ Add".
3. Fill in the client's name, contact details and address.
4. Save the record.

**Expected result:** The new client is available for selection in transactions.

## 13 Visualizations

The Visualizations section provides analytical insights into inventory data using filters, charts, and summary statistics. It helps users understand trends in stock levels, movements, and stock value over different time periods.

### 13.1 Filters

At the top of the Visualizations page, filters can be applied to refine the displayed data:

**Metric**
- Stock level
- Movement
- Stock value

**Date range**
- Last 7 days
- Last 30 days
- Last 90 days
- Last year

**Product**
- All products
- Specific products (e.g., Product 1, Product 2)

**Location**
- All locations
- Specific locations (e.g., Location 1, Location 2)

**Stock type**
- All stock types
- Specific stock types

After choosing the desired filters, click "Apply" to generate the graphical representation based on the selected criteria.

### 13.2 Graphical representation

The filtered data is shown as dynamic curve charts. These charts allow trend analysis and comparison over time, making it easier to detect seasonality, spikes in movement, and changes in stock value.

### 13.3 Inventory statistics

Summary cards provide real-time inventory indicators, such as:

- Total stock value
- Movement today
- Items below minimum stock level
- Warehouse occupancy

These indicators offer a quick overview of inventory health and performance without needing to examine detailed tables.

## 14 Routines

The Routines section is used to configure and manage automated inventory processes. Routines help enforce business rules, reduce manual work, and ensure that important checks are executed on a regular basis.

### 14.1 Creating a new routine

1. Click New Routine to open the routine creation form.
2. Provide a Routine name.
3. Choose the Frequency:
   - Daily
   - Weekly
   - On event
4. Define the Promise (trigger) that will start the routine.
5. Specify the Time or schedule at which it should run (for example, every day at 08:00).
6. Enter the Condition that must be satisfied (for instance, "stock below minimum").
7. Configure the Resolution (action) and select the Action type:
   - Create alert
   - Log transaction
   - Send email
8. Add any Action details required (message text, email recipients, etc.).
9. Click Save Routine to store the configuration.

**Expected result:** The routine appears in the routines table and will execute automatically according to its frequency and conditions.

### 14.2 Routine overview and statistics

At the top of the Routines section, summary statistics give a quick view of automation status, such as:

- Active routines
- Critical errors
- Executions (total or over a selected period)

These indicators help monitor whether automations are running as expected or require attention.

### 14.3 Search and filters

Routines can be filtered by frequency:

- All
- Daily
- Weekly
- On event

A search box allows users to quickly locate a specific routine by name or trigger description.

### 14.4 Routines table

The routines table lists all configured routines with information such as:

- Routine name
- Promise / trigger
- Frequency
- Last run status

**Available actions** For each routine, typical actions include:

- Run the routine manually
- Edit the routine configuration
- Delete (or deactivate) the routine

## 15 Alerts

The Alerts section centralizes system-generated notifications related to inventory conditions. It ensures that users can quickly see and respond to critical issues such as low stock, overstock, or expiry risks.

### 15.1 Alert filters

Alerts can be filtered using several criteria:

**Type**
- All types
- Low stock
- Overstock
- Expiry
- Reorder

**Severity**
- All severity levels
- Critical
- Warning
- Info

**Status**
- Unread only
- Show all

These filters help users focus on the most important or urgent alerts first.

### 15.2 Alerts table

The alerts table lists all notifications generated by the system. Rows are typically ordered by newest first so recent events are easy to see.

### 15.3 Available actions

For each alert, users can:

- **Mark as read** to acknowledge the alert and remove it from the unread list.
- **Delete** the alert when it is no longer needed in the interface.

These actions help maintain visibility and control over critical inventory events while keeping the alerts list organized.

## 16 Search, Filters, and Pagination

### 16.1 Search

Most tables provide a search bar at the top. Typing part of a name, code, or identifier filters the rows in real time or after pressing a search button.

### 16.2 Filters

Filter panels or dropdowns allow users to limit visible data by status, date range, location, category, or other criteria. Filters help focus on relevant records and reduce visual clutter.

### 16.3 Pagination

When there are many records, tables are split into pages. Use the page numbers, Previous, and Next buttons at the bottom to move between pages.

## 17 Common User Scenarios

### 17.1 Scenario 1: Place new stock in a rack

1. Navigate through the structure: select the Location, then the Depot, Aisle, and finally open the desired Rack view.
2. In the rack overview, locate the correct level, bay, and bin where the stock should be stored.
3. On the chosen slot, click Add Stock.
4. In the Add Stock form, select the Product, enter the Quantity, choose the Stock strategy (FIFO, LIFO, or JIT), and set the appropriate Product type (for example, Raw or To ship).
5. Fill in any additional details such as Batch, Sale price, Expiry date, Cost price, and enable Consumable if needed.
6. Click Create Stock to save.

**Expected result:** The new stock appears in the selected slot, and the product's available quantity is updated in related views.

### 17.2 Scenario 2: Investigate low-stock alerts and replenish

1. Open the Alerts section and filter by Type = Low stock and, if needed, by Severity = Critical.
2. Choose an alert and review the product and location details, then mark the alert as read when acknowledged.
3. For items that must be replenished, create the necessary inflow transactions (for example, after receiving a supplier delivery) and place the stock into specific racks and slots using the Add Stock workflow.
4. Optionally, check the Visualizations section to confirm that stock levels and movements now match expectations.

**Expected result:** Low-stock situations are resolved, alerts are cleared or reduced, and the inventory dashboards reflect the replenished quantities.

### 17.3 Scenario 3: Monitor warehouse performance over the last month

1. Open the Visualizations section.
2. Set filters, for example: Metric = Movement, Date range = Last 30 days, and select either All products or a critical product group.
3. Click Apply to generate graphs.
4. Review curve charts and inventory statistics (total stock value, movement today, items below minimum stock, warehouse occupancy) to understand trends.

**Expected result:** You obtain a clear picture of movement intensity, value changes, and pressure on storage capacity for the selected period.

## 18 Error Handling and Troubleshooting

### 18.1 Typical messages

- **Missing required field**: Ensure all mandatory inputs (marked as required) are completed before saving.
- **Duplicate code or name**: Change the code or name so that it is unique.
- **Insufficient stock**: Reduce the quantity or adjust inventory with the appropriate inflow.
- **Unauthorized action**: Contact your administrator if you need additional permissions.

### 18.2 General troubleshooting tips

- Refresh the page if new records are not visible.
- Clear search filters if a table appears empty unexpectedly.
- Verify your internet connection when pages do not load correctly.
- Additional routines: New types of automated checks and scheduled operations.
- Extended alerts: Extra alert categories or integrations with external systems.
- Advanced analytics: More dashboards, charts, and detailed analytical reports.

## 19 Best Practices

- Maintain clear and consistent naming conventions for locations, depots, aisles, racks, and products.
- Record transactions promptly to keep stock levels accurate.
- Review exports regularly for reconciliation with physical stock counts.
- Deactivate rather than delete entities whenever possible to preserve historical integrity.
- Check visualizations and alerts regularly to detect issues early.
# STORIUM
## Inventory Management System
### User Documentation

## Contents
1. [Introduction](#1-introduction)  
   - 1.1 [Key capabilities](#11-key-capabilities)  
2. [First-launch installation](#2-first-launch-installation)  
   - 2.1 [Downloading the installer](#21-downloading-the-installer)  
   - 2.2 [Installation options](#22-installation-options)  
   - 2.3 [First launch of STORIUM](#23-first-launch-of-storium)  
3. [Application Entry](#3-application-entry)  
   - 3.1 [Accessing the application](#31-accessing-the-application)  
   - 3.2 [Main menu](#32-main-menu)  
4. [Inventory Overview](#4-inventory-overview)  
   - 4.1 [Overview page](#41-overview-page)  
   - 4.2 [Inventory structure at a glance](#42-inventory-structure-at-a-glance)  
   - 4.3 [Common actions on the overview](#43-common-actions-on-the-overview)  
5. [Locations](#5-locations)  
   - 5.1 [Purpose](#51-purpose)  
   - 5.2 [Locations table](#52-locations-table)  
     - 5.2.1 [Available actions](#521-available-actions)  
   - 5.3 [Creating a location](#53-creating-a-location)  
6. [Depots](#6-depots)  
   - 6.1 [Purpose](#61-purpose)  
   - 6.2 [Depots table](#62-depots-table)  
     - 6.2.1 [Available features](#621-available-features)  
   - 6.3 [Adding a depot](#63-adding-a-depot)  
7. [Aisles](#7-aisles)  
   - 7.1 [Purpose](#71-purpose)  
   - 7.2 [Aisles table](#72-aisles-table)  
     - 7.2.1 [Supported features](#721-supported-features)  
   - 7.3 [Adding an aisle](#73-adding-an-aisle)  
8. [Racks](#8-racks)  
   - 8.1 [Purpose](#81-purpose)  
   - 8.2 [Racks table and management](#82-racks-table-and-management)  
     - 8.2.1 [Available actions](#821-available-actions)  
   - 8.3 [Adding a rack](#83-adding-a-rack)  
   - 8.4 [Hierarchical structure](#84-hierarchical-structure)  
9. [Slots & Stock Placement](#9-slots--stock-placement)  
   - 9.1 [Rack overview](#91-rack-overview)  
   - 9.2 [Slots by level](#92-slots-by-level)  
   - 9.3 [Adding stock](#93-adding-stock)  
     - 9.3.1 [Add Stock form](#931-add-stock-form)  
10. [Sources](#10-sources)  
   - 10.1 [Purpose](#101-purpose)  
   - 10.2 [Sources table](#102-sources-table)  
     - 10.2.1 [Actions per source](#1021-actions-per-source)  
   - 10.3 [Adding a new source](#103-adding-a-new-source)  
11. [Products](#11-products)  
   - 11.1 [Purpose](#111-purpose)  
   - 11.2 [Products table](#112-products-table)  
     - 11.2.1 [Actions per product](#1121-actions-per-product)  
   - 11.3 [Adding a new product](#113-adding-a-new-product)  
12. [Transactions](#12-transactions)  
   - 12.1 [Purpose](#121-purpose)  
   - 12.2 [Transaction history page](#122-transaction-history-page)  
     - 12.2.1 [Filtering options](#1221-filtering-options)  
     - 12.2.2 [Actions](#1222-actions)  
13. [Clients](#13-clients)  
   - 13.1 [Purpose](#131-purpose)  
   - 13.2 [Clients table](#132-clients-table)  
     - 13.2.1 [Actions per client](#1321-actions-per-client)  
   - 13.3 [Adding a client](#133-adding-a-client)  
14. [Visualizations & Analytics](#14-visualizations--analytics)  
   - 14.1 [Export options](#141-export-options)  
   - 14.2 [Filters panel](#142-filters-panel)  
   - 14.3 [Key statistics](#143-key-statistics)  
   - 14.4 [Stock level view](#144-stock-level-view)  
   - 14.5 [Movement view](#145-movement-view)  
   - 14.6 [Occupancy view](#146-occupancy-view)  
15. [Routines](#15-routines)  
   - 15.1 [Creating a new routine](#151-creating-a-new-routine)  
   - 15.2 [Routine overview and statistics](#152-routine-overview-and-statistics)  
   - 15.3 [Search and filters](#153-search-and-filters)  
   - 15.4 [Routines table](#154-routines-table)  
16. [Alerts](#16-alerts)  
   - 16.1 [Alert filters](#161-alert-filters)  
   - 16.2 [Alerts table](#162-alerts-table)  
   - 16.3 [Available actions](#163-available-actions)  
17. [Search, Filters, and Pagination](#17-search-filters-and-pagination)  
   - 17.1 [Search](#171-search)  
   - 17.2 [Filters](#172-filters)  
   - 17.3 [Pagination](#173-pagination)  
18. [Common User Scenarios](#18-common-user-scenarios)  
   - 18.1 [Scenario 1: Place new stock in a rack](#181-scenario-1-place-new-stock-in-a-rack)  
   - 18.2 [Scenario 2: Investigate low-stock alerts and replenish](#182-scenario-2-investigate-low-stock-alerts-and-replenish)  
   - 18.3 [Scenario 3: Monitor warehouse performance over the last month](#183-scenario-3-monitor-warehouse-performance-over-the-last-month)  
19. [Error Handling and Troubleshooting](#19-error-handling-and-troubleshooting)  
   - 19.1 [Typical messages](#191-typical-messages)  
   - 19.2 [General troubleshooting tips](#192-general-troubleshooting-tips)  
20. [Best Practices](#20-best-practices)

---
# STORIUM
## Inventory Management System
### User Documentation

---

## Introduction

The Inventory Management System "STORUIM" is a web-based application designed to help organizations structure, monitor, and control their stock across locations, depots, aisles, racks, and slots.  
It is intended for warehouse staff, storekeepers, sales teams, and managers who need a clear, real-time view of stock levels, product information, and inventory movements without requiring technical knowledge.

### Key capabilities

- Centralized overview of the entire inventory structure.
- Detailed management of locations, depots, aisles, racks, slots, and active stocks.
- Registration and tracking of products, sources (suppliers), clients, and transactions.
- Analytical visualizations, routines, and alerts to monitor inventory health.
- Powerful search, filtering, and export tools on all main data tables.

---

## First-launch installation

This section explains how to install the STORIUM desktop application and open it for the first time.  
Follow these steps on each computer that will run the system.

### Downloading the installer

1. Obtain the official STORIUM installer file ( `Storium.exe`).
2. Save the installer to a known folder on your computer, such as `Downloads` or the desktop.

### Installation options

During the installation process, the setup wizard will prompt you to configure a few options.

#### Select installation mode

Choose how the application will be installed:

- **For all users**: The application will be available to all user accounts on this computer.
- **For me only**: The application will be installed only for the current Windows user.

Select the option that matches your organization’s policy or your administrator’s instructions.

#### Select destination location

Choose the folder where the application will be installed, or keep the default recommended location provided by the wizard.  
If you are unsure, it is usually best to keep the default path.

#### Finish installation

After confirming your choices:

1. Click **Install** (if shown) and wait for the process to complete.
2. Click **Finish** to close the installer.

Once finished, the application is ready to be launched and used immediately from the Start menu or desktop shortcut.

### First launch of STORIUM

1. Open STORIUM from the Start menu or from the desktop shortcut created by the installer.
2. After a short loading time, the main menu appears with three options: **Enter**, **Support**, and **Exit**.
3. Click **Enter** to open the main application and access the inventory pages.
4. Use **Support** to read this documentation, or **Exit** to close the program.

---

## Application Entry

### Accessing the application

1. Open your web browser and navigate to the application URL, or start the desktop application if it is installed on your computer.
2. After the application loads successfully, the main menu (home screen) is displayed.

### Main menu

After accessing the application, a simple main menu is displayed with three options: **Enter**, **Support**, and **Exit**.  
Click **Enter** to open the main website and access all navigation pages (Locations, Sources, Products, Transactions, Clients, and other modules).  
Use **Support** to open the help and documentation area, and **Exit** to close the application session.

---

## Inventory Overview

### Overview page

After entering the system, the **Schema** page is displayed.  
This view provides a high-level snapshot of the inventory architecture and key metrics so that users can understand the current state at a glance.

### Inventory structure at a glance

The overview typically shows aggregated information for:

- Locations
- Depots
- Aisles
- Racks
- Slots
- Active stocks
- Products

Cards or counters may summarize how many of each element exist and whether there are warnings such as low stock.  
A **Manage Locations** action is available to open the detailed structural management area.

### Common actions on the overview

- Navigate directly to structural management (locations, depots, aisles, racks, slots).
- Refresh the panel to view the most recent data.

---

## Locations

### Purpose

The **Locations** section is used to manage all top-level physical or logical locations in which inventory is stored.  
Each location acts as the parent container for its depots, aisles, racks, and slots.

### Locations table

The Locations page presents a table listing all existing locations.  
Typical columns include: Location name, Address, Coordinates, Created Time, Actions.

#### Available actions

- **"+ Add"**: Open a form to create a new location with its basic details.

Each row generally provides an **"Actions"** menu:

- **Manage Depots**: Open the Depots view for the selected location.
- **Edit**: Modify the details of the location.
- **Remove**: Deactivate or remove the location, when allowed.

### Creating a location

1. Navigate to the **Locations** page.
2. Click **"+ Add"**.
3. Fill in required fields: Name, Address, and Coordinates.
4. Confirm and save the form.

**Expected result:** The new location appears in the Locations table and becomes available for depot creation.

---

## Depots

### Purpose

**Depots** represent subdivisions inside a location, such as areas, halls, or distinct storage zones.  
They help organize large locations into more manageable sections.

### Depots table

When a location is selected and **Manage Depots** is chosen, the **Depots** table is displayed for that location.  
The table lists all depots associated with the current location, usually with columns such as Depot name, Created time, and Actions.

#### Available features

- **"+ Add"**: Create a new depot in the current location.

Per-depot **Actions** commonly include:

- **View Aisles**: Open the Aisles view within this depot.
- **Edit**: Update depot details.
- **Remove**: Remove or deactivate the depot, subject to business rules.

### Adding a depot

1. Open the **Depots** view for the desired location.
2. Click **"+ Add"**.
3. Enter the depot name.
4. Click **"Create Depot"** to save the form.

**Expected result:** The depot is added to the list and will contain aisles, racks, and slots as needed.

---

## Aisles

### Purpose

**Aisles** are linear segments or corridors within a depot and provide an intermediate level of structure before racks and slots.  
They help physically locate products and simplify navigation inside a warehouse.

### Aisles table

In the Aisles view, all aisles belonging to the selected depot are listed.  
Columns typically include Name, Created time, and Actions.

#### Supported features

- **"+ Add"**: Create a new aisle.
- **"Export"**: Export the aisles table.

Per-aisle **Actions** include:

- **View Racks**: Open the Racks view within this aisle.
- **Edit**: Modify aisle attributes.
- **Remove**: Deactivate or remove the aisle.

### Adding an aisle

1. Navigate to the **Aisles** view for the chosen depot.
2. Click **"+ Add"**.
3. Provide the aisle name.
4. Save the form.

**Expected result:** The aisle appears in the table and can now contain racks.

---

## Racks

### Purpose

**Racks** represent vertical storage structures within an aisle, made up of multiple slots or levels.  
They are an essential part of the physical inventory layout, allowing precise mapping of where products are stored.

### Racks table and management

The Racks section shows all racks for the selected aisle.  
From here, racks can be created and managed.

#### Available actions

- **"+ Add"**: Create a new rack within the aisle.
- **"Edit"**: Change rack properties.
- **"Remove"**: Deactivate or remove the rack.

### Adding a rack

1. Navigate to the **Racks** view for the chosen Aisle.
2. Click **"+ Add"**.
3. Provide the Rack Face, Levels, Bays, Bins per bay.
4. Save the form.

### Hierarchical structure

The overall inventory schema is defined by the following hierarchy:

> Locations → Depots → Aisles → Racks → Slots

This structure ensures that each product can be assigned to a precise physical position and that navigation from high-level to low-level elements is straightforward.

---

## Slots & Stock Placement

The Rack view is used to manage slots and stock placements within a specific rack.  
This section allows precise control over how products are stored, tracked, and consumed within each rack and slot.

### Rack overview

Upon entering a rack, detailed rack information is displayed, including:

- Rack code
- Layout
- Levels
- Bays
- Bins
- Face type (for example, single face)

Context information is also shown so you always know where the rack is located in the inventory structure:

- Location
- Depot
- Aisle

This context ensures full traceability of stock placement within the inventory hierarchy.

### Slots by level

Slots are organized by levels within the rack.  
Each level typically displays:

- Bays and bins (for example, Bay 1, Bin 1)
- All existing stocks currently stored in each slot

This layout helps you visually understand how space is used and where each product is physically stored.

### Adding stock

To place new stock in a slot, select the option **"Add Stock"** on the desired slot.

#### Add Stock form

The stock creation form includes the following fields:

- **Product**: Product selection.
- **Quantity**: Number of units to place in the slot.
- **Stock strategy**:
  - FIFO
  - LIFO
  - JIT
- **Product type**:
  - Raw
  - WIP
  - To ship
  - Dead stock
  - Discrepancy
- **Batch**
- **Sale price**
- **Expiry date**
- **Cost price**
- **Consumable**: Option that can be enabled if applicable.

After completing the form, select **Create Stock** to confirm and save the stock placement in the chosen slot.

---

## Sources

### Purpose

The **Sources** section is used to manage suppliers and other entities that provide goods to the inventory.  
Maintaining accurate source data improves traceability and reporting on where products originate.

### Sources table

The Sources page typically contains:

- A structured list of all sources with identifiers and key contact details.
- A **"+ Add"** button for creating new sources.
- **Export** functionality to download the table.
- Filters to switch between the current view and all sources.
- A search field for finding sources by name, code, or other attributes.

#### Actions per source

- **Edit**: Update supplier information.
- **Remove**: Deactivate or remove a source as allowed.

### Adding a new source

1. Open the **Sources** section.
2. Click **"+ Add"**.
3. Enter the required supplier details such as name and contact information.
4. Enable the **"active"** button to activate that source.
5. Save the record.

**Expected result:** The new source appears in the table and becomes selectable in purchase or inflow processes.

---

## Products

### Purpose

The **Products** section manages all inventory items stored in the system.  
Accurate product data ensures correct transactions, valuation, and reporting.

### Products table

The Products page offers functionality similar to the Sources section:

- **"+ Add"**: Create new products.
- **"Export"**: Download the products list.
- Filters to switch between the current view and all products.
- Search by name, code, or other properties.

#### Actions per product

- **Edit**: Modify product attributes.
- **Remove**: Deactivate or remove the product.

### Adding a new product

1. Go to the **Products** section.
2. Click **"+ Add"**.
3. Provide product details such as Name, Category, Unit of Measure, and default pricing, select supplier, Description (optional), image URL (optional).
4. Save the record.

**Expected result:** The product becomes available for assignment to slots and for use in transactions.

---

## Transactions

### Purpose

The **Transactions** section tracks all inventory movements over time.  
It records entries, exits, and transfers so that stock levels remain consistent and auditable.

### Transaction history page

The Transaction History page presents a chronological list of all transactions in a table format.  
Typical columns include Date, Type, Notes, and Actions.

#### Filtering options

Transactions can be filtered using:

- **"Type"**: Automated, Manual, or Mixed.
- **"Date range"**: Today, This week, This month, or All.

#### Actions

- **View details**: Open a detailed view of the transaction, showing all related fields.
- **Export**: Download the transaction history for reporting or analysis.

---

## Clients

### Purpose

The **Clients** section manages customer or internal client records used in outgoing transactions.  
Up-to-date client information supports accurate invoicing and tracking of deliveries.

### Clients table

The Clients page supports:

- Adding new clients via the **"+ Add"** button.
- Exporting the clients table.
- Filtering between the current view and all clients.
- Searching by client name, or other fields.

#### Actions per client

- **"Edit"**: Update client details.
- **"Remove"**: Deactivate or remove the client where allowed.

### Adding a client

1. Open the **"Clients"** section.
2. Click **"+ Add"**.
3. Fill in the client's name, contact details and address.
4. Save the record.

**Expected result:** The new client is available for selection in transactions.

---

## Visualizations & Analytics

The **Visualizations & Analytics** section provides advanced insights into inventory performance through interactive charts, tables, and key metrics.  
All visualizations are dynamically updated based on the filters you select.

### Export options

You can export the current analytics view:

- **Export as PDF**: Generate a printable report of the visible charts and tables.
- **Export as CSV**: Download raw data that can be opened in spreadsheet tools for further analysis.

### Filters panel

Use the filtering controls to customize which analytics are displayed.

#### Visualization type

- Stock level
- Movement
- Occupancy

#### Date range

- Last 7 days
- Last 30 days
- Last 90 days

#### Products

- All products
- Specific product(s)

#### Locations

- All locations
- Specific location(s)

#### Types

- All types
- Raw Materials
- Work in progress
- Ready to ship

After choosing the desired filters, click **Apply Filters** to update the visualizations.

### Key statistics

Regardless of the selected visualization type, the following indicators remain visible:

- **Total stock value**
- **Movement today**
- **Below minimum level**: Number of products below their minimum stock.
- **Warehouse occupancy**: Percentage of used storage capacity.

These metrics provide a high-level snapshot of overall inventory health.

### Stock level view

When **Stock level** is selected, the dashboard focuses on inventory distribution and health.

#### Stock value trend

A time series chart visualizes how total stock value changes over the selected period.

#### Stock by depot

A chart represents quantity distribution across depots within the warehouse.

#### Low stock products

A list highlights products currently below their minimum stock threshold, helping you prioritize replenishment.

#### Depot stock value

A breakdown shows inventory value per depot, revealing which depots hold the most valuable stock.

#### Inventory health

You can filter inventory status to focus on:

- **Low stock**: A table including product, current quantity, minimum level, and status.
- **Out of stock**: A table including product, minimum level, and status.

#### Category distribution

A chart shows inventory value by product category, useful for understanding where capital is invested.

#### Expiry schedule

A list displays items expiring within the next 90 days to support timely rotation and clearance decisions.

#### Product placement

A searchable table allows you to locate products inside the warehouse, showing their exact placement (location, depot, aisle, rack, slot).

#### Supplier performance

A metric presents the average supplier lead time (in days), helping evaluate how quickly suppliers deliver stock.

### Movement view

When **Movement** is selected, the dashboard focuses on transaction flow and stock movements.

#### Movement log

A detailed table lists inventory transactions, including what was moved, when, and in which direction.

#### Movement over time

A chart illustrates movement trends across the selected date range, making peaks and slow periods easier to identify.

#### Quantity by transaction type

A histogram shows:

- Transaction types (for example, inflow, outflow, transfer)
- Total units moved per type

#### Depot stock value

A view of inventory value distribution across depots, aligned with the chosen movement filters.

#### Expiry schedule

Items expiring within the next 90 days are listed so you can relate stock movements to upcoming expiries.

#### Supplier performance

Average supplier lead time in days is shown to connect movement behaviour with supplier reliability.

### Occupancy view

When **Occupancy** is selected, the dashboard provides insights into warehouse space utilisation.

#### Warehouse occupancy

A visualization represents how much of the available warehouse capacity is currently used.  
This helps identify:

- Underutilised storage areas
- Overcrowded zones
- Opportunities to optimise stock placement

#### Additional insights

For consistency with other views, additional analytics such as:

- Depot stock value
- Expiry schedule
- Supplier performance

are displayed in a similar format, allowing easy comparison across different perspectives.

---

## Routines

The **Routines** section is used to configure and manage automated inventory processes.  
Routines help enforce business rules, reduce manual work, and ensure that important checks are executed on a regular basis.

### Creating a new routine

1. Click **+ New Routine** to open the routine configuration modal.

#### Basic configuration

- **Routine name**: Give the routine a unique, identifiable name.
- **Frequency**: Define when the check runs:
  - **Daily**: Runs automatically at 09:00.
  - **Weekly**: Runs once per week at the configured time.
  - **Real Time (Debug)**: Runs continuously for testing purposes.

#### Trigger and scope

- **Monitoring type**: Choose what condition the routine watches for:
  - Low stock
  - Over stock
  - Expired
- **Scope**: Define which items are monitored:
  - All products
  - Specific product (user selection)

#### Corresponding actions

- **Auto re-order**: Automatically create a re-order when the condition is met:
  - **Fill to max**: Top up the stock to its maximum capacity.
  - **Specific amount**: Enter a custom quantity to order.
- **Create alerts**: Generate a system notification when the trigger is satisfied, with levels such as *Warning*, *Critical*, or *Info*.
- **Send email**: Enter one or more destination email addresses to receive the alert message.

#### Finalize

- **Cancel**: Discard all changes and close the modal without saving.
- **Save Routine**: Store the configuration. A small red-themed notification (toast) confirms the save, and the new routine appears immediately in the **Routines** table.

### Routine overview and statistics

At the top of the Routines section, summary statistics give a quick view of automation status, such as:

- Active routines
- Critical errors
- Executions (total or over a selected period)

These indicators help monitor whether automations are running as expected or require attention.

### Search and filters

Routines can be filtered by frequency:

- All
- Daily
- Weekly
- On event

A search box allows users to quickly locate a specific routine by name or trigger description.

### Routines table

The routines table lists all configured routines with information such as:

- Routine name
- Promise / trigger
- Frequency
- Last run status

**Available actions**

For each routine, typical actions include:

- Run the routine manually
- Edit the routine configuration
- Delete (or deactivate) the routine

---

## Alerts

The **Alerts** section centralizes system-generated notifications related to inventory conditions.  
It ensures that users can quickly see and respond to critical issues such as low stock, overstock, or expiry risks.

### Alert filters

Alerts can be filtered using several criteria.

#### Type

- All types
- Low stock
- Overstock
- Expiry
- Reorder

#### Severity

- All severity levels
- Critical
- Warning
- Info

#### Status

- Unread only
- Show all

These filters help users focus on the most important or urgent alerts first.

### Alerts table

The alerts table lists all notifications generated by the system.  
Rows are typically ordered by newest first so recent events are easy to see.

### Available actions

For each alert, users can:

- **Mark as read** to acknowledge the alert and remove it from the unread list.
- **Delete** the alert when it is no longer needed in the interface.

These actions help maintain visibility and control over critical inventory events while keeping the alerts list organized.

---

## Search, Filters, and Pagination

### Search

Most tables provide a search bar at the top.  
Typing part of a name, code, or identifier filters the rows in real time or after pressing a search button.

### Filters

Filter panels or dropdowns allow users to limit visible data by status, date range, location, category, or other criteria.  
Filters help focus on relevant records and reduce visual clutter.

### Pagination

When there are many records, tables are split into pages.  
Use the page numbers, **Previous**, and **Next** buttons at the bottom to move between pages.

---

## Common User Scenarios

### Scenario 1: Place new stock in a rack

1. Navigate through the structure: select the **Location**, then the **Depot**, **Aisle**, and finally open the desired **Rack** view.
2. In the rack overview, locate the correct **level**, **bay**, and **bin** where the stock should be stored.
3. On the chosen slot, click **Add Stock**.
4. In the Add Stock form, select the **Product**, enter the **Quantity**, choose the **Stock strategy** (FIFO, LIFO, or JIT), and set the appropriate **Product type** (for example, Raw or To ship).
5. Fill in any additional details such as **Batch**, **Sale price**, **Expiry date**, **Cost price**, and enable **Consumable** if needed.
6. Click **Create Stock** to save.

**Expected result:** The new stock appears in the selected slot, and the product’s available quantity is updated in related views.

### Scenario 2: Investigate low-stock alerts and replenish

1. Open the **Alerts** section and filter by **Type = Low stock** and, if needed, by **Severity = Critical**.
2. Choose an alert and review the product and location details, then mark the alert as read when acknowledged.
3. For items that must be replenished, create the necessary **inflow** transactions (for example, after receiving a supplier delivery) and place the stock into specific racks and slots using the **Add Stock** workflow.
4. Optionally, check the **Visualizations** section to confirm that stock levels and movements now match expectations.

**Expected result:** Low-stock situations are resolved, alerts are cleared or reduced, and the inventory dashboards reflect the replenished quantities.

### Scenario 3: Monitor warehouse performance over the last month

1. Open the **Visualizations** section.
2. Set filters, for example: **Metric = Movement**, **Date range = Last 30 days**, and select either **All products** or a critical product group.
3. Click **Apply** to generate graphs.
4. Review curve charts and **inventory statistics** (total stock value, movement today, items below minimum stock, warehouse occupancy) to understand trends.

**Expected result:** You obtain a clear picture of movement intensity, value changes, and pressure on storage capacity for the selected period.

---

## Error Handling and Troubleshooting

### Typical messages

- **Missing required field**: Ensure all mandatory inputs (marked as required) are completed before saving.
- **Duplicate code or name**: Change the code or name so that it is unique.
- **Insufficient stock**: Reduce the quantity or adjust inventory with the appropriate inflow.
- **Unauthorized action**: Contact your administrator if you need additional permissions.

### General troubleshooting tips

- Refresh the page if new records are not visible.
- Clear search filters if a table appears empty unexpectedly.
- Verify your internet connection when pages do not load correctly.

Additional improvement ideas:

- Additional routines: New types of automated checks and scheduled operations.
- Extended alerts: Extra alert categories or integrations with external systems.
- Advanced analytics: More dashboards, charts, and detailed analytical reports.

---

## Best Practices

- Maintain clear and consistent naming conventions for locations, depots, aisles, racks, and products.
- Record transactions promptly to keep stock levels accurate.
- Review exports regularly for reconciliation with physical stock counts.
- Deactivate rather than delete entities whenever possible to preserve historical integrity.
- Check visualizations and alerts regularly to detect issues early.
