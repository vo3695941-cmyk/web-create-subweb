document.addEventListener("DOMContentLoaded", () => {
    const btnExport = document.getElementById("btn-export");
    const webNameInput = document.getElementById("web-name");
    const webHtmlTextarea = document.getElementById("web-html");
    const webCssTextarea = document.getElementById("web-css");
    const webJsTextarea = document.getElementById("web-js");
    const webPyTextarea = document.getElementById("web-py");
    const resultBox = document.getElementById("result-box");
    const shortLinkInput = document.getElementById("short-link");
    const linkRun = document.getElementById("link-run");
    const btnPreviewLocal = document.getElementById("btn-preview-local");
    const previewZone = document.getElementById("preview-zone");
    const previewIframe = document.getElementById("preview-iframe");

    // Định cấu hình URL gốc động tương thích hoàn toàn với môi trường GitHub Pages
    const baseUrl = window.location.origin + window.location.pathname;
    const previewUrl = baseUrl.endsWith('/') ? baseUrl + 'preview.html' : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1) + 'preview.html';

    // Thuật toán nén luồng dữ liệu Gzip kết hợp mã hóa Base64 giúp tối ưu hóa chiều dài liên kết
    async function compressAndEncode(string) {
        const byteArray = new TextEncoder().encode(string);
        const cs = new CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        writer.write(byteArray);
        writer.close();
        
        const outputBuffer = await new Response(cs.readable).arrayBuffer();
        const base64String = btoa(String.fromCharCode(...new Uint8Array(outputBuffer)));
        
        // Loại bỏ các ký tự có thể gây lỗi điều hướng trên thanh địa chỉ của trình duyệt
        return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+\$/, '');
    }

    // Cơ chế trộn logic tự động cấu trúc lại các khối HTML, CSS, JS và mã nguồn Python con
    function trộnCode(tieuDe, html, css, js, py) {
        let fileHoanChinh = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${tieuDe}</title>\n`;
        
        if (py.length > 0) {
            // Tích hợp hệ thống nạp lõi Pyodide thông qua máy chủ phân phối CDN phiên bản mới v314.0.7
            fileHoanChinh += `<script src="https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.js
"><\/script>\n`;
        }
        if (css.length > 0) {
            fileHoanChinh += `<style>\n${css}\n</style>\n`;
        }
        fileHoanChinh += `</head>\n<body>\n${html}\n`;
        
        if (py.length > 0) {
            fileHoanChinh += `
            <script>
                async function main(){
                    let pyodide = await loadPyodide();
                    // Chuyển hướng luồng dữ liệu xuất từ hàm print() của Python vào thành phần giao diện chỉ định
                    pyodide.setStdout({ batched: (msg) => {
                        const outDiv = document.getElementById('python-output');
                        if(outDiv) {
                            if(outDiv.innerText === 'Đang chờ chạy Python...') outDiv.innerText = '';
                            outDiv.innerText += msg + '\\n';
                        } else {
                            console.log(msg);
                        }
                    }});
                    try {
                        await pyodide.runPythonAsync(\`\${py.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`);
                    } catch(err) {
                        const outDiv = document.getElementById('python-output');
                        if(outDiv) outDiv.innerHTML = '<span style="color:red">' + err + '</span>';
                    }
                }
                main();
            <\/script>\n`;
        }

        if (js.length > 0) {
            fileHoanChinh += `<script>\n${js}\n<\/script>\n`;
        }
        fileHoanChinh += `</body>\n</html>`;
        return fileHoanChinh;
    }

    // XỬ LÝ SỰ KIỆN KHI NGƯỜI DÙNG KÍCH HOẠT NÚT XUẤT BẢN WEBSITE
    btnExport.addEventListener("click", async () => {
        const tenWeb = webNameInput.value.trim();
        const html = webHtmlTextarea.value.trim();
        const css = webCssTextarea.value.trim();
        const js = webJsTextarea.value.trim();
        const py = webPyTextarea.value.trim();

        if (html === "" && css === "" && js === "" && py === "") {
            alert("Vui lòng nhập nội dung vào ít nhất một ô mã nguồn!");
            return;
        }

        const tieuDe = tenWeb === "" ? "Website Tự Tạo" : tenWeb;
        const codeDaTron = trộnCode(tieuDe, html, css, js, py);

        try {
            // Nén chuỗi mã hóa và khởi tạo đường dẫn rút gọn trực tiếp
            const chuoiMaHoaNen = await compressAndEncode(codeDaTron);
            const linkHoanChinh = `${previewUrl}?w=${chuoiMaHoaNen}`;

            // Kết xuất thông tin đầu ra lên giao diện quản lý của trang chủ
            shortLinkInput.value = linkHoanChinh;
            linkRun.href = linkHoanChinh;
            resultBox.style.display = "block";
            previewZone.style.display = "none";
        } catch (error) {
            alert("Lỗi xử lý nén luồng dữ liệu: " + error.message);
        }
    });

    // CƠ CHẾ KHỞI CHẠY XEM TRƯỚC TẠI CHỖ QUA PHÂN KHU IFRAME CÔ LẬP
    if (btnPreviewLocal) {
        btnPreviewLocal.addEventListener("click", () => {
            const tieuDe = webNameInput.value.trim() || "Xem thử";
            const html = webHtmlTextarea.value.trim();
            const css = webCssTextarea.value.trim();
            const js = webJsTextarea.value.trim();
            const py = webPyTextarea.value.trim();
            
            previewZone.style.display = "block";
            const doc = previewIframe.contentWindow.document;
            doc.open();
            doc.write(trộnCode(tieuDe, html, css, js, py));
            doc.close();
            previewZone.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
