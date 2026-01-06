// ========================================
// USER MANAGEMENT - AG GRID
// ========================================

var gridApi;
var gridOptions;
var currentUserId = null;
var selectedRows = [];

// ========================================
// INITIALIZE
// ========================================
$(document).ready(function () {
    console.log('👥 Initializing User Management...');

    initAgGrid();
    loadUsers();
    registerEvents();

    console.log('✅ User Management initialized!');
});

// ========================================
// AG GRID SETUP
// ========================================
function initAgGrid() {
    const columnDefs = [
        {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50,
            pinned: 'left',
            lockPosition: true,
            suppressMenu: true,
            filter: false
        },
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            hide: true
        },
        {
            field: 'userName',
            headerName: 'Username',
            width: 150,
            pinned: 'left',
            cellRenderer: function (params) {
                return `<strong>${params.value}</strong>`;
            }
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200,
            cellRenderer: function (params) {
                return `<i class="fas fa-envelope"></i> ${params.value}`;
            }
        },
        {
            field: 'fullName',
            headerName: 'Họ tên',
            width: 180,
            valueGetter: function (params) {
                const firstName = params.data.firstName || '';
                const lastName = params.data.lastName || '';
                return `${firstName} ${lastName}`.trim() || '-';
            },
            cellRenderer: function (params) {
                if (!params.value || params.value === '-') return '-';
                return `<i class="fas fa-user"></i> ${params.value}`;
            }
        },
        {
            field: 'phoneNumber',
            headerName: 'SĐT',
            width: 130,
            cellRenderer: function (params) {
                if (!params.value) return '-';
                return `<i class="fas fa-phone"></i> ${params.value}`;
            }
        },
        {
            field: 'isActive',
            headerName: 'Hoạt động',
            width: 120,
            cellRenderer: function (params) {
                if (params.value) {
                    return '<span class="status-badge status-active">Hoạt động</span>';
                } else {
                    return '<span class="status-badge status-inactive">Không hoạt động</span>';
                }
            }
        },
        {
            field: 'emailConfirmed',
            headerName: 'Email xác nhận',
            width: 130,
            cellRenderer: function (params) {
                if (params.value) {
                    return '<i class="fas fa-check-circle text-success"></i> Đã xác nhận';
                } else {
                    return '<i class="fas fa-times-circle text-danger"></i> Chưa xác nhận';
                }
            }
        },
        {
            field: 'twoFactorEnabled',
            headerName: '2FA',
            width: 100,
            cellRenderer: function (params) {
                if (params.value) {
                    return '<i class="fas fa-shield-alt text-success"></i> Bật';
                } else {
                    return '<i class="fas fa-shield-alt text-muted"></i> Tắt';
                }
            }
        },
        {
            field: 'isLocked',
            headerName: 'Trạng thái khóa',
            width: 130,
            valueGetter: function (params) {
                if (params.data.lockoutEnd) {
                    const lockoutDate = new Date(params.data.lockoutEnd);
                    return lockoutDate > new Date();
                }
                return false;
            },
            cellRenderer: function (params) {
                if (params.value) {
                    return '<span class="badge badge-danger">Đang khóa</span>';
                } else {
                    return '<span class="badge badge-success">Không khóa</span>';
                }
            }
        },
        {
            field: 'lockoutEnd',
            headerName: 'Khóa đến',
            width: 150,
            valueFormatter: function (params) {
                if (!params.value) return '-';
                const date = new Date(params.value);
                if (date < new Date()) return '-';
                return date.toLocaleString('vi-VN');
            }
        },
        {
            field: 'loginUtc',
            headerName: 'Lần đăng nhập cuối',
            width: 160,
            valueFormatter: function (params) {
                if (!params.value) return 'Chưa đăng nhập';
                return new Date(params.value).toLocaleString('vi-VN');
            }
        },
        {
            field: 'createdAtUtc',
            headerName: 'Ngày tạo',
            width: 150,
            valueFormatter: function (params) {
                if (!params.value) return '';
                return new Date(params.value).toLocaleString('vi-VN');
            }
        },
        {
            field: 'createdBy',
            headerName: 'Người tạo',
            width: 130
        },
        {
            headerName: 'Thao tác',
            width: 280,
            pinned: 'right',
            cellRenderer: function (params) {
                const isLocked = params.data.lockoutEnd && new Date(params.data.lockoutEnd) > new Date();

                const lockBtn = isLocked
                    ? `<button class="btn btn-sm btn-info action-btn" onclick="unlockUser(${params.data.id})" title="Mở khóa">
                        <i class="fas fa-unlock"></i>
                    </button>`
                    : `<button class="btn btn-sm btn-warning action-btn" onclick="showLockModal(${params.data.id}, '${params.data.userName}')" title="Khóa">
                        <i class="fas fa-lock"></i>
                    </button>`;

                return `
                    <button class="btn btn-sm btn-primary action-btn" onclick="editUser(${params.data.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success action-btn" onclick="viewUser(${params.data.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${lockBtn}
                    <button class="btn btn-sm btn-secondary action-btn" onclick="showChangePasswordModal(${params.data.id}, '${params.data.userName}')" title="Đổi mật khẩu">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn btn-sm btn-info action-btn" onclick="showLoginHistory(${params.data.id}, '${params.data.userName}')" title="Lịch sử">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="btn btn-sm btn-danger action-btn" onclick="deleteUser(${params.data.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
            },
            filter: false,
            sortable: false
        }
    ];

    gridOptions = {
        columnDefs: columnDefs,
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true
        },
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
        pagination: true,
        paginationPageSize: 50,
        paginationPageSizeSelector: [25, 50, 100, 200],
        rowHeight: 45,
        headerHeight: 45,
        animateRows: true,
        enableCellTextSelection: true,
        onSelectionChanged: onSelectionChanged,
        onGridReady: function (params) {
            gridApi = params.api;
            params.api.sizeColumnsToFit();
            console.log('✅ AG Grid ready!');
        }
    };

    const eGridDiv = document.querySelector('#userGrid');
    gridApi = agGrid.createGrid(eGridDiv, gridOptions);
}

// ========================================
// REGISTER EVENTS
// ========================================
function registerEvents() {
    // Search
    $('#btnSearch').on('click', loadUsers);

    // Reset
    $('#btnReset').on('click', function () {
        $('#txtSearchKeyword').val('');
        $('#txtUserName').val('');
        $('#txtEmail').val('');
        $('#ddlIsActive').val('true');
        $('#ddlIsLocked').val('');
        $('#txtFromDate').val('');
        $('#txtToDate').val('');
        loadUsers();
    });

    // Add
    $('#btnAdd').on('click', showAddModal);

    // Save
    $('#btnSave').on('click', saveUser);

    // Lock/Unlock
    $('#btnLock').on('click', bulkLockUsers);
    $('#btnUnlock').on('click', bulkUnlockUsers);
    $('#btnConfirmLock').on('click', confirmLock);

    // Bulk Delete
    $('#btnBulkDelete').on('click', bulkDeleteUsers);

    // Export
    $('#btnExport').on('click', exportToExcel);

    // Refresh
    $('#btnRefresh').on('click', loadUsers);

    // Statistics
    $('#btnStatistics').on('click', showStatistics);

    // Confirm Delete
    $('#btnConfirmDelete').on('click', confirmDelete);

    // Change Password
    $('#btnChangePassword').on('click', changePassword);

    // Enter to search
    $('#txtSearchKeyword, #txtUserName, #txtEmail').on('keypress', function (e) {
        if (e.which === 13) {
            loadUsers();
        }
    });
}

// ========================================
// LOAD USERS
// ========================================
function loadUsers() {
    console.log('📥 Loading users...');

    const searchParams = {
        searchKeyword: $('#txtSearchKeyword').val(),
        userName: $('#txtUserName').val(),
        email: $('#txtEmail').val(),
        isActive: $('#ddlIsActive').val() === '' ? null : $('#ddlIsActive').val() === 'true',
        isLocked: $('#ddlIsLocked').val() === '' ? null : $('#ddlIsLocked').val() === 'true',
        fromDate: $('#txtFromDate').val(),
        toDate: $('#txtToDate').val(),
        pageNumber: 1,
        pageSize: 1000
    };

    $.ajax({
        url: '/UserAccount/GetUsers',
        type: 'GET',
        data: searchParams,
        success: function (response) {
            console.log('📥 Response:', response);

            if (response.success) {
                gridApi.setGridOption('rowData', response.data);
                updateStatusBar(response.totalRecords);
                updateLastUpdateTime();
                console.log('✅ Loaded', response.totalRecords, 'users');
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('❌ Error loading users:', error);
            showError('Lỗi khi tải dữ liệu: ' + error);
        }
    });
}

// ========================================
// SHOW ADD MODAL
// ========================================
function showAddModal() {
    currentUserId = null;
    $('#modalTitle').text('Thêm người dùng mới');
    $('#userForm')[0].reset();
    $('#userId').val('');
    $('#isActive').val('true');
    $('#passwordSection').show();
    $('#password').prop('required', true);
    $('#confirmPassword').prop('required', true);
    $('#userModal').modal('show');
}

// ========================================
// EDIT USER
// ========================================
function editUser(id) {
    console.log('✏️ Editing user:', id);
    currentUserId = id;

    $.ajax({
        url: '/UserAccount/GetUserById',
        type: 'GET',
        data: { id: id },
        success: function (response) {
            if (response.success) {
                const user = response.data;

                $('#modalTitle').text('Sửa thông tin người dùng');
                $('#userId').val(user.id);
                $('#userName').val(user.userName);
                $('#email').val(user.email);
                $('#firstName').val(user.firstName);
                $('#lastName').val(user.lastName);
                $('#phoneNumber').val(user.phoneNumber);
                $('#isActive').val(user.isActive.toString());
                $('#emailConfirmed').prop('checked', user.emailConfirmed);
                $('#phoneNumberConfirmed').prop('checked', user.phoneNumberConfirmed);
                $('#twoFactorEnabled').prop('checked', user.twoFactorEnabled);

                $('#passwordSection').hide();
                $('#password').prop('required', false);
                $('#confirmPassword').prop('required', false);

                $('#userModal').modal('show');
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi tải thông tin người dùng: ' + error);
        }
    });
}

// ========================================
// VIEW USER
// ========================================
function viewUser(id) {
    editUser(id);
    $('#userForm input, #userForm select').prop('readonly', true);
    $('#userForm select').prop('disabled', true);
    $('#userForm input[type="checkbox"]').prop('disabled', true);
    $('#btnSave').hide();

    $('#userModal').on('hidden.bs.modal', function () {
        $('#userForm input, #userForm select').prop('readonly', false);
        $('#userForm select').prop('disabled', false);
        $('#userForm input[type="checkbox"]').prop('disabled', false);
        $('#btnSave').show();
    });
}

// Continued in Part 2...
// ========================================
// USER.JS - PART 2
// ========================================

// ========================================
// SAVE USER
// ========================================
function saveUser() {
    // Validation
    if (!$('#userName').val()) {
        showWarning('Vui lòng nhập username');
        $('#userName').focus();
        return;
    }

    if (!$('#email').val()) {
        showWarning('Vui lòng nhập email');
        $('#email').focus();
        return;
    }

    const isCreate = !currentUserId || currentUserId === null;

    if (isCreate) {
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();

        if (!password) {
            showWarning('Vui lòng nhập mật khẩu');
            $('#password').focus();
            return;
        }

        if (password.length < 6) {
            showWarning('Mật khẩu phải có ít nhất 6 ký tự');
            $('#password').focus();
            return;
        }

        if (password !== confirmPassword) {
            showWarning('Mật khẩu xác nhận không khớp');
            $('#confirmPassword').focus();
            return;
        }
    }

    const userData = {
        id: $('#userId').val() ? parseInt($('#userId').val()) : 0,
        userName: $('#userName').val(),
        email: $('#email').val(),
        firstName: $('#firstName').val(),
        lastName: $('#lastName').val(),
        phoneNumber: $('#phoneNumber').val(),
        isActive: $('#isActive').val() === 'true',
        emailConfirmed: $('#emailConfirmed').is(':checked'),
        phoneNumberConfirmed: $('#phoneNumberConfirmed').is(':checked'),
        twoFactorEnabled: $('#twoFactorEnabled').is(':checked')
    };

    if (isCreate) {
        userData.password = $('#password').val();
        userData.confirmPassword = $('#confirmPassword').val();
    }

    const url = isCreate ? '/UserAccount/CreateUser' : '/UserAccount/UpdateUser';
    const method = isCreate ? 'POST' : 'PUT';

    console.log(isCreate ? '➕ Creating user...' : '✏️ Updating user...');

    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#userModal').modal('hide');
                loadUsers();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi lưu người dùng: ' + error);
        }
    });
}

// ========================================
// DELETE USER
// ========================================
function deleteUser(id) {
    currentUserId = id;
    $('#deleteModal').modal('show');
}

function confirmDelete() {
    if (!currentUserId) return;

    console.log('🗑️ Deleting user:', currentUserId);

    $.ajax({
        url: '/UserAccount/DeleteUser',
        type: 'DELETE',
        data: { id: currentUserId },
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#deleteModal').modal('hide');
                loadUsers();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi xóa người dùng: ' + error);
        }
    });
}

// ========================================
// BULK DELETE
// ========================================
function bulkDeleteUsers() {
    if (selectedRows.length === 0) {
        showWarning('Vui lòng chọn ít nhất một người dùng để xóa');
        return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedRows.length} người dùng đã chọn?`)) {
        return;
    }

    const userIds = selectedRows.map(row => row.id);

    console.log('🗑️ Bulk deleting users:', userIds);

    $.ajax({
        url: '/UserAccount/BulkDeleteUsers',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ userIds: userIds }),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                loadUsers();
                selectedRows = [];
                updateSelectedCount();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi xóa người dùng: ' + error);
        }
    });
}

