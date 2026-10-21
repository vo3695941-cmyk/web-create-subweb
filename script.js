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

    const baseUrl = window.location.origin + window.location.pathname;
    const previewUrl = baseUrl.endsWith('/') ? baseUrl + 'preview.html' : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1) + 'preview.html';

    function encodeDataSafe(str) {
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        const base64 = btoa(binString);
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+\$/, '');
    }

    // Hàm sinh cấu trúc mã thực thi PyScript dựa theo chế độ Switch Bật/Tắt
    function sinhScriptPython(codePy, consoleMode) {
        const base64Python = encodeDataSafe(codePy);
        
        return '<script>\n' +
            'async function main(){\n' +
            '    const mode = "' + consoleMode + '";\n' +
            '    const b64 = "' + base64Python + '";\n' +
            '    const binStr = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));\n' +
            '    const bytes = Uint8Array.from(binStr, m => m.charCodeAt(0));\n' +
            '    const rawPy = new TextDecoder().decode(bytes);\n' +
            '    \n' +
            '    // Tự động dựng thẻ tag <script type="py"> theo chuẩn PyScript mới\n' +
            '    const pyScriptTag = document.createElement("script");\n' +
            '    pyScriptTag.setAttribute("type", "py");\n' +
            '    \n' +
            '    if(mode === "on") {\n' +
            '        // Chế độ BẬT Console: Tạo và định hướng kết quả xuất vào hộp đen Terminal\n' +
            '        pyScriptTag.setAttribute("target", "python-output");\n' +
            '        let outDiv = document.getElementById("python-output");\n' +
            '        if(!outDiv) {\n' +
            '            outDiv = document.createElement("div");\n' +
            '            outDiv.id = "python-output";\n' +
            '            outDiv.style.cssText = "margin:20px; padding:15px; background:#1e1e1e; color:#00ff00; font-family:monospace; border-radius:5px; white-space:pre-wrap; text-align:left; box-shadow:0 4px 10px rgba(0,0,0,0.3); line-height:1.5;";\n' +
            '            document.body.appendChild(outDiv);\n' +
            '        }\n' +
            '    } else {\n' +
            '        // Chế độ TẮT Console: In trực tiếp kết quả dạng văn bản thuần vào body trang web\n' +
            '        const container = document.createElement("div");\n' +
            '        container.id = "pyscript-screen-container";\n' +
            '        container.style.cssText = "margin:10px 20px; font-family:sans-serif; font-size:16px; color:#333; text-align:left;";\n' +
            '        document.body.appendChild(container);\n' +
            '        pyScriptTag.setAttribute("target", "pyscript-screen-container");\n' +
            '    }\n' +
            '    \n' +
            '    pyScriptTag.textContent = rawPy;\n' +
            '    document.body.appendChild(pyScriptTag);\n' +
            '}\n' +
            'main();\n' +
            '<\/script>\n';
    }

    function trộnCode(tieuDe, html, css, js, py, consoleMode) {
        let fileHoanChinh = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>' + tieuDe + '</title>\n';
        
        if (py.length > 0) {
            // Chỉ nhúng duy nhất bộ đôi liên kết tài nguyên của hệ thống PyScript phiên bản mới
            fileHoanChinh += '<link rel="stylesheet" href="https://pyscript.net/releases/2025.3.1/core.css" />\n';
            fileHoanChinh += '<script type="module" src="https://pyscript.net/releases/2025.3.1/core.js"><\/script>\n';
        }
        
        if (css.length > 0) { fileHoanChinh += '<style>\n' + css + '\n</style>\n'; }
        fileHoanChinh += '</head>\n<body>\n' + html + '\n';
        if (py.length > 0) { fileHoanChinh += sinhScriptPython(py, consoleMode); }
        if (js.length > 0) { fileHoanChinh += '<script>\n' + js + '\n<\/script>\n'; }
        fileHoanChinh += '</body>\n</html>';
        return fileHoanChinh;
    }

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
