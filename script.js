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

    function sinhScriptPython(codePy, consoleMode) {
        const base64Python = encodeDataSafe(codePy);
        
        return '<script>\n' +
            'async function main(){\n' +
            '    const mode = "' + consoleMode + '";\n' +
            '    let outDiv = null;\n' +
            '    \n' +
            '    if(mode === "on") {\n' +
            '        outDiv = document.getElementById("python-output");\n' +
            '        if(!outDiv) {\n' +
            '            outDiv = document.createElement("div");\n' +
            '            outDiv.id = "python-output";\n' +
            '            outDiv.style.cssText = "margin:20px; padding:15px; background:#1e1e1e; color:#00ff00; font-family:monospace; border-radius:5px; white-space:pre-wrap; text-align:left; box-shadow:0 4px 10px rgba(0,0,0,0.3); line-height:1.5;";\n' +
            '            document.body.appendChild(outDiv);\n' +
            '        }\n' +
            '        outDiv.innerText = "⏳ Khởi tạo Console...";\n' +
            '    }\n' +
            '    \n' +
            '    try {\n' +
            '        let pyodide = await loadPyodide();\n' +
            '        \n' +
            '        // Gọi hàm cấu hình luồng xuất đồng bộ từ file preview.html gửi sang\n' +
            '        if(typeof window.parent.cauHinhPyodideStdout === "function") {\n' +
            '            window.parent.cauHinhPyodideStdout(pyodide, mode);\n' +
            '        } else if(typeof window.cauHinhPyodideStdout === "function") {\n' +
            '            window.cauHinhPyodideStdout(pyodide, mode);\n' +
            '        } else {\n' +
            '            pyodide.setStdout({ batched: (msg) => { console.log(msg); } });\n' +
            '        }\n' +
            '        \n' +
            '        const b64 = "' + base64Python + '";\n' +
            '        const binStr = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));\n' +
            '        const bytes = Uint8Array.from(binStr, m => m.charCodeAt(0));\n' +
            '        const rawPy = new TextDecoder().decode(bytes);\n' +
            '        \n' +
            '        if(mode === "on" && outDiv) outDiv.innerText = "⏳ Quét gói thư viện...";\n' +
            '        const matches = rawPy.match(/(?:^|\\n)\\s*(?:import|from)\\s+([a-zA-Z0-9_]+)/g) || [];\n' +
            '        let packages = [];\n' +
            '        matches.forEach(m => {\n' +
            '            const p = m.replace(/\\n/g, "").replace("import", "").replace("from", "").trim().split(/\\s+/);\n' +
            '            const builtIns = ["math","sys","os","json","re","time","random","datetime","collections","itertools"];\n' +
            '            if(p && !builtIns.includes(p) && !packages.includes(p)) packages.push(p);\n' +
            '        });\n' +
            '        if(packages.length > 0){\n' +
            '            if(mode === "on" && outDiv) outDiv.innerText = "⏳ Tải thư viện: " + packages.join(", ");\n' +
            '            await pyodide.loadPackage(packages);\n' +
            '        }\n' +
            '        if(mode === "on" && outDiv) outDiv.innerText = "⏳ Đang chạy...";\n' +
            '        await pyodide.runPythonAsync(rawPy);\n' +
            '        \n' +
            '        const finalStatus = document.getElementById("py-sys-status");\n' +
            '        if(finalStatus) finalStatus.remove();\n' +
            '    } catch(err) {\n' +
            '        const finalStatus = document.getElementById("py-sys-status");\n' +
            '        if(finalStatus) finalStatus.remove();\n' +
            '        if(mode === "on" && outDiv) {\n' +
            '            outDiv.innerHTML = "<span style=\'color:#ff4a4a\'>❌ Lỗi biên dịch:\\n" + err + "</span>";\n' +
            '        } else {\n' +
            '            const errDiv = document.createElement("div");\n' +
            '            errDiv.style.cssText = "color:red; margin:20px; font-weight:bold; text-align:left;";\n' +
            '            errDiv.innerText = "❌ Lỗi Python: " + err;\n' +
            '            document.body.appendChild(errDiv);\n' +
            '        }\n' +
            '    }\n' +
            '}\n' +
            'main();\n' +
            '<\/script>\n';
    }

    function trộnCode(tieuDe, html, css, js, py, consoleMode) {
        let fileHoanChinh = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>' + tieuDe + '</title>\n';
        
        if (py.length > 0) {
            fileHoanChinh += '<script src="https://jsdelivr.net"><\/script>\n';
        }
        if (css.length > 0) {
            fileHoanChinh += '<style>\n' + css + '\n</style>\n';
        }
        fileHoanChinh += '</head>\n<body>\n' + html + '\n';
        
        if (py.length > 0) {
            fileHoanChinh += sinhScriptPython(py, consoleMode);
        }
        if (js.length > 0) {
            fileHoanChinh += '<script>\n' + js + '\n<\/script>\n';
        }
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
