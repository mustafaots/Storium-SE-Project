# Storium IMS - Database Setup Guide for Users

## Overview

Storium IMS is an Inventory Management System that requires **MySQL Database** to store and manage your inventory data. This guide walks you through the complete setup process.

**System Requirements:**
- Windows 7 or later
- MySQL 5.7 or higher
- 500 MB disk space minimum
- Internet connection (for MySQL download)

---

## Step 1: Install MySQL Server

### 1.1 Download MySQL Installer

1. Visit the official MySQL website: https://dev.mysql.com/downloads/installer/
2. Download **MySQL Installer for Windows** (choose the larger installer file, approximately 235 MB)
3. Select the version: **Windows (x86, 32-bit)** or **Windows (x86, 64-bit)** based on your system

### 1.2 Run the MySQL Installer

1. Double-click the downloaded `.msi` file
2. Click **Next** on the welcome screen
3. Accept the license agreement and click **Next**

### 1.3 Choose Setup Type

Select **Server only** (recommended for Storium) or **Developer Default**

- **Server only**: Installs just the MySQL database server (~200 MB)
- **Developer Default**: Includes additional tools (~1 GB)

Click **Next** to proceed.

### 1.4 MySQL Server Configuration

1. Keep the default settings:
   - **Config Type**: Development Machine
   - **TCP Port**: 3306
   - Click **Next**

2. **Authentication Method** screen:
   - Select: "Use Legacy Authentication Plugin"
   - Click **Next**

3. **MySQL Server User Accounts** screen:
   - **Root Account Password**: Set to `mysql` (lowercase, **important!**)
     - Confirm password: `mysql`
   - **MySQL User Accounts**: Leave empty (skip this)
   - Click **Next**

4. **Windows Service** screen:
   - Check: "Configure MySQL Server as a Windows Service"
   - Service Name: `MySQL80` (or similar)
   - Start the MySQL Server at System Startup: **Checked**
   - Click **Next**

5. **Apply Configuration**:
   - Click **Execute**
   - Wait for all steps to complete (green checkmarks)
   - Click **Finish**

### 1.5 Verify MySQL Installation

1. Open **Command Prompt** (press `Win + R`, type `cmd`, press Enter)
2. Type the following command and press Enter:
   ```bash
   mysql -u root -p
   ```
3. When prompted for password, enter: `mysql`
4. You should see the MySQL prompt: `mysql>`
5. Type `exit` to close

✅ **If you see the MySQL prompt, your installation is successful!**

---

## Step 2: Create the Storium Database

You should have received a **`schema.sql`** file along with Storium. This file contains all the database tables and structure.

### Method A: Using Command Prompt (Recommended)

1. **Locate the schema.sql file**:
   - Find where you saved the `schema.sql` file (usually in a setup folder)
   - Example: `C:\Users\YourName\Downloads\schema.sql`

2. **Open Command Prompt**:
   - Press `Win + R`
   - Type `cmd`
   - Press Enter

3. **Navigate to the folder containing schema.sql**:
   ```bash
   cd "C:\Users\YourName\Downloads"
   ```
   *(Replace with your actual path)*

4. **Create the database and import the schema**:
   ```bash
   mysql -u root -p storium_ims_rdb < schema.sql
   ```
   - When prompted for password, enter: `mysql`
   - Wait for the process to complete (this may take 10-30 seconds)
   - You should return to the command prompt with no errors

5. **Verify the database was created**:
   ```bash
   mysql -u root -p
   ```
   - Enter password: `mysql`
   - Type: `SHOW DATABASES;`
   - You should see `storium_ims_rdb` in the list
   - Type `exit` to close

### Method B: Using MySQL Workbench (GUI Method)

If you installed MySQL Workbench (part of Developer Default):

1. **Open MySQL Workbench**
2. Click on your MySQL connection (default: `Local instance MySQL80`)
3. Enter password: `mysql`
4. Go to **File** → **Open SQL Script**
5. Select `schema.sql`
6. Click the **Execute** button (lightning bolt icon) in the toolbar
7. Wait for completion - you should see: "Schema `storium_ims_rdb` created successfully"