// ========================================
// CHANGE PASSWORD
// ========================================
function showChangePasswordModal(userId, userName) {
    $('#changePasswordUserId').val(userId);
    $('#changePasswordUserName').val(userName);
    $('#newPassword').val('');
    $('#confirmNewPassword').val('');
    $('#changePasswordModal').modal('show');
}

function changePassword() {
    const userId = parseInt($('#changePasswordUserId').val());
    const newPassword = $('#newPassword').val();
    const confirmNewPassword = $('#confirmNewPassword').val();

    if (!newPassword) {
        showWarning('Vui lòng nhập mật khẩu mới');
        $('#newPassword').focus();
        return;
    }

    if (newPassword.length < 6) {
        showWarning('Mật khẩu phải có ít nhất 6 ký tự');
        $('#newPassword').focus();
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showWarning('Mật khẩu xác nhận không khớp');
        $('#confirmNewPassword').focus();
        return;
    }

    console.log('🔑 Changing password for user:', userId);

    $.ajax({
        url: '/UserAccount/ChangePassword',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            userId: userId,
            newPassword: newPassword,
            confirmPassword: confirmNewPassword
        }),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#changePasswordModal').modal('hide');
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi đổi mật khẩu: ' + error);
        }
    });
}

// ========================================
// LOCK USER
// ========================================
function showLockModal(userId, userName) {
    $('#lockUserId').val(userId);
    $('#lockUserName').text(userName);
    $('#lockDuration').val('30');
    $('#lockModal').modal('show');
}

