const STORAGE_KEY = "alex_gallery_photos";

function getStoredPhotos() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function savePhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}



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
 // MOBILE MENU
    // ============================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const body = document.body;
    
    let isOpen = false;
    
    function toggleMenu() {
        isOpen = !isOpen;
        
        if (isOpen) {
            mobileMenu.classList.remove('translate-x-full');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            body.classList.add('menu-open');
        } else {
            mobileMenu.classList.add('translate-x-full');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            body.classList.remove('menu-open');
        }
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMenu);
    }
    
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            toggleMenu();
        }
    });

  // Uploading images
 const uploadInput = document.getElementById("photo-upload");
const previewModal = document.getElementById("preview-modal");
const previewContainer = document.getElementById("preview-container");

let selectedFiles = [];

// When user selects images
uploadInput.addEventListener("change", function () {
  selectedFiles = Array.from(this.files);
  previewContainer.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const previewItem = document.createElement("div");
      previewItem.className = "relative group";

      previewItem.innerHTML = `
        <img src="${e.target.result}" 
             class="w-full h-40 object-cover rounded-lg">
        <button onclick="removePreview(${index})"
                class="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition">
            Remove
        </button>
      `;

      previewContainer.appendChild(previewItem);
    };

    reader.readAsDataURL(file);
  });

  previewModal.classList.remove("hidden");
  previewModal.classList.add("flex");
});

// Remove preview image
window.removePreview = function (index) {
  selectedFiles.splice(index, 1);
  uploadInput.dispatchEvent(new Event("change"));
};

// Close preview
window.closePreview = function () {
  previewModal.classList.add("hidden");
  previewModal.classList.remove("flex");
  uploadInput.value = "";
  selectedFiles = [];
};

// Confirm add to gallery
window.confirmAddPhotos = function () {
  selectedFiles.forEach((file) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const item = document.createElement("div");
      item.className = "group relative overflow-hidden rounded-lg";

      item.innerHTML = `
        <img src="${e.target.result}" 
             class="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110">
             
        <button class="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-600 transition">
            Delete
        </button>
      `;

      const deleteBtn = item.querySelector("button");
      deleteBtn.addEventListener("click", () => {
        item.remove();
      });

      gallery.appendChild(item);
    };

    reader.readAsDataURL(file);
  });

  closePreview();
};

//Render Gallery From Storage (On Page Load)
const gallery = document.getElementById("gallery");

let storedPhotos = getStoredPhotos();

function renderGallery() {
    gallery.innerHTML = "";

    storedPhotos.forEach((photo, index) => {
        const item = document.createElement("div");
        item.className = "group relative overflow-hidden rounded-lg";

        item.innerHTML = `
      <img src="${photo}"
           class="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110">

      <button 
          class="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-600 transition">
          Delete
      </button>
    `;
    const deleteBtn = item.querySelector("button");

    deleteBtn.addEventListener("click", () => {
           storedPhotos.splice(index, 1);
      savePhotos(storedPhotos);
      renderGallery();
    });
    gallery.appendChild(item);
    })
}
    renderGallery();

    //confirm add function
    window.confirmAddPhotos = function () {
  selectedFiles.forEach((file) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      storedPhotos.push(e.target.result);
      savePhotos(storedPhotos);
      renderGallery();
    };

    reader.readAsDataURL(file);
  });

  closePreview();
};


