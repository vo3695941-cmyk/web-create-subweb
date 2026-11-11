document.addEventListener("DOMContentLoaded", () => {
    const btnExport = document.getElementById("btn-export");
    const webNameInput = document.getElementById("web-name");
    const webHtmlTextarea = document.getElementById("web-html");
    const webCssTextarea = document.getElementById("web-css");
    const webJsTextarea = document.getElementById("web-js");
    const webPyTextarea = document.getElementById("web-py");
    const consoleToggleSelect = document.getElementById("console-toggle");
    const resultBox = document.getElementById("result-box");
    const shortLinkInput = document.getElementById("short-link");
    const linkRun = document.getElementById("link-run");
    const btnPreviewLocal = document.getElementById("btn-preview-local");
    const previewZone = document.getElementById("preview-zone");
    const previewIframe = document.getElementById("preview-iframe");

    const btnOpenDocs = document.getElementById("btn-open-docs");
    const btnCloseDocs = document.getElementById("btn-close-docs");
    const docsModal = document.getElementById("docs-modal");

    // Quản lý ẩn/hiện hộp thoại tài liệu docs
    if (btnOpenDocs && docsModal) {
        btnOpenDocs.addEventListener("click", () => { docsModal.style.display = "flex"; });
    }
    if (btnCloseDocs && docsModal) {
        btnCloseDocs.addEventListener("click", () => { docsModal.style.display = "none"; });
    }
    if (docsModal) {
        docsModal.addEventListener("click", (e) => { if (e.target === docsModal) docsModal.style.display = "none"; });
    }

    // Khởi tạo cấu hình URL tương thích an toàn với môi trường GitHub Pages
    const baseUrl = window.location.origin + window.location.pathname;
    const previewUrl = baseUrl.endsWith('/') ? baseUrl + 'preview.html' : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1) + 'preview.html';

    // Hàm mã hóa dữ liệu dạng chuỗi Base64 an toàn cho URL (Không dùng async chặn nút trên mobile)
    function encodeDataSafe(str) {
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        const base64 = btoa(binString);
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+\$/, '');
    }

    // Cơ chế trộn logic đan trực tiếp thẻ Python tĩnh để PyScript quét trúng 100% ngay khi tải trang
    function trộnCode(tieuDe, html, css, js, py, consoleMode) {
        let fileHoanChinh = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>' + tieuDe + '</title>\n';
        
        if (py.length > 0) {
            // Tích hợp bộ đôi liên kết tài nguyên PyScript chính thức phiên bản ổn định 2026.7.3
            fileHoanChinh += '<link rel="stylesheet" href="https://pyscript.net/releases/2026.7.3/core.css" />\n';
            fileHoanChinh += '<script type="module" src="https://pyscript.net/releases/2026.7.3/core.js"><\/script>\n';
        }
        
        if (css.length > 0) { 
            fileHoanChinh += '<style>\n' + css + '\n</style>\n'; 
        }
        
        fileHoanChinh += '</head>\n<body>\n' + html + '\n';
        
        if (py.length > 0) {
            // Tạo phân vùng đích tĩnh trước khi nhúng mã thực thi để PyScript tìm thấy ID target lập tức
            if (consoleMode === "on") {
                fileHoanChinh += '<div id="python-output" style="margin:20px; padding:15px; background:#1e1e1e; color:#00ff00; font-family:monospace; border-radius:5px; white-space:pre-wrap; text-align:left; box-shadow:0 4px 10px rgba(0,0,0,0.3); line-height:1.5;">⏳ Đang nạp môi trường Python...</div>\n';
                // Nhúng cấu trúc thẻ tĩnh hướng luồng in chữ vào hộp đen Terminal tự động
                fileHoanChinh += `<script type="py" target="python-output">\n${py}\n<\/script>\n`;
            } else {
                fileHoanChinh += '<div id="pyscript-screen-container" style="margin:10px 20px; font-family:sans-serif; font-size:16px; color:#333; text-align:left; white-space:pre-wrap;"></div>\n';
                // Nhúng cấu trúc thẻ tĩnh hướng luồng in chữ trực tiếp thẳng vào document.body
                fileHoanChinh += `<script type="py" target="pyscript-screen-container">\n${py}\n<\/script>\n`;
            }
        }
        
        if (js.length > 0) { 
            fileHoanChinh += '<script>\n' + js + '\n<\/script>\n'; 
        }
        
        fileHoanChinh += '</body>\n</html>';
        return fileHoanChinh;
    }

    // XỬ LÝ SỰ KIỆN KHI NGƯỜI DÙNG NHẤN NÚT XUẤT BẢN WEBSITE
    if (btnExport) {
        btnExport.addEventListener("click", () => {
            const tenWeb = webNameInput ? webNameInput.value.trim() : "";
            const html = webHtmlTextarea ? webHtmlTextarea.value.trim() : "";
            const css = webCssTextarea ? webCssTextarea.value.trim() : "";
            const js = webJsTextarea ? webJsTextarea.value.trim() : "";
            const py = webPyTextarea ? webPyTextarea.value.trim() : "";
            const consoleMode = consoleToggleSelect ? consoleToggleSelect.value : "on";

            if (html === "" && css === "" && js === "" && py === "") {
                alert("Vui lòng nhập nội dung vào ít nhất một ô mã nguồn!");
                return;
            }

            const tieuDe = tenWeb === "" ? "Website Tự Tạo" : tenWeb;
            const codeDaTron = trộnCode(tieuDe, html, css, js, py, consoleMode);

            try {
                // Mã hóa chuỗi nén an toàn và kết xuất liên kết
                const chuoiMaHoa = encodeDataSafe(codeDaTron);
                const linkHoanChinh = previewUrl + '?web=' + chuoiMaHoa;

                if (shortLinkInput) shortLinkInput.value = linkHoanChinh;
                if (linkRun) linkRun.href = linkHoanChinh;
                if (resultBox) resultBox.style.display = "block";
                if (previewZone) previewZone.style.display = "none";
            } catch (error) {
                alert("Lỗi xử lý đóng gói liên kết: " + error.message);
            }
        });
    }

    // CƠ CHẾ KHỞI CHẠY XEM TRƯỚC TẠI CHỖ QUA PHÂN KHU IFRAME CÔ LẬP
    if (btnPreviewLocal) {
        btnPreviewLocal.addEventListener("click", () => {
            const tieuDe = (webNameInput ? webNameInput.value.trim() : "") || "Xem thử";
            const html = webHtmlTextarea ? webHtmlTextarea.value.trim() : "";
            const css = webCssTextarea ? webCssTextarea.value.trim() : "";
            const js = webJsTextarea ? webJsTextarea.value.trim() : "";
            const py = webPyTextarea ? webPyTextarea.value.trim() : "";
            const consoleMode = consoleToggleSelect ? consoleToggleSelect.value : "on";
            
            if (previewZone && previewIframe) {
                previewZone.style.display = "block";
                const doc = previewIframe.contentWindow.document;
                doc.open();
                doc.write(trộnCode(tieuDe, html, css, js, py, consoleMode));
                doc.close();
                previewZone.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
