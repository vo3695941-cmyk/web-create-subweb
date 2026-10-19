document.addEventListener("DOMContentLoaded", () => {
    // Lấy chính xác các thành phần giao diện từ HTML
    const btnExport = document.getElementById("btn-export");
    const webNameInput = document.getElementById("web-name");
    const webHtmlTextarea = document.getElementById("web-html");
    const webCssTextarea = document.getElementById("web-css");
    const webJsTextarea = document.getElementById("web-js"); // Đã sửa: Đồng bộ đúng ID ô JavaScript
    const webPyTextarea = document.getElementById("web-py");
    const resultBox = document.getElementById("result-box");
    const shortLinkInput = document.getElementById("short-link");
    const linkRun = document.getElementById("link-run");
    const btnPreviewLocal = document.getElementById("btn-preview-local");
    const previewZone = document.getElementById("preview-zone");
    const previewIframe = document.getElementById("preview-iframe");

    // Khởi tạo đường dẫn động tương thích tuyệt đối với GitHub Pages
    const baseUrl = window.location.origin + window.location.pathname;
    const previewUrl = baseUrl.endsWith('/') ? baseUrl + 'preview.html' : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1) + 'preview.html';

    // Hàm mã hóa Unicode sang Base64 an toàn cho URL (Không dùng async/await tránh liệt nút)
    function encodeDataSafe(str) {
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        const base64 = btoa(binString);
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+\$/, '');
    }

    // Hàm trộn cấu trúc 4 lõi mã nguồn thành 1 tệp HTML hoàn chỉnh
    function trộnCode(tieuDe, html, css, js, py) {
        let fileHoanChinh = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${tieuDe}</title>\n`;
        
        // Nhúng thư viện Pyodide CDN v314.0.7 nếu tác giả viết code Python
        if (py.length > 0) {
            fileHoanChinh += `<script src="https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.js"><\/script>\n`;
        }
        if (css.length > 0) {
            fileHoanChinh += `<style>\n${css}\n</style>\n`;
        }
        fileHoanChinh += `</head>\n<body>\n${html}\n`;
        
        // Đoạn script tự động khởi chạy và quản lý nạp gói thư viện Python ngầm
        if (py.length > 0) {
            fileHoanChinh += `
            <script>
                async function main(){
                    const outDiv = document.getElementById('python-output');
                    if(outDiv) outDiv.innerText = '⏳ Đang khởi tạo môi trường Python...';
                    
                    let pyodide = await loadPyodide();
                    
                    pyodide.setStdout({ batched: (msg) => {
                        if(outDiv) {
                            if(outDiv.innerText.includes('Đang chờ') || outDiv.innerText.includes('khởi tạo')) outDiv.innerText = '';
                            outDiv.innerText += msg + '\\n';
                        } else {
                            console.log(msg);
                        }
                    }});

                    const rawPythonCode = \`\${py.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;

                    try {
                        if(outDiv) outDiv.innerText = '⏳ Đang quét tìm thư viện ngoại vi...';
                        const importRegex = /(?:^|\\n)\\s*(?:import|from)\\s+([a-zA-Z0-9_]+)/g;
                        let match;
                        let packagesToLoad = [];
                        while ((match = importRegex.exec(rawPythonCode)) !== null) {
                            let pkgName = match[1];
                            const builtIns = ['math', 'sys', 'os', 'json', 're', 'time', 'random', 'datetime', 'collections', 'itertools'];
                            if (!builtIns.includes(pkgName) && !packagesToLoad.includes(pkgName)) {
                                packagesToLoad.push(pkgName);
                            }
                        }

                        if (packagesToLoad.length > 0) {
                            if(outDiv) outDiv.innerText = '⏳ Đang tự động tải thư viện: ' + packagesToLoad.join(', ') + '...';
                            await pyodide.loadPackage(packagesToLoad);
                        }

                        if(outDiv) outDiv.innerText = '⏳ Đang thực thi mã...';
                        await pyodide.runPythonAsync(rawPythonCode);
                    } catch(err) {
                        if(outDiv) outDiv.innerHTML = '<span style="color:red">❌ Lỗi biên dịch:\\n' + err + '</span>';
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

    // LẮNG NGHE SỰ KIỆN CLICK NÚT BẤM (Đã bọc an toàn, không lo sập)
    if (btnExport) {
        btnExport.addEventListener("click", () => {
            // Lấy giá trị an toàn, nếu ô nhập liệu không tồn tại thì tự trả về chuỗi rỗng
            const tenWeb = webNameInput ? webNameInput.value.trim() : "";
            const html = webHtmlTextarea ? webHtmlTextarea.value.trim() : "";
            const css = webCssTextarea ? webCssTextarea.value.trim() : "";
            const js = webJsTextarea ? webJsTextarea.value.trim() : "";
            const py = webPyTextarea ? webPyTextarea.value.trim() : "";

            if (html === "" && css === "" && js === "" && py === "") {
                alert("Vui lòng nhập nội dung vào ít nhất một ô mã nguồn!");
                return;
            }

            const tieuDe = tenWeb === "" ? "Website Tự Tạo" : tenWeb;
            const codeDaTron = trộnCode(tieuDe, html, css, js, py);

            try {
                // Đóng gói mã hóa chuỗi
                const chuoiMaHoa = encodeDataSafe(codeDaTron);
                const linkHoanChinh = `${previewUrl}?web=${chuoiMaHoa}`;

                // Xuất kết quả hiển thị lên giao diện chính
                if (shortLinkInput) shortLinkInput.value = linkHoanChinh;
                if (linkRun) linkRun.href = linkHoanChinh;
                if (resultBox) resultBox.style.display = "block";
                if (previewZone) previewZone.style.display = "none";
            } catch (error) {
                alert("Lỗi xử lý đóng gói liên kết: " + error.message);
            }
        });
    }

    // XỬ LÝ XEM TRƯỚC NHANH TRÊN TRANG CHỦ QUA IFRAME CÔ LẬP
    if (btnPreviewLocal) {
        btnPreviewLocal.addEventListener("click", () => {
            const tieuDe = (webNameInput ? webNameInput.value.trim() : "") || "Xem thử";
            const html = webHtmlTextarea ? webHtmlTextarea.value.trim() : "";
            const css = webCssTextarea ? webCssTextarea.value.trim() : "";
            const js = webJsTextarea ? webJsTextarea.value.trim() : "";
            const py = webPyTextarea ? webPyTextarea.value.trim() : "";
            
            if (previewZone && previewIframe) {
                previewZone.style.display = "block";
                const doc = previewIframe.contentWindow.document;
                doc.open();
                doc.write(trộnCode(tieuDe, html, css, js, py));
                doc.close();
                previewZone.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