function confirmLock() {
    const userId = parseInt($('#lockUserId').val());
    const duration = $('#lockDuration').val();
    const lockoutMinutes = duration === '' ? null : parseInt(duration);

    console.log('🔒 Locking user:', userId, 'for', lockoutMinutes, 'minutes');

    $.ajax({
        url: '/UserAccount/LockUser',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            userId: userId,
            isLocked: true,
            lockoutMinutes: lockoutMinutes
        }),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#lockModal').modal('hide');
                loadUsers();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi khóa tài khoản: ' + error);
        }
    });
}

// ========================================
// UNLOCK USER
// ========================================
function unlockUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn mở khóa tài khoản này?')) {
        return;
    }

    console.log('🔓 Unlocking user:', userId);

    $.ajax({
        url: '/UserAccount/UnlockUser',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ userId: userId }),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                loadUsers();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi mở khóa tài khoản: ' + error);
        }
    });
}

// ========================================
// BULK LOCK/UNLOCK
// ========================================
function bulkLockUsers() {
    if (selectedRows.length === 0) {
        showWarning('Vui lòng chọn ít nhất một người dùng để khóa');
        return;
    }

    // Filter only unlocked users
    var unlockedUsers = selectedRows.filter(row => {
        if (!row.lockoutEnd) return true;
        return new Date(row.lockoutEnd) <= new Date();
    });

    if (unlockedUsers.length === 0) {
        showWarning('Tất cả người dùng đã chọn đã bị khóa');
        return;
    }

    if (!confirm(`Khóa ${unlockedUsers.length} người dùng đã chọn trong 30 phút?`)) {
        return;
    }

    console.log('🔒 Bulk locking users');

    let completed = 0;
    let errors = 0;

    unlockedUsers.forEach(function (user) {
        $.ajax({
            url: '/UserAccount/LockUser',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ userId: user.id, isLocked: true, lockoutMinutes: 30 }),
            success: function (response) {
                completed++;
                if (completed + errors === unlockedUsers.length) {
                    showSuccess(`Đã khóa ${completed} người dùng` + (errors > 0 ? ` (${errors} lỗi)` : ''));
                    loadUsers();
                    selectedRows = [];
                    updateSelectedCount();
                }
            },
            error: function () {
                errors++;
                if (completed + errors === unlockedUsers.length) {
                    showError(`Khóa thất bại ${errors}/${unlockedUsers.length} người dùng`);
                    loadUsers();
                }
            }
        });
    });
}

