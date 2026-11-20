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
    const btnCopy = document.getElementById("btn-copy");
    const linkRun = document.getElementById("link-run");

    const btnPreviewLocal = document.getElementById("btn-preview-local");
    const previewZone = document.getElementById("preview-zone");
    const previewIframe = document.getElementById("preview-iframe");

    const btnOpenDocs = document.getElementById("btn-open-docs");
    const btnCloseDocs = document.getElementById("btn-close-docs");
    const docsModal = document.getElementById("docs-modal");

    // Quản lý Modal Docs
    if (btnOpenDocs && docsModal) btnOpenDocs.addEventListener("click", () => docsModal.style.display = "flex");
    if (btnCloseDocs && docsModal) btnCloseDocs.addEventListener("click", () => docsModal.style.display = "none");
    if (docsModal) docsModal.addEventListener("click", (e) => { if (e.target === docsModal) docsModal.style.display = "none"; });

    const previewUrl = new URL("preview.html", window.location.href).href;

    // ==========================================
    // THUẬT TOÁN NÉN LZW + BASE64 URL-SAFE SIÊU NGẮN (ĐỒNG BỘ 100%)
    // ==========================================
    function compressLZW(uncompressed) {
        const utf8Bytes = new TextEncoder().encode(uncompressed);
        let dict = new Map();
        for (let i = 0; i < 256; i++) dict.set(String.fromCharCode(i), i);
        
        let w = "";
        let result = [];
        let dictSize = 256;

        for (let i = 0; i < utf8Bytes.length; i++) {
            let c = String.fromCharCode(utf8Bytes[i]);
            let wc = w + c;
            if (dict.has(wc)) {
                w = wc;
            } else {
                result.push(dict.get(w));
                dict.set(wc, dictSize++);
                w = c;
            }
        }
        if (w !== "") result.push(dict.get(w));

        // Đóng gói mảng số thành chuỗi nhị phân 16-bit gọn nhẹ
        let bin = "";
        for (let i = 0; i < result.length; i++) {
            bin += String.fromCharCode((result[i] >> 8) & 0xff, result[i] & 0xff);
        }
        return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    // ==========================================
    // TẠO HTML CHO CHẾ ĐỘ XEM NHANH TẠI CHỖ (IFRAME)
    // ==========================================
    function buildPreviewHTML(data) {
        const title = data.t || "Xem thử";
        let pyScript = "";
        if (data.p.trim().length > 0) {
            const pyB64 = btoa(String.fromCharCode(...new TextEncoder().encode(data.p)));
            pyScript = `
<script type="module">
(async () => {
    const mode = "${data.m}";
    let outDiv = document.getElementById("python-output");
    if (!outDiv) {
        outDiv = document.createElement("div");
        outDiv.id = "python-output";
        outDiv.style.cssText = mode === "on" 
            ? "margin:20px; padding:15px; background:#1e1e1e; color:#00ff00; font-family:monospace; border-radius:8px; white-space:pre-wrap; text-align:left;"
            : "margin:20px; padding:15px; background:#f8fafc; color:#1e293b; font-family:sans-serif; font-size:15px; border-radius:8px; white-space:pre-wrap; text-align:left;";
        document.body.appendChild(outDiv);
    }
    outDiv.innerText = "⏳ Đang nạp Pyodide v0.27.7...";
    try {
        const { loadPyodide } = await import("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs");
        const py = await loadPyodide();
        globalThis.py = py;
        globalThis.runPython = async (c) => await py.runPythonAsync(c);
        
        const userCode = new TextDecoder().decode(Uint8Array.from(atob("${pyB64}"), c => c.charCodeAt(0)));
        const matches = userCode.match(/(?:^|\\n)\\s*(?:import|from)\\s+([a-zA-Z0-9_]+)/g) || [];
        let pkgs = [];
        const builtIns = ["math","sys","os","json","re","time","random","datetime","collections","itertools"];
        matches.forEach(m => {
            const p = m.replace(/\\n/g,"").replace("import","").replace("from","").trim().split(/\\s+/)[0];
            if (p && !builtIns.includes(p) && !pkgs.includes(p)) pkgs.push(p);
        });
        if (pkgs.length > 0) {
            outDiv.innerText = "⏳ Đang tải: " + pkgs.join(", ") + "...";
            await py.loadPackage(pkgs);
        }
        let hasOut = false;
        py.setStdout({ batched: (msg) => {
            if (!hasOut) { outDiv.innerText = ""; hasOut = true; }
            outDiv.textContent += (mode === "on" ? "[LOG]: " + msg + "\\n" : msg + "\\n");
        }});
        py.setStderr({ batched: (err) => {
            if (!hasOut) { outDiv.innerText = ""; hasOut = true; }
            outDiv.innerHTML += '<span style="color:#ef4444;">' + err + '\\n</span>';
        }});
        await py.runPythonAsync(userCode);
        if (!hasOut) outDiv.remove();
    } catch (e) {
        outDiv.innerHTML = '<span style="color:#ef4444;">❌ Lỗi: ' + e + '</span>';
    }
})();
<\/script>`;
        }

        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>${data.c}</style></head><body>${data.h}${pyScript}<script>${data.j}<\/script></body></html>`;
    }

    function getRawPayload() {
        // Dùng tên khóa 1 ký tự (t, h, c, j, p, m) để giảm tối đa dung lượng JSON trước khi nén
        return {
            t: webNameInput ? webNameInput.value.trim() : "",
            h: webHtmlTextarea ? webHtmlTextarea.value : "",
            c: webCssTextarea ? webCssTextarea.value : "",
            j: webJsTextarea ? webJsTextarea.value : "",
            p: webPyTextarea ? webPyTextarea.value : "",
            m: consoleToggleSelect ? consoleToggleSelect.value : "on"
        };
    }

    // ==========================================
    // SỰ KIỆN XUẤT BẢN & TẠO LINK SIÊU NGẮN
    // ==========================================
    if (btnExport) {
        btnExport.addEventListener("click", () => {
            const payload = getRawPayload();
            if (!payload.h.trim() && !payload.c.trim() && !payload.j.trim() && !payload.p.trim()) {
                alert("Vui lòng nhập ít nhất một đoạn mã!");
                return;
            }

            try {
                // Chỉ nén phần ruột JSON thô, không nén vỏ HTML nên link ngắn đi 70%
                const compressedData = compressLZW(JSON.stringify(payload));
                const shortLink = `${previewUrl}?z=${compressedData}`;

                if (shortLinkInput) shortLinkInput.value = shortLink;
                if (linkRun) linkRun.href = shortLink;
                if (resultBox) resultBox.style.display = "block";
                if (previewZone) previewZone.style.display = "none";
                
                // Reset trạng thái nút copy
                if (btnCopy) {
                    btnCopy.innerText = "📋 Copy";
                    btnCopy.style.background = "#2c3e50";
                }
            } catch (error) {
                alert("Lỗi nén dữ liệu: " + error.message);
            }
        });
    }

    // ==========================================
    // SỰ KIỆN NÚT COPY NHANH
    // ==========================================
    if (btnCopy && shortLinkInput) {
        btnCopy.addEventListener("click", () => {
            shortLinkInput.select();
            shortLinkInput.setSelectionRange(0, 99999); // Hỗ trợ bôi đen trên điện thoại

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(shortLinkInput.value).then(() => {
                    btnCopy.innerText = "✔ Đã Copy!";
                    btnCopy.style.background = "#27ae60";
                });
            } else {
                document.execCommand("copy");
                btnCopy.innerText = "✔ Đã Copy!";
                btnCopy.style.background = "#27ae60";
            }
        });
    }

    // ==========================================
    // SỰ KIỆN XEM NHANH TRỰC TIẾP
    // ==========================================
    if (btnPreviewLocal) {
        btnPreviewLocal.addEventListener("click", () => {
            const payload = getRawPayload();
            if (previewZone && previewIframe) {
                previewZone.style.display = "block";
                const doc = previewIframe.contentWindow.document;
                doc.open();
                doc.write(buildPreviewHTML(payload));
                doc.close();
                previewZone.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
