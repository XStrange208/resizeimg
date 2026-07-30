document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const imageList = document.getElementById('image-list');
    const actionsContainer = document.getElementById('actions-container');
    const btnCompress = document.getElementById('btn-compress');
    const btnDownloadAll = document.getElementById('btn-download-all');
    const btnClear = document.getElementById('btn-clear');

    let filesData = []; // Mảng lưu trữ thông tin các file (original, compressed, status)

    // Format bytes to KB/MB
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // Xử lý sự kiện kéo thả
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFilesSelect);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFilesSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (newFiles.length === 0) return;

        actionsContainer.style.display = 'flex';
        
        newFiles.forEach(file => {
            const id = Math.random().toString(36).substr(2, 9);
            const objectUrl = URL.createObjectURL(file);
            
            const fileData = {
                id,
                originalFile: file,
                originalUrl: objectUrl,
                compressedFile: null,
                compressedUrl: null,
                status: 'pending' // pending, processing, success, error
            };
            
            filesData.push(fileData);
            renderFileCard(fileData);
        });

        // Reset file input so same file can be selected again if needed
        fileInput.value = '';
    }

    function renderFileCard(data) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.id = `card-${data.id}`;
        
        card.innerHTML = `
            <img src="${data.originalUrl}" alt="${data.originalFile.name}" class="image-preview">
            <div class="image-info">
                <div class="image-name" title="${data.originalFile.name}">${data.originalFile.name}</div>
                <div class="image-stats">
                    <span>Gốc: ${formatBytes(data.originalFile.size)}</span>
                    <span class="compressed-size" id="size-${data.id}">Nén: --</span>
                </div>
                <div class="status-badge status-${data.status}" id="status-${data.id}">
                    Chờ xử lý
                </div>
            </div>
            <div class="card-actions" id="actions-${data.id}" style="display: none;">
                <button class="btn secondary download-btn" data-id="${data.id}">Tải về</button>
            </div>
        `;
        
        imageList.appendChild(card);
        
        // Gắn sự kiện download cho nút
        const downloadBtn = card.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => downloadSingleFile(data.id));
    }

    function updateCardStatus(id, status, compressedSizeStr = null) {
        const statusBadge = document.getElementById(`status-${id}`);
        if (statusBadge) {
            statusBadge.className = `status-badge status-${status}`;
            if (status === 'processing') statusBadge.textContent = 'Đang nén...';
            else if (status === 'success') statusBadge.textContent = 'Hoàn thành';
            else if (status === 'error') statusBadge.textContent = 'Lỗi';
            else statusBadge.textContent = 'Chờ xử lý';
        }

        if (compressedSizeStr) {
            const sizeEl = document.getElementById(`size-${id}`);
            if (sizeEl) sizeEl.textContent = `Nén: ${compressedSizeStr}`;
        }

        if (status === 'success') {
            const actionsEl = document.getElementById(`actions-${id}`);
            if (actionsEl) actionsEl.style.display = 'flex';
        }
    }

    // Logic nén ảnh
    btnCompress.addEventListener('click', async () => {
        const pendingFiles = filesData.filter(f => f.status === 'pending' || f.status === 'error');
        if (pendingFiles.length === 0) return;

        btnCompress.disabled = true;
        btnCompress.textContent = 'Đang xử lý...';

        const options = {
            maxSizeMB: 0.5, // 500KB = 0.5MB
            maxWidthOrHeight: 1920, // Kích thước tối đa hợp lý
            useWebWorker: true
        };

        let successCount = 0;

        for (const data of pendingFiles) {
            updateCardStatus(data.id, 'processing');
            
            try {
                const compressedFile = await imageCompression(data.originalFile, options);
                
                // Nếu ảnh gốc đã nhỏ hơn 500KB và kết quả nén ra to hơn thì giữ nguyên ảnh gốc
                let finalFile = compressedFile;
                if (data.originalFile.size <= 500 * 1024 && compressedFile.size > data.originalFile.size) {
                    finalFile = data.originalFile;
                }

                data.compressedFile = finalFile;
                data.compressedUrl = URL.createObjectURL(finalFile);
                data.status = 'success';
                
                updateCardStatus(data.id, 'success', formatBytes(finalFile.size));
                successCount++;
                
                // Cập nhật ảnh preview thành ảnh nén (tùy chọn)
                const cardImg = document.querySelector(`#card-${data.id} .image-preview`);
                if (cardImg) cardImg.src = data.compressedUrl;
                
            } catch (error) {
                console.error(`Lỗi khi nén ảnh ${data.originalFile.name}:`, error);
                data.status = 'error';
                updateCardStatus(data.id, 'error');
            }
        }

        btnCompress.disabled = false;
        btnCompress.textContent = 'Bắt Đầu Nén';
        
        if (successCount > 0) {
            btnDownloadAll.disabled = false;
        }
    });

    // Logic tải về 1 ảnh
    function downloadSingleFile(id) {
        const data = filesData.find(f => f.id === id);
        if (data && data.compressedUrl) {
            const a = document.createElement('a');
            a.href = data.compressedUrl;
            
            // Thêm tiền tố để phân biệt
            const originalName = data.originalFile.name;
            const extensionIndex = originalName.lastIndexOf('.');
            const name = originalName.substring(0, extensionIndex);
            const ext = originalName.substring(extensionIndex);
            
            a.download = `${name}_compressed${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    // Logic tải về tất cả dạng ZIP
    btnDownloadAll.addEventListener('click', async () => {
        const successFiles = filesData.filter(f => f.status === 'success' && f.compressedFile);
        if (successFiles.length === 0) return;

        btnDownloadAll.disabled = true;
        btnDownloadAll.textContent = 'Đang đóng gói...';

        const zip = new JSZip();
        
        successFiles.forEach((data, index) => {
            const originalName = data.originalFile.name;
            const extensionIndex = originalName.lastIndexOf('.');
            const name = originalName.substring(0, extensionIndex);
            const ext = originalName.substring(extensionIndex);
            
            // Xử lý trùng lặp tên file nếu có
            const fileName = `${name}_compressed${ext}`;
            zip.file(fileName, data.compressedFile);
        });

        try {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "compressed_images.zip");
        } catch (error) {
            console.error("Lỗi khi tạo file zip:", error);
            alert("Có lỗi xảy ra khi tạo file zip.");
        }

        btnDownloadAll.disabled = false;
        btnDownloadAll.textContent = 'Tải Tất Cả (.zip)';
    });

    // Nút làm mới
    btnClear.addEventListener('click', () => {
        // Thu hồi các Object URL để giải phóng bộ nhớ
        filesData.forEach(data => {
            if (data.originalUrl) URL.revokeObjectURL(data.originalUrl);
            if (data.compressedUrl) URL.revokeObjectURL(data.compressedUrl);
        });
        
        filesData = [];
        imageList.innerHTML = '';
        actionsContainer.style.display = 'none';
        btnDownloadAll.disabled = true;
        
        // Reset file input
        fileInput.value = '';
    });
});
