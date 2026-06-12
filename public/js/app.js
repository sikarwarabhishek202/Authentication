/**
 * Client Router and Event orchestrator for SecureAuth 2.0
 */
const App = (() => {

    // Store state of the authenticated user
    let currentUser = null;

    // SPA client-side routes definition
    async function handleRouting() {
        const hash = window.location.hash || '#/';
        const authenticated = API.isAuthenticated();

        // 1. Splash screen initializing
        if (!currentUser && authenticated) {
            try {
                const response = await API.getWelcomeData();
                currentUser = response.user;
                UI.updateNavbar(true, currentUser.role);
            } catch (err) {
                console.error("Token verification failed:", err);
                API.removeToken();
                currentUser = null;
                UI.updateNavbar(false);
                UI.showToast("Session Expired", "Please sign in again to continue.", "info");
                window.location.hash = '#/login';
                return;
            }
        }

        // 2. Routing checks
        switch (hash) {
            case '#/login':
                if (authenticated) {
                    window.location.hash = '#/dashboard';
                } else {
                    UI.showSection('login-section');
                }
                break;

            case '#/register':
                if (authenticated) {
                    window.location.hash = '#/dashboard';
                } else {
                    UI.showSection('register-section');
                }
                break;

            case '#/dashboard':
                if (!authenticated) {
                    window.location.hash = '#/login';
                } else {
                    UI.renderDashboard(currentUser);
                    UI.showSection('dashboard-section');
                }
                break;

            case '#/gallery':
                if (!authenticated) {
                    window.location.hash = '#/login';
                } else {
                    UI.showSection('gallery-section');
                    await loadGallery();
                }
                break;

            case '#/admin':
                if (!authenticated) {
                    window.location.hash = '#/login';
                } else if (currentUser && currentUser.role !== 'admin') {
                    UI.showToast("Access Denied", "You must be an administrator to view this page.", "error");
                    window.location.hash = '#/dashboard';
                } else {
                    try {
                        const adminData = await API.getAdminData();
                        document.getElementById('admin-welcome-msg').textContent = adminData.message;
                        UI.showSection('admin-section');
                    } catch (error) {
                        UI.showToast("Access Denied", error.message || "Failed to fetch admin dashboard.", "error");
                        window.location.hash = '#/dashboard';
                    }
                }
                break;

            case '#/':
            default:
                window.location.hash = authenticated ? '#/dashboard' : '#/login';
                break;
        }
    }

    // Load gallery images helper
    async function loadGallery() {
        try {
            const response = await API.getImages();
            UI.renderGallery(response.data);
        } catch (error) {
            UI.showToast("Gallery Error", "Failed to retrieve images: " + error.message, "error");
        }
    }

    // Set up form submission handlers
    function setupFormListeners() {
        
        // 1. Sign In
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('login-submit-btn');
            const usernameInput = document.getElementById('login-username');
            const passwordInput = document.getElementById('login-password');

            // Button loading state
            const origHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;margin:0"></span><span>Signing in...</span>';

            try {
                await API.login(usernameInput.value.trim(), passwordInput.value);
                
                // Fetch user data
                const response = await API.getWelcomeData();
                currentUser = response.user;
                
                UI.updateNavbar(true, currentUser.role);
                UI.showToast("Success", "Logged in successfully!", "success");
                
                loginForm.reset();
                window.location.hash = '#/dashboard';
            } catch (error) {
                UI.showToast("Login Failed", error.message, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origHTML;
            }
        });

        // 2. Registration
        const registerForm = document.getElementById('register-form');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('register-submit-btn');
            const username = document.getElementById('register-username').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const role = document.getElementById('register-role').value;

            // Loading state
            const origHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;margin:0"></span><span>Registering...</span>';

            try {
                const response = await API.register(username, email, password, role);
                UI.showToast("Success", response.message || "Registered successfully! You can now log in.", "success");
                registerForm.reset();
                window.location.hash = '#/login';
            } catch (error) {
                UI.showToast("Registration Failed", error.message, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origHTML;
            }
        });

        // 3. Logout
        document.getElementById('nav-logout').addEventListener('click', () => {
            API.removeToken();
            currentUser = null;
            UI.updateNavbar(false);
            UI.showToast("Goodbye", "You have signed out successfully.", "info");
            window.location.hash = '#/login';
        });

        // 4. File Drag-and-Drop and Selection
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('image-file-input');
        const removePreviewBtn = document.getElementById('remove-preview-btn');
        const uploadForm = document.getElementById('upload-form');

        // Click to browse
        dropZone.addEventListener('click', () => fileInput.click());

        // File drag actions
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('dragover');
            }, false);
        });

        // File drop
        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                fileInput.files = files;
                UI.updateUploadPreview(files[0]);
            } else {
                UI.showToast("Invalid File Type", "Please drop an image file only.", "error");
            }
        });

        // File browser selection
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                UI.updateUploadPreview(fileInput.files[0]);
            }
        });

        // Remove preview button
        removePreviewBtn.addEventListener('click', () => {
            UI.clearUploadPreview();
        });

        // 5. Image Upload Submission
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('upload-submit-btn');
            
            if (fileInput.files.length === 0) {
                UI.showToast("No File Selected", "Please select or drop an image first.", "error");
                return;
            }

            const file = fileInput.files[0];
            const origHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;margin:0"></span><span>Uploading to Cloudinary...</span>';

            try {
                const response = await API.uploadImage(file);
                UI.showToast("Upload Successful", response.message || "Image uploaded and stored.", "success");
                UI.clearUploadPreview();
                // Reload images
                await loadGallery();
            } catch (error) {
                UI.showToast("Upload Failed", error.message, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origHTML;
            }
        });
    }

    // App Initialization
    async function init() {
        setupFormListeners();

        // Check authentication and route on load
        const authenticated = API.isAuthenticated();
        UI.updateNavbar(authenticated);

        // Listen for SPA hash routing changes
        window.addEventListener('hashchange', handleRouting);
        
        // Initial routing trigger
        await handleRouting();
    }

    return {
        init
    };
})();

// Bootstrap the application when document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
