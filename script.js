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

    // Lấy URL sạch của trang hiện tại (Bảo đảm hoạt động đúng trên GitHub Pages)
    const baseUrl = window.location.origin + window.location.pathname;

    // BƯỚC 1: GIẢI MÃ VÀ HIỂN THỊ WEB CON (Khi có tham số ?web= trên link)
    const urlParams = new URLSearchParams(window.location.search);
    const webData = urlParams.get('web');

    if (webData) {
        try {
            // Giải mã an toàn chuỗi Base64 và Unicode (Khắc phục lỗi chữ đỏ)
            const decodedHtml = decodeURIComponent(atob(webData.replace(/-/g, '+').replace(/_/g, '/')));
            
            // Ghi đè toàn bộ nội dung trang bằng mã HTML đã được dán
            document.open();
            document.write(decodedHtml);
            document.close();
            return; // Dừng chạy trình tạo web
        } catch (e) {
            console.error("Lỗi dựng trang: ", e);
            document.body.innerHTML = `
                <div style="font-family:sans-serif; text-align:center; padding:50px; color:#e74c3c;">
                    <h2>❌ Lỗi: Không thể khởi dựng mã HTML này!</h2>
                    <p>Đường dẫn có thể đã bị thiếu ký tự khi sao chép hoặc chứa mã không tương thích.</p>
                </div>
            `;
            return;
        }
    }

    // BƯỚC 2: MÃ HÓA VÀ XUẤT BẢN WEBSITE MỚI (Khi nhấn nút)
    btnExport.addEventListener("click", () => {
        const tenWeb = webNameInput.value.trim();
        let maHtml = webHtmlTextarea.value.trim();

        if (maHtml === "") {
            alert("Vui lòng dán mã HTML của bạn vào ô nhập liệu!");
            return;
        }

        const tieuDe = tenWeb === "" ? "Website Tự Tạo" : tenWeb;

        // Tự động chuẩn hóa khung nếu người dùng dán code thiếu thẻ bọc ngoài
        if (!maHtml.toLowerCase().includes("<html") && !maHtml.toLowerCase().includes("<body")) {
            maHtml = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${tieuDe}</title>\n</head>\n<body>\n${maHtml}\n</body>\n</html>`;
        } else if (!maHtml.toLowerCase().includes("charset")) {
            maHtml = maHtml.replace("<head>", "<head>\n<meta charset='UTF-8'>");
        }

        try {
            // Thực hiện chuyển đổi chuỗi HTML sang dạng an toàn với các ký tự đặc biệt
            const safeString = encodeURIComponent(maHtml);
            
            // Mã hóa chuỗi sang Base64 chuẩn hóa (Loại bỏ các ký tự gây lỗi URL)
            let base64Result = btoa(safeString);
            
            // Tạo liên kết rút gọn hoàn chỉnh
            const linkHoanChinh = `${baseUrl}?web=${base64Result}`;

            // Đưa link ra khung hiển thị kết quả
            shortLinkInput.value = linkHoanChinh;
            linkRun.href = linkHoanChinh;
            resultBox.style.display = "block";
            previewZone.style.display = "none";
        } catch (error) {
            alert("Lỗi mã hóa dữ liệu: " + error.message);
        }
    });

    // BƯỚC 3: XEM TRƯỚC TRỰC TIẾP QUA IFRAME
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
