/**
 * UI Controller for SecureAuth 2.0
 * Handles rendering, DOM manipulation, transitions, animations, and toast notifications.
 */
const UI = (() => {
    
    // Switch active section in SPA
    const showSection = (sectionId) => {
        document.querySelectorAll('.section-view').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Highlight active navbar link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#/${sectionId.replace('-section', '')}`) {
                link.classList.add('active');
            }
        });

        // Trigger lucide icon update in case any icons were dynamically injected
        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    // Show a premium glassmorphic toast notification
    const showToast = (title, message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-triangle';

        toast.innerHTML = `
            <i data-lucide="${iconName}" class="toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        container.appendChild(toast);
        
        // Refresh icons inside toast
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Trigger slide-in transition
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    };

    // Toggle nav header options based on authorization state
    const updateNavbar = (isAuthenticated, role = 'user') => {
        const dashboardLink = document.getElementById('nav-dashboard');
        const galleryLink = document.getElementById('nav-gallery');
        const adminLink = document.getElementById('nav-admin');
        const loginLink = document.getElementById('nav-login');
        const registerLink = document.getElementById('nav-register');
        const logoutBtn = document.getElementById('nav-logout');

        if (isAuthenticated) {
            dashboardLink.classList.remove('hidden');
            galleryLink.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            
            loginLink.classList.add('hidden');
            registerLink.classList.add('hidden');

            if (role === 'admin') {
                adminLink.classList.remove('hidden');
            } else {
                adminLink.classList.add('hidden');
            }
        } else {
            dashboardLink.classList.add('hidden');
            galleryLink.classList.add('hidden');
            adminLink.classList.add('hidden');
            logoutBtn.classList.add('hidden');
            
            loginLink.classList.remove('hidden');
            registerLink.classList.remove('hidden');
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    // Populate dashboard items with current user payload
    const renderDashboard = (user) => {
        document.getElementById('dashboard-welcome-title').textContent = `Welcome back, ${user.username}!`;
        document.getElementById('profile-username').textContent = user.username;
        document.getElementById('profile-userid').textContent = user._id || user.userId || '...';
        
        const badge = document.getElementById('profile-role-badge');
        badge.textContent = `Role: ${user.role}`;
        badge.className = 'badge';
        if (user.role === 'admin') {
            badge.classList.add('badge-admin');
            document.getElementById('dashboard-admin-btn').classList.remove('hidden');
        } else {
            document.getElementById('dashboard-admin-btn').classList.add('hidden');
        }

        const letterAvatar = document.getElementById('profile-avatar-letter');
        letterAvatar.textContent = (user.username || 'U').charAt(0).toUpperCase();

        const perms = document.getElementById('profile-permissions');
        perms.textContent = user.role === 'admin' ? 'Full Administrator Access' : 'Standard Read/Write Access';
    };

    // Render Cloudinary images list dynamically in grid
    const renderGallery = (images) => {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        if (!images || images.length === 0) {
            grid.innerHTML = `
                <div class="gallery-empty-state">
                    <i data-lucide="image-off"></i>
                    <p>No images uploaded yet. Be the first to upload!</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        grid.innerHTML = images.map(img => `
            <div class="gallery-item" data-url="${img.url}">
                <img src="${img.url}" alt="Shared Image" loading="lazy">
                <div class="gallery-item-overlay">
                    <span class="gallery-uploader-label">Uploaded</span>
                    <span class="gallery-uploader-name">ID: ${img.uploadBy.substring(0, 8)}...</span>
                </div>
            </div>
        `).join('');

        // Bind image zoom event
        grid.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.getAttribute('data-url');
                openLightbox(url);
            });
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    // Lightbox handlers
    const openLightbox = (url) => {
        const modal = document.getElementById('lightbox-modal');
        const img = document.getElementById('lightbox-img');
        
        img.src = url;
        modal.style.display = 'flex';
    };

    const closeLightbox = () => {
        const modal = document.getElementById('lightbox-modal');
        modal.style.display = 'none';
    };

    // Set preview details for the uploader card
    const updateUploadPreview = (file) => {
        const previewBox = document.getElementById('upload-preview-box');
        const previewImg = document.getElementById('upload-preview-img');
        const nameText = document.getElementById('preview-file-name');
        const sizeText = document.getElementById('preview-file-size');
        const dropZone = document.getElementById('drop-zone');

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            nameText.textContent = file.name;
            sizeText.textContent = (file.size / 1024).toFixed(1) + ' KB';
            
            previewBox.classList.remove('hidden');
            dropZone.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    };

    // Clear upload details
    const clearUploadPreview = () => {
        const previewBox = document.getElementById('upload-preview-box');
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('image-file-input');

        previewBox.classList.add('hidden');
        dropZone.classList.remove('hidden');
        fileInput.value = '';
    };

    // Initialize lightbox closes
    document.getElementById('close-lightbox').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-modal').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox-modal') {
            closeLightbox();
        }
    });

    return {
        showSection,
        showToast,
        updateNavbar,
        renderDashboard,
        renderGallery,
        updateUploadPreview,
        clearUploadPreview
    };
})();
