// ========================================
// ACCOUNT.JS - LOGIN, FORGOT PASSWORD, RESET PASSWORD
// ========================================

// ========================================
// LOGIN PAGE
// ========================================
function initLoginPage() {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // Enter key submit
    $('#username, #password').on('keypress', function(e) {
        if (e.which === 13) {
            handleLogin();
        }
    });
}

async function handleLogin() {
    const username = $('#username').val().trim();
    const password = $('#password').val();
    const rememberMe = $('#rememberMe').is(':checked');

    // Validation
    if (!username || !password) {
        showError('Vui lòng điền đầy đủ thông tin');
        return;
    }

    // Show loading
    const $btnLogin = $('#btnLogin');
    const originalText = $btnLogin.html();
    $btnLogin.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang xử lý...');

    try {
        const formData = $('#loginForm').serialize(); handleLogin

        const response = await $.ajax({
            url: '/Account/Login',
            type: 'POST',
            data: formData
        });

        if (response.success) {
            showSuccess('Đăng nhập thành công!');
            
            // Redirect sau 500ms
            setTimeout(function() {
                window.location.href = response.redirectUrl || '/';
            }, 500);
        } else {
            showError(response.message || 'Đăng nhập thất bại');
            $btnLogin.prop('disabled', false).html(originalText);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Đã xảy ra lỗi. Vui lòng thử lại.');
        $btnLogin.prop('disabled', false).html(originalText);
    }
}

// ========================================
// FORGOT PASSWORD PAGE
// ========================================
function initForgotPasswordPage() {
    $('#forgotPasswordForm').on('submit', function(e) {
        e.preventDefault();
        handleForgotPassword();
    });
}

async function handleForgotPassword() {
    const emailOrUsername = $('#emailOrUsername').val().trim();

    // Validation
    if (!emailOrUsername) {
        showError('Vui lòng nhập email hoặc tên đăng nhập');
        return;
    }

    // Show loading
    const $btnSubmit = $('#btnSubmit');
    const originalText = $btnSubmit.html();
    $btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang gửi...');

    try {
        const formData = $('#forgotPasswordForm').serialize();

        const response = await $.ajax({
            url: '/Account/ForgotPassword',
            type: 'POST',
            data: formData
        });

        if (response.success) {
            showSuccess(response.message);
            
            // Disable form
            $('#emailOrUsername').prop('disabled', true);
            $btnSubmit.hide();
        } else {
            showError(response.message || 'Gửi link thất bại');
            $btnSubmit.prop('disabled', false).html(originalText);
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showError('Đã xảy ra lỗi. Vui lòng thử lại.');
        $btnSubmit.prop('disabled', false).html(originalText);
    }
}

// ========================================
// RESET PASSWORD PAGE
// ========================================
function initResetPasswordPage() {
    $('#resetPasswordForm').on('submit', function(e) {
        e.preventDefault();
        handleResetPassword();
    });

    // Password strength indicator
    $('#newPassword').on('input', function() {
        checkPasswordStrength($(this).val());
    });

    // Check password match
    $('#confirmPassword').on('input', function() {
        checkPasswordMatch();
    });
}

async function handleResetPassword() {
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();

    // Validation
    if (!newPassword || !confirmPassword) {
        showError('Vui lòng điền đầy đủ thông tin');
        return;
    }

    if (newPassword.length < 6) {
        showError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('Mật khẩu xác nhận không khớp');
        return;
    }

    // Show loading
    const $btnSubmit = $('#btnSubmit');
    const originalText = $btnSubmit.html();
    $btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang xử lý...');

    try {
        const formData = $('#resetPasswordForm').serialize();

        const response = await $.ajax({
            url: '/Account/ResetPassword',
            type: 'POST',
            data: formData
        });

        if (response.success) {
            showSuccess(response.message);
            
            // Redirect to login sau 2s
            setTimeout(function() {
                window.location.href = response.redirectUrl || '/Account/Login';
            }, 2000);
        } else {
            showError(response.message || 'Đặt lại mật khẩu thất bại');
            $btnSubmit.prop('disabled', false).html(originalText);
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showError('Đã xảy ra lỗi. Vui lòng thử lại.');
        $btnSubmit.prop('disabled', false).html(originalText);
    }
}

// ========================================
// PASSWORD STRENGTH CHECKER
// ========================================
function checkPasswordStrength(password) {
    const $strength = $('#passwordStrength');
    const $fill = $('#strengthFill');
    const $text = $('#strengthText');

    if (!password) {
        $strength.hide();
        return;
    }

    $strength.show();

    let strength = 0;
    let strengthText = '';
    let strengthClass = '';

    // Length
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;

    // Lowercase
    if (/[a-z]/.test(password)) strength += 10;

    // Uppercase
    if (/[A-Z]/.test(password)) strength += 15;

    // Numbers
    if (/[0-9]/.test(password)) strength += 15;

    // Special characters
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    // Set text and class
    if (strength < 40) {
        strengthText = 'Yếu';
        strengthClass = 'weak';
    } else if (strength < 60) {
        strengthText = 'Trung bình';
        strengthClass = 'medium';
    } else if (strength < 80) {
        strengthText = 'Khá';
        strengthClass = 'good';
    } else {
        strengthText = 'Mạnh';
        strengthClass = 'strong';
    }

    $fill.css('width', strength + '%').removeClass().addClass('strength-fill ' + strengthClass);
    $text.text(strengthText);
}

// ========================================
// PASSWORD MATCH CHECKER
// ========================================
function checkPasswordMatch() {
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();

    if (!confirmPassword) return;

    if (newPassword === confirmPassword) {
        $('#confirmPassword').removeClass('is-invalid').addClass('is-valid');
    } else {
        $('#confirmPassword').removeClass('is-valid').addClass('is-invalid');
    }
}

// ========================================
// TOGGLE PASSWORD VISIBILITY
// ========================================
function togglePassword(inputId) {
    const input = inputId ? document.getElementById(inputId) : document.getElementById('password');
    const icon = inputId 
        ? $(event.target).closest('.btn-toggle-password').find('i')
        : $('#toggleIcon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
}

// ========================================
// SHOW ERROR MESSAGE
// ========================================
function showError(message) {
    const $error = $('#errorMessage');
    const $success = $('#successMessage');

    $success.hide();
    $error.html('<i class="fas fa-exclamation-circle"></i> ' + message).fadeIn();

    // Auto hide after 5s
    setTimeout(function() {
        $error.fadeOut();
    }, 5000);
}

// ========================================
// SHOW SUCCESS MESSAGE
// ========================================
function showSuccess(message) {
    const $error = $('#errorMessage');
    const $success = $('#successMessage');

    $error.hide();
    $success.html('<i class="fas fa-check-circle"></i> ' + message).fadeIn();
}

// ========================================
// LOGOUT (nếu cần gọi từ button)
// ========================================
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        // Create form và submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/Account/Logout';

        // Add anti-forgery token
        const token = document.querySelector('input[name="__RequestVerificationToken"]');
        if (token) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '__RequestVerificationToken';
            input.value = token.value;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    }
}
