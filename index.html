document.addEventListener("DOMContentLoaded", () => {
    const btnExport = document.getElementById("btn-export");
    const webNameInput = document.getElementById("web-name");
    const webThemeSelect = document.getElementById("web-theme");
    const resultBox = document.getElementById("result-box");
    const shortLinkInput = document.getElementById("short-link");
    const linkRun = document.getElementById("link-run");
    const btnPreviewLocal = document.getElementById("btn-preview-local");
    const previewZone = document.getElementById("preview-zone");
    const previewContent = document.getElementById("preview-content");

    // Lấy URL hiện tại (Ví dụ: https://github.io)
    const baseUrl = window.location.href.split('?')[0].split('#')[0];

    // KIỂM TRA: Nếu link chứa mã dữ liệu "?web=" tức là đang mở một web con đã tạo
    const urlParams = new URLSearchParams(window.location.search);
    const webData = urlParams.get('web');

    if (webData) {
        try {
            // Giải mã chuỗi mã hóa ngược lại thành dữ liệu WebBanDau
            const decodedData = JSON.parse(atob(webData));
            // Đan và render thẳng HTML của web con thay thế toàn bộ trang tạo web
            document.body.innerHTML = taoTemplateHTML(decodedData.name, decodedData.theme);
            document.title = decodedData.name;
            return; // Dừng script tại đây để không chạy trình tạo nữa
        } catch (e) {
            console.error("Lỗi giải mã link web!", e);
        }
    }

    // HÀM ĐAN SCRIPT VÀ HTML ĐỂ TẠO RA WEBSITE MỚI
    function taoTemplateHTML(tenWeb, giaoDien) {
        let mauNen = "#3498db", mauChu = "#fff";
        if (giaoDien === "vintage") { mauNen = "#e67e22"; }
        if (giaoDien === "dark") { mauNen = "#2c3e50"; }

        // Đan chuỗi HTML và CSS hoàn chỉnh cho web con
        return `
            <div style="font-family: sans-serif; text-align: center; padding: 50px; background: ${mauNen}; color: ${mauChu}; min-height: 100vh; margin: 0; box-sizing: border-box;">
                <div style="background: rgba(25px, 25px, 25px, 0.2); padding: 30px; display: inline-block; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                    <h1 style="font-size: 32px; margin-bottom: 10px;">✨ ${tenWeb} ✨</h1>
                    <p style="font-size: 18px; opacity: 0.9;">Chào mừng bạn đến với trang web con được tạo tự động.</p>
                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.4); margin: 20px 0;">
                    <button onclick="alert('Xin chào từ website: ${tenWeb}!')" style="padding: 10px 20px; font-size: 16px; border: none; border-radius: 20px; background: #fff; color: ${mauNen}; font-weight: bold; cursor: pointer;">
                        Click Tương Tác
                    </button>
                </div>
            </div>
        `;
    }

    // SỰ KIỆN KHI BẤM NÚT "XUẤT WEB"
    btnExport.addEventListener("click", () => {
        const tenWeb = webNameInput.value.trim();
        const giaoDien = webThemeSelect.value;

        if (tenWeb === "") {
            alert("Vui lòng nhập tên website trước khi xuất!");
            return;
        }

        // Đóng gói thông tin web thành một Object dữ liệu gọn nhẹ
        const dataObject = { name: tenWeb, theme: giaoDien };
        
        // Kỹ thuật rút gọn/nén: Chuyển Object thành chuỗi JSON rồi mã hóa Base64 (btoa)
        const stringMaHoa = btoa(unescape(encodeURIComponent(JSON.stringify(dataObject))));

        // Tạo link rút gọn chứa toàn bộ dữ liệu cấu trúc web con
        const linkRutGọnHoanChinh = `${baseUrl}?web=${stringMaHoa}`;

        // Hiển thị kết quả lên giao diện
        shortLinkInput.value = linkRutGọnHoanChinh;
        linkRun.href = linkRutGọnHoanChinh;
        resultBox.style.display = "block";
        previewZone.style.display = "none"; // Ẩn xem thử trước đó đi nếu có
    });

    // SỰ KIỆN BẤM XEM THỬ NGAY TẠI TRANG CHỦ (KHÔNG LO BỊ LAG)
    btnPreviewLocal.addEventListener("click", () => {
        const tenWeb = webNameInput.value.trim();
        const giaoDien = webThemeSelect.value;
        
        // Đơm mã HTML chạy thử trực tiếp vào thẻ div ở dưới để test nhanh
        previewContent.innerHTML = taoTemplateHTML(tenWeb, giaoDien);
        previewZone.style.display = "block";
        
        // Cuộn màn hình mượt mà xuống khu vực chạy thử
        previewZone.scrollIntoView({ behavior: 'smooth' });
    });
});