function bulkUnlockUsers() {
    if (selectedRows.length === 0) {
        showWarning('Vui lòng chọn ít nhất một người dùng để mở khóa');
        return;
    }

    // Filter only locked users
    var lockedUsers = selectedRows.filter(row => {
        if (!row.lockoutEnd) return false;
        return new Date(row.lockoutEnd) > new Date();
    });

    if (lockedUsers.length === 0) {
        showWarning('Không có người dùng nào bị khóa trong danh sách đã chọn');
        return;
    }

    if (!confirm(`Mở khóa ${lockedUsers.length} người dùng đã chọn?`)) {
        return;
    }

    console.log('🔓 Bulk unlocking users');

    let completed = 0;
    let errors = 0;

    lockedUsers.forEach(function (user) {
        $.ajax({
            url: '/UserAccount/UnlockUser',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ userId: user.id }),
            success: function (response) {
                completed++;
                if (completed + errors === lockedUsers.length) {
                    showSuccess(`Đã mở khóa ${completed} người dùng` + (errors > 0 ? ` (${errors} lỗi)` : ''));
                    loadUsers();
                    selectedRows = [];
                    updateSelectedCount();
                }
            },
            error: function () {
                errors++;
                if (completed + errors === lockedUsers.length) {
                    showError(`Mở khóa thất bại ${errors}/${lockedUsers.length} người dùng`);
                    loadUsers();
                }
            }
        });
    });
}

