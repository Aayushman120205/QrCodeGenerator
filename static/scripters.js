const fileInput = document.getElementById('fileInput');
const generateQrBtn = document.getElementById('generateQrBtn');
const fileTableBody = document.getElementById('fileTableBody');
const qrCanvas = document.getElementById('qrCanvas');
const fileInfo = document.getElementById('fileInfo');
const downloadQrBtn = document.getElementById('downloadQrBtn');

let qrData = [];

generateQrBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) return alert("Please select a PDF file");

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/qr/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        fileInput.value = '';
        fetchAllQr();
    })
    .catch(err => alert("Upload failed: " + err));
});

function fetchAllQr() {
    fetch('/api/qr/')
    .then(res => res.json())
    .then(data => {
        qrData = data;
        renderTable();
    });
}

function renderTable() {
    fileTableBody.innerHTML = '';
    qrData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" data-index="${index}" class="select-checkbox"></td>
            <td>${item.file.split('/').pop()}</td>
            <td><span class="action-btn text-blue-500 view-btn" data-index="${index}">View</span></td>
        `;
        fileTableBody.appendChild(row);
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.getAttribute('data-index');
            const file = qrData[index];

            // Show QR image in display area
            qrCanvas.innerHTML = `<img src="${file.qr_code}" alt="QR Code" class="w-48 h-48" />`;
            fileInfo.textContent = `File: ${file.file.split('/').pop()}`;

            // Download QR when button is clicked
            downloadQrBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = file.qr_code;
                const baseName = file.file.split('/').pop().replace('.pdf', '');
                link.download = `${baseName}_qr.png`;
                link.click();
            };
            downloadQrBtn.classList.remove('hidden');
        });
    });
}

// ✅ Initial fetch on page load
fetchAllQr();

function getCSRFToken() {
  const name = "csrftoken=";
  const decoded = decodeURIComponent(document.cookie);
  const parts = decoded.split(";");
  for (let c of parts) {
    c = c.trim();
    if (c.startsWith(name)) return c.slice(name.length);
  }
  return "";
}

document.getElementById('downloadZipBtn').addEventListener('click', async () => {
    const selectedIndexes = Array.from(document.querySelectorAll('.select-checkbox:checked')).map(cb => cb.getAttribute('data-index'));
    if (selectedIndexes.length === 0) return alert("Please select at least one file");

    const zip = new JSZip();
    const folder = zip.folder("qr_codes");

    for (const index of selectedIndexes) {
        const qrItem = qrData[index];
        const response = await fetch(qrItem.qr_code);
        const blob = await response.blob();
        const fileName = `qr_${qrItem.file.split('/').pop()}.png`;
        folder.file(fileName, blob);
    }

    zip.generateAsync({ type: "blob" })
        .then(content => {
            saveAs(content, "selected_qr_codes.zip");
        })
        .catch(err => alert("Failed to zip files: " + err));
});
