// ── Unified Corporate Media Management (Images & Videos + Slugs + Paths + Editable Names) ──

window.MediaManager = {
    files: [],
    currentFilter: 'all',

    init: async function() {
        await this.loadFiles();
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        const dropZone = document.getElementById('dropZone');
        const fileUploadInput = document.getElementById('fileUploadInput');

        if (dropZone && !dropZone.dataset.bound) {
            dropZone.dataset.bound = 'true';
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
            });

            dropZone.addEventListener('drop', (e) => {
                let dt = e.dataTransfer;
                let files = dt.files;
                this.handleFiles(files);
            }, false);
        }

        if (fileUploadInput && !fileUploadInput.dataset.bound) {
            fileUploadInput.dataset.bound = 'true';
            fileUploadInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
                e.target.value = null;
            });
        }
    },

    generateSlug: function(filename) {
        if (!filename) return 'unnamed';
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
        return nameWithoutExt
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    isVideo: function(file) {
        const mime = (file.mime_type || '').toLowerCase();
        const ext = (file.filename || '').split('.').pop().toLowerCase();
        return mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v'].includes(ext);
    },

    loadFiles: async function() {
        let grid = document.getElementById('mediaGrid');
        
        // Wait for DOM insertion if not yet ready
        if (!grid) {
            for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 50));
                grid = document.getElementById('mediaGrid');
                if (grid) break;
            }
        }

        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full py-20 flex flex-col items-center justify-center text-slate-800 font-extrabold">
                    <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-[#075e54]"></i>
                    <p class="text-base font-black tracking-wide">LOADING ALL MEDIA ASSETS & SLUGS...</p>
                </div>`;
        }

        try {
            // Call API endpoint
            const res = await apiRequest('GET', '/media?limit=1000');
            this.files = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
            
            // Fallback endpoint if empty
            if (this.files.length === 0) {
                try {
                    const fallbackRes = await apiRequest('GET', '/api/images');
                    this.files = (fallbackRes && fallbackRes.data) ? fallbackRes.data : (fallbackRes.images || []);
                } catch(e) {}
            }

            // Update Counts
            const totalCount = this.files.length;
            const videoCount = this.files.filter(f => this.isVideo(f)).length;
            const imageCount = totalCount - videoCount;

            const cAll = document.getElementById('countAll');
            const cImg = document.getElementById('countImages');
            const cVid = document.getElementById('countVideos');
            if (cAll) cAll.textContent = totalCount;
            if (cImg) cImg.textContent = imageCount;
            if (cVid) cVid.textContent = videoCount;

            this.renderGrid();
        } catch (e) {
            console.error('Error fetching media assets:', e);
            grid = document.getElementById('mediaGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="col-span-full py-16 flex flex-col items-center justify-center text-red-600 font-black">
                        <i class="fa-solid fa-triangle-exclamation text-5xl mb-3"></i>
                        <p class="text-base">Failed to load media files. Please refresh.</p>
                    </div>`;
            }
        }
    },

    setFilter: function(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.media-filter-btn').forEach(btn => {
            btn.className = 'media-filter-btn px-4 py-2.5 rounded-xl text-xs font-black bg-slate-200 text-slate-900 hover:bg-slate-300 border-2 border-slate-300 transition-all uppercase tracking-wider';
        });

        const btnAll = document.getElementById('filterBtnAll');
        const btnImg = document.getElementById('filterBtnImages');
        const btnVid = document.getElementById('filterBtnVideos');

        if (filter === 'all' && btnAll) btnAll.className = 'media-filter-btn px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900 text-white shadow-md transition-all uppercase tracking-wider';
        if (filter === 'images' && btnImg) btnImg.className = 'media-filter-btn px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900 text-white shadow-md transition-all uppercase tracking-wider';
        if (filter === 'videos' && btnVid) btnVid.className = 'media-filter-btn px-4 py-2.5 rounded-xl text-xs font-black bg-purple-900 text-white shadow-md transition-all uppercase tracking-wider';

        this.renderGrid();
    },

    renderGrid: function() {
        const grid = document.getElementById('mediaGrid');
        if (!grid) return;
        const searchTerm = (document.getElementById('mediaSearch')?.value || '').toLowerCase();
        
        grid.innerHTML = '';
        
        const filtered = this.files.filter(f => {
            const isVid = this.isVideo(f);
            if (this.currentFilter === 'images' && isVid) return false;
            if (this.currentFilter === 'videos' && !isVid) return false;

            const slug = f.slug || this.generateSlug(f.filename);
            const pathStr = f.url || f.path || `/uploads/${f.filename}`;
            return (f.filename || '').toLowerCase().includes(searchTerm) || 
                   (f.original_name || '').toLowerCase().includes(searchTerm) ||
                   pathStr.toLowerCase().includes(searchTerm) ||
                   slug.toLowerCase().includes(searchTerm);
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-600 font-extrabold bg-white p-8 rounded-2xl border-2 border-slate-300">
                    <i class="fa-regular fa-folder-open text-6xl mb-4 text-slate-400"></i>
                    <p class="text-lg text-slate-900 font-black">No media assets found matching criteria.</p>
                </div>`;
            return;
        }

        const html = filtered.map(file => {
            const sizeMB = file.file_size ? (file.file_size / (1024 * 1024)).toFixed(2) + ' MB' : '—';
            let mediaPath = file.url || file.path || `/uploads/${file.filename}`;
            mediaPath = mediaPath.replace(/\\/g, '/');
            if (!mediaPath.startsWith('/') && !mediaPath.startsWith('http')) mediaPath = '/' + mediaPath;
            
            const encodedUrl = encodeURI(mediaPath);
            const fileSlug = file.slug || this.generateSlug(file.filename);
            const isVid = this.isVideo(file);

            const typeBadge = isVid 
                ? '<span class="absolute top-2 left-2 bg-purple-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow uppercase tracking-wider flex items-center gap-1"><i class="fa-solid fa-play text-[9px]"></i> VIDEO</span>'
                : '<span class="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow uppercase tracking-wider">IMAGE</span>';

            let previewHtml = '';
            if (isVid) {
                previewHtml = `
                    <div class="relative w-full h-44 bg-slate-950 flex items-center justify-center overflow-hidden">
                        <video src="${encodedUrl}" controls preload="metadata" class="w-full h-full object-cover"></video>
                    </div>
                `;
            } else {
                previewHtml = `<div class="w-full h-44 bg-slate-100 flex items-center justify-center overflow-hidden"><img src="${encodedUrl}" alt="${file.filename}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/images/optimized/balloon.webp'"></div>`;
            }
            
            return `
                <div class="bg-white rounded-2xl overflow-hidden border-2 border-slate-300 flex flex-col shadow-md hover:shadow-xl transition-all">
                    <!-- Media Preview Box -->
                    <div class="w-full relative shrink-0">
                        ${previewHtml}
                        ${typeBadge}
                    </div>
                    
                    <!-- Card Details & Actions (Solid High Visibility) -->
                    <div class="p-4 bg-white space-y-3 flex-1 flex flex-col justify-between border-t-2 border-slate-200">
                        <div>
                            <div class="flex items-center justify-between gap-2 mb-1">
                                <p class="text-slate-900 text-xs font-black truncate" title="${file.filename}">${file.filename}</p>
                                <button 
                                    onclick="MediaManager.editMedia('${file.id}', '${encodedUrl}', '${file.filename.replace(/'/g, "\\'")}', '${fileSlug}', '${(file.alt_text || '').replace(/'/g, "\\'")}', event)"
                                    class="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded border border-emerald-300 transition-all shrink-0 cursor-pointer"
                                    title="Edit Name, Slug & Alt Text"
                                >
                                    <i class="fa-solid fa-pen-to-square"></i> EDIT
                                </button>
                            </div>
                            
                            <!-- Slug Badge Button -->
                            <div class="my-2">
                                <button 
                                    onclick="MediaManager.copyText('${fileSlug}', 'Slug copied to clipboard!', event)"
                                    class="w-full bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-950 font-mono font-black text-[11px] px-2.5 py-1.5 rounded-lg text-left truncate flex items-center justify-between gap-1 transition-all shadow-sm cursor-pointer"
                                    title="Click to copy slug: ${fileSlug}"
                                >
                                    <span class="truncate">slug: ${fileSlug}</span>
                                    <i class="fa-solid fa-copy text-xs text-purple-800"></i>
                                </button>
                            </div>

                            <!-- Path Info -->
                            <div class="my-1.5">
                                <span class="text-[10px] font-bold text-slate-500 block">Path:</span>
                                <span class="text-[11px] font-bold text-slate-800 truncate block font-mono bg-slate-100 p-1 rounded border border-slate-200" title="${mediaPath}">${mediaPath}</span>
                            </div>

                            <div class="flex items-center justify-between text-[11px] font-bold text-slate-600 mt-2">
                                <span>Size:</span>
                                <span class="bg-slate-200 text-slate-900 px-2 py-0.5 rounded font-black">${sizeMB}</span>
                            </div>
                        </div>

                        <!-- Solid Action Buttons Bar -->
                        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                            <button 
                                data-url="${encodedUrl}" 
                                onclick="MediaManager.copyText(this.dataset.url, 'Path URL copied!', event)" 
                                class="bg-blue-700 hover:bg-blue-800 text-white font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                            >
                                <i class="fa-solid fa-link text-xs"></i> COPY PATH
                            </button>
                            <button 
                                data-id="${file.id}" 
                                onclick="MediaManager.deleteFile(this.dataset.id, event)" 
                                class="bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                            >
                                <i class="fa-solid fa-trash text-xs"></i> DELETE
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        grid.innerHTML = html;
    },

    filterFiles: function() {
        this.renderGrid();
    },

    editMedia: async function(id, url, currentName, currentSlug, currentAlt, e) {
        if (e) e.stopPropagation();
        
        const newName = prompt('Edit Filename / Display Title:', currentName);
        if (newName === null) return; // User cancelled
        
        const newSlug = prompt('Edit Unique Slug:', currentSlug || this.generateSlug(newName));
        if (newSlug === null) return;

        const newAlt = prompt('Edit Alt Text:', currentAlt || newName);

        try {
            if (typeof showToast === 'function') showToast('Saving changes...', 'info');
            await apiRequest('PUT', `/media/${id}`, {
                filename: newName,
                slug: newSlug,
                alt_text: newAlt,
                url: url
            });
            if (typeof showToast === 'function') showToast('Media updated successfully!', 'success');
            await this.loadFiles();
        } catch (err) {
            console.error('Failed to update media:', err);
            if (typeof showToast === 'function') showToast(err.message || 'Failed to update media', 'error');
        }
    },

    copyText: function(text, successMsg, e) {
        if (e) e.stopPropagation();
        const absoluteText = (text.startsWith('/') && !text.startsWith('http')) ? window.location.origin + text : text;
        navigator.clipboard.writeText(absoluteText).then(() => {
            if (typeof showToast === 'function') showToast(successMsg || 'Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    },

    deleteFile: async function(id, e) {
        if (e) e.stopPropagation();
        if(!confirm('Are you sure you want to delete this media file permanently?')) return;
        try {
            await apiRequest('DELETE', `/media/${id}`);
            if (typeof showToast === 'function') showToast('Media file deleted successfully', 'success');
            await this.loadFiles();
        } catch (e) {
            console.error(e);
            if (typeof showToast === 'function') showToast('Failed to delete media file', 'error');
        }
    },

    handleFiles: async function(newFiles) {
        if (!newFiles.length) return;
        
        const arrayFiles = Array.from(newFiles);
        if (typeof showToast === 'function') showToast('Uploading files...', 'success');

        try {
            for (const file of arrayFiles) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'general');
                formData.append('original_filename', file.name);
                await apiUpload(formData);
            }
            if (typeof showToast === 'function') showToast('All files uploaded successfully', 'success');
            await this.loadFiles();
        } catch (e) {
            console.error(e);
            if (typeof showToast === 'function') showToast('Failed to upload files', 'error');
        }
    }
};

// Global entry point called by core.js navigate('images')
async function loadImages() {
    const run = async () => {
        if (window.MediaManager) {
            await window.MediaManager.init();
        }
    };
    run();
    setTimeout(run, 100);
}

window.loadImages = loadImages;
