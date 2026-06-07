
let currentPage = 1;
const limit = 20;
let isLoading = false;

const gallery = document.getElementById('gallery');
const loadTrigger = document.getElementById('load-trigger');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightboxBtn = document.getElementById('close-lightbox');
const lightboxSpinner = document.getElementById('lightbox-spinner');

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
          
            img.src = img.dataset.src;
            
            img.onload = () => img.classList.add('loaded');
            
            observer.unobserve(img);
        }
    });
}, { rootMargin: '0px 0px 50px 0px' });


async function fetchPhotos(page) {
    isLoading = true;
    
    try {
        const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
        const photos = await response.json();
        
        renderPhotos(photos);
        currentPage++;
    } catch (error) {
        console.error("Lỗi khi lấy ảnh:", error);
        loadTrigger.innerHTML = `<span style="color:red">Lỗi tải ảnh. Vui lòng tải lại trang!</span>`;
    } finally {
        isLoading = false;
    }
}

function renderPhotos(photos) {
    photos.forEach(photo => {
        const thumbnailUrl = `https://picsum.photos/id/${photo.id}/400/300`;
        
        const fullSizeUrl = `https://picsum.photos/id/${photo.id}/1200/900`;

        const wrapper = document.createElement('div');
        wrapper.className = 'gallery-item';

        const img = document.createElement('img');
        img.className = 'lazy-image';
        img.alt = `Ảnh của ${photo.author}`;
        img.dataset.src = thumbnailUrl; 
        
        img.addEventListener('click', () => openLightbox(fullSizeUrl));

        wrapper.appendChild(img);
        gallery.appendChild(wrapper);

        imageObserver.observe(img);
    });
}

const scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) {
        fetchPhotos(currentPage);
    }
}, { rootMargin: '100px' }); 

scrollObserver.observe(loadTrigger);


function openLightbox(highResUrl) {
    lightbox.hidden = false;
    lightboxImg.hidden = true; 
    lightboxSpinner.hidden = false;
    
    lightboxImg.src = highResUrl;
    
    lightboxImg.onload = () => {
        lightboxSpinner.hidden = true;
        lightboxImg.hidden = false;
    };
}

function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = ""; 
}

closeLightboxBtn.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox(); 
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
});