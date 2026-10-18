document.addEventListener("DOMContentLoaded", () => {
    const btnExport = document.getElementById("btn-export");
    const webNameInput = document.getElementById("web-name");
    const webHtmlTextarea = document.getElementById("web-html");
    const webCssTextarea = document.getElementById("web-css");
    const webJsTextarea = document.getElementById("web-js");
    const resultBox = document.getElementById("result-box");
    const shortLinkInput = document.getElementById("short-link");
    const linkRun = document.getElementById("link-run");
    const btnPreviewLocal = document.getElementById("btn-preview-local");
    const previewZone = document.getElementById("preview-zone");
    const previewIframe = document.getElementById("preview-iframe");

    const baseUrl = window.location.origin + window.location.pathname;
    const previewUrl = baseUrl.endsWith('/') ? baseUrl + 'preview.html' : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1) + 'preview.html';

    // Hàm nén chuỗi văn bản bằng Gzip rồi chuyển sang Base64 (Giúp rút gọn link tối đa)
    async function compressAndEncode(string) {
        const byteArray = new TextEncoder().encode(string);
        const cs = new CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        writer.write(byteArray);
        writer.close();
        
        const outputBuffer = await new Response(cs.readable).arrayBuffer();
        const base64String = btoa(String.fromCharCode(...new Uint8Array(outputBuffer)));
        // Thay thế các ký tự không an toàn cho URL thành định dạng an toàn
        return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+\$/, '');
    }

    // Hàm đan 3 thành phần HTML, CSS, JS thành một cấu trúc Web hoàn chỉnh
    function trộnCode(tieuDe, html, css, js) {
        let fileHoanChinh = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${tieuDe}</title>\n`;
        if (css.length > 0) {
            fileHoanChinh += `<style>\n${css}\n</style>\n`;
        }
        fileHoanChinh += `</head>\n<body>\n${html}\n`;
        if (js.length > 0) {
            fileHoanChinh += `<script>\n${js}\n<\/script>\n`;
        }
        fileHoanChinh += `</body>\n</html>`;
        return fileHoanChinh;
    }

    // XỬ LÝ SỰ KIỆN KHI BẤM NÚT XUẤT BẢN WEB
    btnExport.addEventListener("click", async () => {
        const tenWeb = webNameInput.value.trim();
        const html = webHtmlTextarea.value.trim();
        const css = webCssTextarea.value.trim();
        const js = webJsTextarea.value.trim();

        if (html === "" && css === "" && js === "") {
            alert("Vui lòng nhập nội dung vào ít nhất một ô mã nguồn!");
            return;
        }

        const tieuDe = tenWeb === "" ? "Website Tự Tạo" : tenWeb;
        
        // Đan code thành 1 chuỗi HTML duy nhất
        const codeDaTron = trộnCode(tieuDe, html, css, js);

        try {
            // Thực hiện nén Gzip và mã hóa Base64 siêu ngắn
            const chuoiMaHoaNen = await compressAndEncode(codeDaTron);
            const linkHoanChinh = `${previewUrl}?w=${chuoiMaHoaNen}`;

            // Hiển thị ra màn hình
            shortLinkInput.value = linkHoanChinh;
            linkRun.href = linkHoanChinh;
            resultBox.style.display = "block";
            previewZone.style.display = "none";
        } catch (error) {
            alert("Lỗi xử lý nén link: " + error.message);
        }
    });

    // XEM TRƯỚC TRỰC TIẾP QUA IFRAME TRÊN TRANG CHỦ
    if (btnPreviewLocal) {
        btnPreviewLocal.addEventListener("click", () => {
            const tieuDe = webNameInput.value.trim() || "Xem thử";
            const html = webHtmlTextarea.value.trim();
            const css = webCssTextarea.value.trim();
            const js = webJsTextarea.value.trim();
            
            previewZone.style.display = "block";
            const doc = previewIframe.contentWindow.document;
            doc.open();
            doc.write(trộnCode(tieuDe, html, css, js));
            doc.close();
            previewZone.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