// ========================================
// LOGIN HISTORY
// ========================================
function showLoginHistory(userId, userName) {
    $('#historyUserName').text(`Người dùng: ${userName}`);
    $('#loginHistoryBody').html('<tr><td colspan="3" class="text-center">Đang tải...</td></tr>');
    $('#loginHistoryModal').modal('show');

    console.log('📜 Loading login history for user:', userId);

    $.ajax({
        url: '/UserAccount/GetLoginHistory',
        type: 'GET',
        data: { userId: userId, top: 10 },
        success: function (response) {
            if (response.success && response.data && response.data.length > 0) {
                var html = '';
                response.data.forEach(function (item) {
                    const loginTime = item.loginUtc ? new Date(item.loginUtc).toLocaleString('vi-VN') : '-';
                    const logoutTime = item.logOutUtc ? new Date(item.logOutUtc).toLocaleString('vi-VN') : 'Chưa đăng xuất';

                    let duration = '-';
                    if (item.loginUtc && item.logOutUtc) {
                        const diff = new Date(item.logOutUtc) - new Date(item.loginUtc);
                        const minutes = Math.floor(diff / 60000);
                        const hours = Math.floor(minutes / 60);
                        duration = hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
                    }

                    html += `<tr>
                        <td>${loginTime}</td>
                        <td>${logoutTime}</td>
                        <td>${duration}</td>
                    </tr>`;
                });
                $('#loginHistoryBody').html(html);
            } else {
                $('#loginHistoryBody').html('<tr><td colspan="3" class="text-center">Chưa có lịch sử đăng nhập</td></tr>');
            }
        },
        error: function (xhr, status, error) {
            $('#loginHistoryBody').html('<tr><td colspan="3" class="text-center text-danger">Lỗi khi tải lịch sử</td></tr>');
        }
    });
}