---

## Step 3: Verify Database Setup

Run this verification to confirm everything is working:

1. **Open Command Prompt**
2. **Connect to MySQL**:
   ```bash
   mysql -u root -p
   ```
   - Password: `mysql`

3. **Check the database exists**:
   ```sql
   USE storium_ims_rdb;
   SHOW TABLES;
   ```

4. **You should see these tables**:
   ```
   action_history
   aisles
   alerts
   clients
   depots
   locations
   product_sources
   products
   rack_slots
   racks
   routines
   sources
   stocks
   transactions
   ```

5. **Type `exit` to close**

✅ **If you see all 14 tables, your database is properly configured!**

---

## Step 4: Launch Storium

1. Locate the **`Storium.exe`** file on your computer
2. Double-click to launch the application
3. The application should automatically connect to your MySQL database
4. You're ready to start using Storium!

---

## Step 5: Configuration (Optional)

### If MySQL Password is Different

If you set a different password during MySQL installation (not `mysql`), you need to create a configuration file:

1. **Create a new text file**:
   - Right-click in the folder where `Storium.exe` is located
   - Select **New** → **Text Document**
   - Name it: `.env` (including the dot)

2. **Edit the .env file**:
   - Open it with Notepad
   - Copy and paste this content:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_password
   DB_NAME=storium_ims_rdb
   DB_PORT=3306
   PORT=3001
   ```
   - Replace `your_actual_password` with your MySQL root password

3. **Save the file** (Ctrl + S)

4. **Restart Storium.exe**

---

## Troubleshooting

### Error: "Access Denied for user 'root'@'localhost'"

**Solution:**
- You may have used a different password than `mysql`
- Go to **Step 5: Configuration** and create a `.env` file with your correct password
- Verify your MySQL password with: `mysql -u root -p` in Command Prompt

### Error: "Unknown database 'storium_ims_rdb'"

**Solution:**
- The schema.sql file was not imported correctly
- Repeat **Step 2: Create the Storium Database**
- Make sure you see no error messages during import

### Error: "MySQL Server is not running"

**Solution:**
- Open **Services** app (press `Win + R`, type `services.msc`, press Enter)
- Look for **MySQL80** (or similar)
- If stopped, right-click and select **Start**
- Restart Storium.exe

### Error: "Cannot connect to database"

**Solution:**
1. Verify MySQL is running (see above)
2. Verify the `.env` file exists (if you set a custom password)
3. Restart your computer and try again
4. Check that port 3306 is not blocked by firewall:
   - Open Windows Defender Firewall
   - Click "Allow an app through firewall"
   - Ensure MySQL is in the list

### Error: "Storium.exe won't start"

**Solution:**
- Ensure MySQL Server is running (check Services)
- Delete any `.env` file if you don't have a custom password
- Restart your computer
- Try running Storium.exe again

---

## Important Notes

⚠️ **Backup Your Data Regularly**

Your inventory data is stored in the MySQL database. To back up:

1. Open Command Prompt
2. Type:
   ```bash
   mysqldump -u root -p storium_ims_rdb > backup.sql
   ```
3. Enter password: `mysql`
4. Save the `backup.sql` file in a safe location

To restore from backup:
   ```bash
   mysql -u root -p storium_ims_rdb < backup.sql
   ```

---

## Support Resources

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Storium Documentation**: [See included documentation files]
- **Windows Services Management**: Press `Win + R`, type `services.msc`

---

## Quick Reference

| Item | Value |
|------|-------|
| **Database Name** | `storium_ims_rdb` |
| **MySQL User** | `root` |
| **Default Password** | `mysql` |
| **MySQL Port** | `3306` |
| **Application Port** | `3001` |
| **Schema File** | `schema.sql` |

---

**Last Updated**: January 2026
**Storium Version**: 1.0.0
