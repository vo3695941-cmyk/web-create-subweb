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

    // FIX BUG: Lấy URL gốc chính xác, loại bỏ các tham số ? và # phía sau một cách an toàn
    const baseUrl = window.location.origin + window.location.pathname;

    // BƯỚC 1: KIỂM TRA LINK (Nếu người dùng đang mở một trang con đã mã hóa)
    const urlParams = new URLSearchParams(window.location.search);
    const webData = urlParams.get('web');

    if (webData) {
        try {
            // Giải mã Base64 ngược lại thành chuỗi Object ban đầu
            const decodedData = JSON.parse(decodeURIComponent(escape(atob(webData))));
            
            // Xóa sạch nội dung trình tạo web chính, ghi đè toàn bộ bằng code HTML được dán
            document.open();
            document.write(decodedData.html);
            document.close();
            
            // Cập nhật lại tiêu đề trang
            document.title = decodedData.name || "Web Con Tự Động";
            return; // Ngắt script, không chạy phần tạo web nữa
        } catch (e) {
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

        // Nếu người dùng quên không nhập tiêu đề, tự động lấy mặc định
        const tieuDe = tenWeb === "" ? "Website Tự Tạo" : tenWeb;

        // Nếu mã dán vào không có khung HTML chuẩn, hệ thống tự động bọc lại để tránh lỗi hiển thị
        if (!maHtml.toLowerCase().includes("<html") && !maHtml.toLowerCase().includes("<body")) {
            maHtml = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${tieuDe}</title>\n</head>\n<body>\n${maHtml}\n</body>\n</html>`;
        }

        // Đóng gói dữ liệu thành Object
        const dataObject = { name: tieuDe, html: maHtml };
        
        // Chuẩn hóa và mã hóa Base64 an toàn cho mọi ký tự đặc biệt (kể cả tiếng Việt có dấu)
        const chuoiMaHoa = btoa(unescape(encodeURIComponent(JSON.stringify(dataObject))));

        // Tạo ra link chứa toàn bộ nội dung web con
        const linkHoanChinh = `${baseUrl}?web=${chuoiMaHoa}`;

        // Hiển thị kết quả ra màn hình cho người dùng copy
        shortLinkInput.value = linkHoanChinh;
        linkRun.href = linkHoanChinh;
        resultBox.style.display = "block";
        previewZone.style.display = "none"; // Ẩn xem thử cũ đi
    });

    // BƯỚC 3: XỬ LÝ SỰ KIỆN BẤM "XEM NHANH BÊN DƯỚI"
    btnPreviewLocal.addEventListener("click", () => {
        let maHtml = webHtmlTextarea.value.trim();
        
        if (maHtml === "") {
            alert("Không có mã HTML nào để xem thử!");
            return;
        }

        previewZone.style.display = "block";
        
        // Nạp thẳng mã HTML vào khung iframe để chạy thử độc lập tại chỗ
        const doc = previewIframe.contentWindow.document;
        doc.open();
        doc.write(maHtml);
        doc.close();

        // Cuộn màn hình xuống vùng xem thử
        previewZone.scrollIntoView({ behavior: 'smooth' });
    });
});
