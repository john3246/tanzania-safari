/**
 * Media library picker — turns URL text inputs into searchable media dropdowns.
 * Call MediaPicker.enhanceAll() after forms are in the DOM.
 */
const MediaPicker = (() => {
    let cache = null;
    let loading = null;

    async function loadMedia() {
        if (cache) return cache;
        if (loading) return loading;
        loading = (async () => {
            try {
                const res = await apiRequest('GET', '/media?limit=200');
                cache = (res.data || []).map(m => ({
                    id: m.id,
                    label: m.original_filename || m.filename || m.alt_text || `Image #${m.id}`,
                    url: m.url || m.webp_url || m.thumbnail_url || m.path
                })).filter(m => m.url && (!m.mime_type || String(m.mime_type).startsWith('image') || /\.(jpe?g|png|webp|gif|svg)$/i.test(m.url)));
            } catch (e) {
                console.warn('Media library load failed', e);
                cache = [];
            } finally {
                loading = null;
            }
            return cache;
        })();
        return loading;
    }

    function enhanceInput(input, { multi = false } = {}) {
        if (!input || input.dataset.mediaPicker === '1') return;
        input.dataset.mediaPicker = '1';

        const wrap = document.createElement('div');
        wrap.className = 'media-picker-wrap space-y-2';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        const row = document.createElement('div');
        row.className = 'flex gap-2 items-center';
        const select = document.createElement('select');
        select.className = input.className || 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm';
        select.innerHTML = '<option value="">Select from media library...</option>';
        row.appendChild(select);

        const refreshBtn = document.createElement('button');
        refreshBtn.type = 'button';
        refreshBtn.className = 'shrink-0 px-2.5 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50';
        refreshBtn.title = 'Refresh media list';
        refreshBtn.innerHTML = '<i class="fa-solid fa-rotate"></i>';
        row.appendChild(refreshBtn);
        wrap.insertBefore(row, input);

        const preview = document.createElement('div');
        preview.className = 'flex flex-wrap gap-2';
        wrap.appendChild(preview);

        async function fillOptions() {
            const items = await loadMedia();
            const current = select.value;
            select.innerHTML = '<option value="">Select from media library...</option>' +
                items.map(m => `<option value="${m.url}">${escape(m.label)}</option>`).join('');
            if (current) select.value = current;
        }

        function escape(s) {
            return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
        }

        function updatePreview() {
            preview.innerHTML = '';
            const urls = multi
                ? input.value.split(',').map(s => s.trim()).filter(Boolean)
                : (input.value.trim() ? [input.value.trim()] : []);
            urls.slice(0, 6).forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.alt = '';
                img.className = 'w-14 h-14 object-cover rounded-lg border border-gray-200 bg-gray-50';
                img.onerror = () => { img.style.display = 'none'; };
                preview.appendChild(img);
            });
        }

        select.addEventListener('change', () => {
            if (!select.value) return;
            if (multi) {
                const existing = input.value.split(',').map(s => s.trim()).filter(Boolean);
                if (!existing.includes(select.value)) existing.push(select.value);
                input.value = existing.join(', ');
            } else {
                input.value = select.value;
            }
            select.value = '';
            updatePreview();
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        refreshBtn.addEventListener('click', async () => {
            cache = null;
            await fillOptions();
        });

        input.addEventListener('input', updatePreview);
        fillOptions().then(updatePreview);
    }

    function enhanceAll(root = document) {
        root.querySelectorAll('input[name="featured_image_url"], textarea[name="featured_image_url"]').forEach(el => {
            enhanceInput(el, { multi: false });
        });
        root.querySelectorAll('input[name="gallery_urls_csv"], textarea[name="gallery_urls_csv"]').forEach(el => {
            enhanceInput(el, { multi: true });
        });
    }

    return { enhanceAll, enhanceInput, loadMedia, clearCache: () => { cache = null; } };
})();

window.MediaPicker = MediaPicker;