// ========================================
// STATISTICS
// ========================================
function showStatistics() {
    console.log('📊 Loading statistics...');
    $('#statsModal').modal('show');

    $.ajax({
        url: '/UserAccount/GetUserStatistics',
        type: 'GET',
        success: function (response) {
            if (response.success) {
                const stats = response.data;

                $('#statTotalUsers').text(stats.totalUsers);
                $('#statActiveUsers').text(stats.activeUsers);
                $('#statInactiveUsers').text(stats.inactiveUsers);
                $('#statLockedUsers').text(stats.lockedUsers);
                $('#statEmailConfirmed').text(stats.emailConfirmedUsers);
                $('#stat2FAEnabled').text(stats.twoFactorEnabledUsers);
                $('#statNewUsers').text(stats.newUsersThisMonth);
                $('#statOnlineUsers').text(stats.onlineUsers);
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi tải thống kê: ' + error);
        }
    });
}

// ========================================
// SELECTION CHANGED
// ========================================
function onSelectionChanged() {
    selectedRows = gridApi.getSelectedRows();
    updateSelectedCount();
}

function updateSelectedCount() {
    var totalCount = selectedRows.length;

    // Count unlocked users (can be locked)
    var unlockedCount = selectedRows.filter(row => {
        if (!row.lockoutEnd) return true;
        return new Date(row.lockoutEnd) <= new Date();
    }).length;

    // Count locked users (can be unlocked)
    var lockedCount = selectedRows.filter(row => {
        if (!row.lockoutEnd) return false;
        return new Date(row.lockoutEnd) > new Date();
    }).length;

    $('#selectedCount').text(totalCount);
    $('#lockCount').text(unlockedCount);
    $('#unlockCount').text(lockedCount);

    $('#btnBulkDelete').prop('disabled', totalCount === 0);
    $('#btnLock').prop('disabled', unlockedCount === 0);
    $('#btnUnlock').prop('disabled', lockedCount === 0);
}

// ========================================
// EXPORT TO EXCEL
// ========================================
function exportToExcel() {
    console.log('📊 Exporting to Excel...');

    const params = {
        fileName: `DanhSachNguoiDung_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Người dùng'
    };

    gridApi.exportDataAsExcel(params);
}

// ========================================
// UI HELPERS
// ========================================
function updateStatusBar(total) {
    $('#totalRecords').html(`Tổng: <strong>${total}</strong> người dùng`);
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    $('#lastUpdate').text(`Cập nhật: ${timeStr}`);
}

function showSuccess(message) {
    if (typeof NotificationToast !== 'undefined') {
        NotificationToast('success', message);
    } else {
        alert(message);
    }
}

function showError(message) {
    if (typeof NotificationToast !== 'undefined') {
        NotificationToast('error', message);
    } else {
        alert('Lỗi: ' + message);
    }
}

function showWarning(message) {
    if (typeof NotificationToast !== 'undefined') {
        NotificationToast('warning', message);
    } else {
        alert(message);
    }
}
