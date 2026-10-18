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

    // Lấy URL gốc an toàn
    const baseUrl = window.location.origin + window.location.pathname;

    // Hàm mã hóa Unicode sang Base64 chuẩn mã hóa hiện đại (Sửa lỗi liệt nút)
    function encodeData(str) {
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        return btoa(binString);
    }

    // Hàm giải mã Base64 về Unicode chuẩn
    function decodeData(base64) {
        const binString = atob(base64);
        const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

    // BƯỚC 1: KIỂM TRA LINK (Nếu người dùng đang mở một trang con đã mã hóa)
    const urlParams = new URLSearchParams(window.location.search);
    const webData = urlParams.get('web');

    if (webData) {
        try {
            // Giải mã an toàn không sợ lỗi ký tự đặc biệt
            const decodedString = decodeData(webData);
            const decodedData = JSON.parse(decodedString);
            
            // Ghi đè giao diện bằng code HTML được dán
            document.open();
            document.write(decodedData.html);
            document.close();
            
            document.title = decodedData.name || "Web Con Tự Động";
            return; 
        } catch (e) {
            console.error(e);
            document.body.innerHTML = "<h2 style='color:red; text-align:center; margin-top:50px;'>Lỗi: Đường dẫn web này không hợp lệ hoặc đã bị hỏng dữ liệu!</h2>";
            return;
        }
    }

    // BƯỚC 2: XỬ LÝ SỰ KIỆN KHI BẤM NÚT "XUẤT BẢN WEB"
    btnExport.addEventListener("click", () => {
        const tenWeb = webNameInput.value.trim();
        let maHtml = webHtmlTextarea.value.trim();

        if (maHtml === "") {
            alert("Vui lòng dán mã HTML của bạn vào ô nhập liệu!");
            return;
        }

        const tieuDe = tenWeb === "" ? "Website Tự Tạo" : tenWeb;

        // Tự động bổ sung thẻ meta UTF-8 nếu người dùng dán thiếu để không lỗi font tiếng Việt
        if (!maHtml.toLowerCase().includes("<html") && !maHtml.toLowerCase().includes("<body")) {
            maHtml = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${tieuDe}</title>\n</head>\n<body>\n${maHtml}\n</body>\n</html>`;
        } else if (!maHtml.toLowerCase().includes("charset")) {
            maHtml = maHtml.replace("<head>", "<head>\n<meta charset='UTF-8'>");
        }

        try {
            // Đóng gói dữ liệu thành Object và mã hóa bằng hàm mới cực mạnh
            const dataObject = { name: tieuDe, html: maHtml };
            const chuoiMaHoa = encodeData(JSON.stringify(dataObject));

            // Tạo liên kết hoàn chỉnh
            const linkHoanChinh = `${baseUrl}?web=${chuoiMaHoa}`;

            // Hiển thị kết quả ra màn hình
            shortLinkInput.value = linkHoanChinh;
            linkRun.href = linkHoanChinh;
            resultBox.style.display = "block";
            previewZone.style.display = "none";
        } catch (error) {
            alert("Có lỗi xảy ra trong quá trình đóng gói code: " + error.message);
        }
    });

    // BƯỚC 3: XỬ LÝ SỰ KIỆN BẤM "XEM NHANH BÊN DƯỚI"
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
