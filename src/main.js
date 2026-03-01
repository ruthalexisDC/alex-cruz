// ============================================
// SHARED JAVASCRIPT FOR ALL PAGES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CURSOR EFFECT (All pages)
    // ==========================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const hoverElements = document.querySelectorAll('[data-hover]');

    // Mouse position variables
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    // Check if cursor elements exist (desktop only)
    if (cursorDot && cursorOutline) {
        // Smooth cursor animation loop
        const animate = () => {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;

            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;

            requestAnimationFrame(animate);
        };
        animate();

        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Hover effects for cursor
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovering');
            });
        });
    }

    // ==========================================
    // IMAGE PARALLAX EFFECT (index.html & about.html)
    // ==========================================
    
    // Handle main hero image (id="image-container")
    const mainImageContainer = document.getElementById('image-container');
    if (mainImageContainer) {
        setupParallax(mainImageContainer);
    }

    // Handle additional photos (class="parallax-image")
    const parallaxImages = document.querySelectorAll('.parallax-image');
    parallaxImages.forEach(container => {
        setupParallax(container);
    });

    function setupParallax(container) {
        container.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = container.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            
            const moveX = (x - 0.5) * 20;
            const moveY = (y - 0.5) * 20;

            const img = container.querySelector('img');
            if (img) {
                img.style.transform = `scale(1.1) translate(${-moveX}px, ${-moveY}px)`;
            }
        });

        container.addEventListener('mouseleave', () => {
            const img = container.querySelector('img');
            if (img) {
                img.style.transform = `scale(1) translate(0px, 0px)`;
            }
        });
    }

    // ==========================================
    // LIGHTBOX FUNCTIONALITY (work.html only)
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const spinner = document.getElementById('spinner');
    const thumbnailStrip = document.getElementById('thumbnail-strip');
    const grid = document.getElementById('gallery');

    // Only run lightbox code if we're on work.html
    if (lightbox && grid) {
        initLightbox();
    }

    function initLightbox() {
        // Photo data
        const photos = [
            { src: 'three.jpg', title: 'Urban Sunset', caption: 'Shirakawa-go Sunset' },
            { src: 'one.jpg', title: 'Golden Hour', caption: 'Sunset over the mountains' },
            { src: 'five.jpg', title: 'Street Life', caption: 'Sunny Cold Moments' },
            { src: '18.jpg', title: 'Reflections', caption: 'Mirror-like waters' },
            { src: 'eight.jpg', title: 'Neon Dreams', caption: 'Cyberpunk aesthetics' },
            { src: 'six.jpg', title: 'Quiet Moments', caption: 'Peace in the chaos' },
            { src: '19.jpg', title: 'City Lights', caption: 'Illuminated skyline' },
            { src: '14.jpg', title: 'Shadow Play', caption: 'Light and darkness dance' },
            { src: '17.jpg', title: 'Glass Buildings', caption: 'High Tower of Nagoya' }
        ];

        let currentIndex = 0;
        let isZoomed = false;

        // Generate grid
        photos.forEach((photo, index) => {
            const div = document.createElement('div');
            div.className = 'image-box overflow-hidden rounded-lg clickable cursor-pointer';
            div.innerHTML = `
                <img src="${photo.src}" alt="${photo.title}" 
                     class="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-500"
                     onclick="openLightbox(${index})" loading="lazy">
            `;
            grid.appendChild(div);
        });

        // Generate thumbnails
        if (thumbnailStrip) {
            photos.forEach((photo, index) => {
                const thumb = document.createElement('img');
                thumb.src = photo.src;
                thumb.className = `thumbnail w-16 h-16 object-cover rounded cursor-pointer ${index === 0 ? 'active' : ''}`;
                thumb.onclick = () => {
                    currentIndex = index;
                    updateLightbox();
                };
                thumbnailStrip.appendChild(thumb);
            });
        }

        // Open lightbox
        window.openLightbox = (index) => {
            currentIndex = index;
            updateLightbox();
            lightbox.classList.remove('hidden');
            lightbox.classList.add('active');
            document.body.classList.add('lightbox-open');
            updateThumbnails();
        };

        // Close Lightbox
        window.closeLightbox = () => {
            lightbox.classList.remove('active');
            lightbox.classList.add('hidden');
            document.body.classList.remove('lightbox-open');
            if (isZoomed) toggleZoom();
        };

        // Toggle zoom
        window.toggleZoom = () => {
            isZoomed = !isZoomed;
            if (lightboxImage) {
                lightboxImage.classList.toggle('zoomed', isZoomed);
                lightboxImage.style.cursor = isZoomed ? 'zoom-out' : 'zoom-in';
            }
        };

        // Change Image
        window.changeImage = (direction) => {
            if (isZoomed) toggleZoom();
            currentIndex += direction;
            if (currentIndex >= photos.length) currentIndex = 0;
            if (currentIndex < 0) currentIndex = photos.length - 1;
            updateLightbox();
        };

        // Update lightbox content
        function updateLightbox() {
            const photo = photos[currentIndex];
            if (!photo) return;
            
            if (spinner) spinner.style.display = 'block';
            if (lightboxImage) lightboxImage.style.opacity = '0.5';

            const img = new Image();
            img.onload = () => {
                if (lightboxImage) {
                    lightboxImage.src = photo.src;
                    lightboxImage.alt = photo.title;
                    lightboxImage.style.opacity = '1';
                }
                if (spinner) spinner.style.display = 'none';
            };

            img.onerror = () => {
                if (spinner) spinner.style.display = 'none';
                if (lightboxImage) {
                    lightboxImage.style.opacity = '1';
                    lightboxImage.alt = 'Failed to load image';
                }
            };

            img.src = photo.src;

            if (lightboxTitle) lightboxTitle.textContent = photo.title;
            if (lightboxCaption) lightboxCaption.textContent = photo.caption;
            if (lightboxCounter) {
                lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
            }

            updateThumbnails();
        }

        // Update thumbnail active state
        function updateThumbnails() {
            if (!thumbnailStrip) return;
            const thumbs = thumbnailStrip.querySelectorAll('.thumbnail');
            thumbs.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === currentIndex);
                if (index === currentIndex) {
                    thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    changeImage(-1);
                    break;
                case 'ArrowRight':
                    changeImage(1);
                    break;
                case 'z':
                case 'Z':
                    toggleZoom();
                    break;
            }
        });

        // Touch swipe
        let touchStartX = 0;
        lightbox.addEventListener('touchstart', (e) => touchStartX = e.changedTouches[0].screenX);
        lightbox.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? changeImage(1) : changeImage(-1);
            }
        });
    }

    // ==========================================
    // MOBILE MENU (All pages)
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLink = document.getElementById('nav-link');

    if (mobileMenuBtn && navLink) {
        mobileMenuBtn.addEventListener('click', () => {
            navLink.classList.toggle('hidden');
            navLink.classList.toggle('flex');
        });
    }
});