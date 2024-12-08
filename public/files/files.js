        // Sample file data
        let files = [];

        const fileGrid = document.querySelector('.file-grid');
        const searchBar = document.querySelector('.search-bar');
        const previewPanel = document.querySelector('.preview-panel');
        const toggleBtn = document.getElementById('toggleBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadModal = document.getElementById('uploadModal');
        const closeModal = document.querySelector('.close');
        const fileInput = document.getElementById('fileInput');
        const uploadFileBtn = document.getElementById('uploadFileBtn');
        const uploadProgressBar = document.getElementById('uploadProgressBar');

        let selectedFile = null;

        // Add API configuration
        const API_BASE_URL = 'https://coreapi.inovasolutions.ai';
        const dataset_id = 'fd268f12-4952-4dac-8d2a-f8cdf3b0d6f0';
        const api_key = 'dataset-yjpBGgEpw3sdVP0bSWKU4d96';

        // Add new function to fetch files from dataset
        async function fetchFiles() {
            try {
                const response = await fetch(`${API_BASE_URL}/v1/datasets/${dataset_id}/documents`, {
                    headers: {
                        'Authorization': `Bearer ${api_key}`
                    }
                });
                const data = await response.json();
                
                // Transform API response to match our file format
                files = data.data.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    size: `${doc.tokens} tokens`,
                    type: doc.name.split('.').pop().toUpperCase(),
                    enabled: doc.enabled
                }));
                
                renderFiles(files);
                updatePreviewPanel();
            } catch (error) {
                console.error('Error fetching files:', error);
            }
        }

        function createFileCard(file) {
            const card = document.createElement('div');
            card.className = `file-card ${file.enabled ? '' : 'disabled'}`;
            card.dataset.fileId = file.id;
            card.innerHTML = `
                <div class="file-icon">${file.type}</div>
                <div class="file-name">${file.name}</div>
                <div class="file-info">
                    <span>${file.size}</span>
                </div>
                <div class="file-actions">
                    <button class="action-btn" title="Star">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                    </button>
                    <button class="action-btn" title="More">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                    </button>
                </div>
            `;
            card.addEventListener('click', () => selectFile(file));
            return card;
        }

        function renderFiles(filesToRender) {
            fileGrid.innerHTML = '';
            filesToRender.forEach(file => {
                fileGrid.appendChild(createFileCard(file));
            });
        }

        function filterFiles(query) {
            return files.filter(file => 
                file.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        function selectFile(file) {
            selectedFile = file;
            updatePreviewPanel();
            
            // Add mobile-specific behavior
            if (window.innerWidth <= 1024) {
                const previewPanel = document.querySelector('.preview-panel');
                const overlay = document.querySelector('.sidebar-overlay');
                if (previewPanel) previewPanel.classList.add('active');
                if (overlay) overlay.classList.add('active');
            }
        }

        function updatePreviewPanel() {
            const previewPanel = document.querySelector('.preview-panel');
            if (!previewPanel) return;

            if (selectedFile) {
                previewPanel.querySelector('.file-icon').textContent = selectedFile.type;
                previewPanel.querySelector('.file-name').textContent = selectedFile.name;
                previewPanel.querySelector('.file-size').textContent = selectedFile.size;
                toggleBtn.textContent = selectedFile.enabled ? 'Disable' : 'Enable';
                toggleBtn.classList.toggle('disabled', !selectedFile.enabled);
            } else {
                previewPanel.querySelector('.file-icon').textContent = '';
                previewPanel.querySelector('.file-name').textContent = 'No file selected';
                previewPanel.querySelector('.file-size').textContent = '';
                toggleBtn.textContent = 'Enable';
                toggleBtn.classList.add('disabled');
                
                // Close sidebar on mobile when no file is selected
                if (window.innerWidth <= 1024) {
                    closeSidebar();
                }
            }
        }

        // Modify toggleFile to use API
        async function toggleFile() {
            if (selectedFile) {
                try {
                    const response = await fetch(`${API_BASE_URL}/v1/datasets/${dataset_id}/documents/${selectedFile.id}/segments`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${api_key}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            segments: [{
                                content: selectedFile.name,
                                enabled: !selectedFile.enabled
                            }]
                        })
                    });

                    if (response.ok) {
                        selectedFile.enabled = !selectedFile.enabled;
                        updatePreviewPanel();
                        renderFiles(files);
                    } else {
                        console.error('Failed to toggle file:', await response.json());
                    }
                } catch (error) {
                    console.error('Error toggling file:', error);
                }
            }
        }

        // Modify deleteFile to use API
        async function deleteFile() {
            if (selectedFile) {
                try {
                    const response = await fetch(`${API_BASE_URL}/v1/datasets/${dataset_id}/documents/${selectedFile.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${api_key}`
                        }
                    });

                    if (response.ok) {
                        files = files.filter(file => file.id !== selectedFile.id);
                        selectedFile = null;
                        updatePreviewPanel();
                        renderFiles(files);
                    }
                } catch (error) {
                    console.error('Error deleting file:', error);
                }
            }
        }

        function openUploadModal() {
            uploadModal.style.display = 'block';
        }

        function closeUploadModal() {
            uploadModal.style.display = 'none';
            fileInput.value = '';
            uploadProgressBar.style.width = '0%';
        }

        // Modify simulateFileUpload to actually upload to dataset
        async function simulateFileUpload() {
            const file = fileInput.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('data', JSON.stringify({
                indexing_technique: "high_quality",
                process_rule: { mode: "automatic" }
            }));

            try {
                uploadProgressBar.style.width = '50%';
                
                const response = await fetch(`${API_BASE_URL}/v1/datasets/${dataset_id}/document/create_by_file`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${api_key}`
                    },
                    body: formData
                });
                
                uploadProgressBar.style.width = '100%';
                
                if (response.ok) {
                    const result = await response.json();
                    // Refresh file list
                    await fetchFiles();
                    closeUploadModal();
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        searchBar.addEventListener('input', (e) => {
            const filteredFiles = filterFiles(e.target.value);
            renderFiles(filteredFiles);
        });

        toggleBtn.addEventListener('click', toggleFile);
        deleteBtn.addEventListener('click', deleteFile);
        uploadBtn.addEventListener('click', openUploadModal);
        closeModal.addEventListener('click', closeUploadModal);
        uploadFileBtn.addEventListener('click', simulateFileUpload);

        // Modify initial render to fetch files from API
        document.addEventListener('DOMContentLoaded', () => {
            initializeMobileUI();
            fetchFiles();
        });

        // Add new function to close sidebar
        function closeSidebar() {
            const previewPanel = document.querySelector('.preview-panel');
            const overlay = document.querySelector('.sidebar-overlay');
            if (previewPanel) previewPanel.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }

        // Add click handler for overlay
        document.querySelector('.sidebar-overlay').addEventListener('click', () => {
            closeSidebar();
        });

        // Add this after the main-content div in your existing code
        document.querySelector('.main-content').insertAdjacentHTML('beforeend', `
            <div class="sidebar-overlay"></div>
        `);

        // Add this function at the start of your JavaScript
        function initializeMobileUI() {
            // Add the overlay div if it doesn't exist
            if (!document.querySelector('.sidebar-overlay')) {
                document.querySelector('.main-content').insertAdjacentHTML('beforeend', `
                    <div class="sidebar-overlay"></div>
                `);
            }

            // Add click handler for overlay
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.addEventListener('click', closeSidebar);
            }
        }

        // Add handler for escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.innerWidth <= 1024) {
                closeSidebar();
            }
        });

        // Handle resize events
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                // Reset classes when returning to desktop view
                const previewPanel = document.querySelector('.preview-panel');
                const overlay = document.querySelector('.sidebar-overlay');
                if (previewPanel) previewPanel.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            }
        });