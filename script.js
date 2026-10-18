document.addEventListener("DOMContentLoaded", () => {
    const btnExport = document.getElementById("btn-export");
    const webNameInput = document.getElementById("web-name");
    const webHtmlTextarea = document.getElementById("web-html");
    const resultBox = document.getElementById("result-box");
    const shortLinkInput = document.getElementById("short-link");
    const linkRun = document.getElementById("link-run");
    const btnPreviewLocal = document.getElementById("btn-preview-local");
    const previewZone = document.getElementById("preview-zone");
    const previewIframe = document.getElementById("preview-iframe");

    // Lấy đường dẫn thư mục gốc hiện tại (Ví dụ: https://github.io)
    const baseUrl = window.location.origin + window.location.pathname;
    
    // Tự động định vị file preview.html nằm chung thư mục
    const previewUrl = baseUrl.endsWith('/') ? baseUrl + 'preview.html' : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1) + 'preview.html';

    // XỬ LÝ SỰ KIỆN KHI BẤM NÚT "XUẤT BẢN WEB"
    btnExport.addEventListener("click", () => {
        const tenWeb = webNameInput.value.trim();
        let maHtml = webHtmlTextarea.value.trim();

        if (maHtml === "") {
            alert("Vui lòng dán mã HTML của bạn vào ô nhập liệu!");
            return;
        }

        const tieuDe = tenWeb === "" ? "Website Tự Tạo" : tenWeb;

        // Tự động bổ sung các thẻ bao ngoài nếu người dùng dán thiếu code
        if (!maHtml.toLowerCase().includes("<html") && !maHtml.toLowerCase().includes("<body")) {
            maHtml = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${tieuDe}</title>\n</head>\n<body>\n${maHtml}\n</body>\n</html>`;
        } else if (!maHtml.toLowerCase().includes("charset")) {
            maHtml = maHtml.replace("<head>", "<head>\n<meta charset='UTF-8'>");
        }

        try {
            // Mã hóa chuỗi HTML sang dạng Base64 an toàn cho URL
            const safeString = encodeURIComponent(maHtml);
            const base64Result = btoa(safeString);
            
            // TẠO LINK RÚT GỌN TRỎ THẲNG ĐẾN FILE PREVIEW.HTML
            const linkHoanChinh = `${previewUrl}?web=${base64Result}`;

            // Hiển thị kết quả ra màn hình
            shortLinkInput.value = linkHoanChinh;
            linkRun.href = linkHoanChinh;
            resultBox.style.display = "block";
            previewZone.style.display = "none";
        } catch (error) {
            alert("Lỗi mã hóa dữ liệu: " + error.message);
        }
    });

    // XEM TRƯỚC TRỰC TIẾP QUA IFRAME TRÊN TRANG CHỦ
    if (btnPreviewLocal) {
        btnPreviewLocal.addEventListener("click", () => {
            let maHtml = webHtmlTextarea.value.trim();
            if (maHtml === "") {
                alert("Không có mã HTML nào để xem thử!");
                return;
            }
            previewZone.style.display = "block";
            const doc = previewIframe.contentWindow.document;
            doc.open();
            doc.write(maHtml);
            doc.close();
            previewZone.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
