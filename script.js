
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // CODE EDITOR - MAIN ELEMENTS
    // ==========================================

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

    const btnOpenDocs = document.getElementById("btn-open-docs");
    const btnCloseDocs = document.getElementById("btn-close-docs");
    const docsModal = document.getElementById("docs-modal");

    // ==========================================
    // DOCUMENTATION MODAL
    // ==========================================

    if (btnOpenDocs && docsModal) {
        btnOpenDocs.addEventListener("click", () => {
            docsModal.style.display = "flex";
        });
    }

    if (btnCloseDocs && docsModal) {
        btnCloseDocs.addEventListener("click", () => {
            docsModal.style.display = "none";
        });
    }

    if (docsModal) {
        docsModal.addEventListener("click", (e) => {
            if (e.target === docsModal) {
                docsModal.style.display = "none";
            }
        });
    }

    // ==========================================
    // URL CONFIGURATION
    // ==========================================

    const previewUrl = new URL(
        "preview.html",
        window.location.href
    ).href;

    const PYSCRIPT_VERSION = "2026.7.3";

    // ==========================================
    // UTF-8 BASE64 ENCODER
    // ==========================================

    function encodeBase64(str) {
        const bytes = new TextEncoder().encode(str);

        let binary = "";

        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return btoa(binary);
    }

    function encodeDataSafe(str) {
        return encodeBase64(str)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    // ==========================================
    // HTML ESCAPER
    // ==========================================

    function escapeHTML(str) {
        return String(str).replace(/[&<>"']/g, char => {
            const map = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return map[char];
        });
    }

    // ==========================================
    // PYTHON RUNNER GENERATOR
    // ==========================================

    function sinhPythonRunner(codePy, consoleMode) {

        const pythonBase64 = encodeDataSafe(codePy);

        let pythonCode = `
import base64
import sys
import traceback

source = base64.urlsafe_b64decode(
    "${pythonBase64}" +
    "=" * (-len("${pythonBase64}") % 4)
).decode("utf-8")

`;

        // CONSOLE OFF:
        // Redirect Python stdout/stderr into HTML.

        if (consoleMode !== "on") {

            pythonCode += `
from js import document

class OutputWriter:

    def __init__(self, element_id):
        self.element_id = element_id

    def write(self, text):
        element = document.getElementById(self.element_id)

        if element:
            element.textContent += str(text)

        return len(text)

    def flush(self):
        pass

    def isatty(self):
        return False

sys.stdout = OutputWriter("pyscript-console")
sys.stderr = OutputWriter("pyscript-console")
`;

        }

        // EXECUTE USER PYTHON CODE

        pythonCode += `
try:
    exec(
        compile(source, "<website-python>", "exec"),
        globals()
    )

except Exception:
    traceback.print_exc()
`;

        return pythonCode;
    }

    // ==========================================
    // WEBSITE GENERATOR
    // ==========================================

    function trộnCode(tieuDe, html, css, js, py, consoleMode) {

        let fileHoanChinh = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(tieuDe)}</title>
`;

        // ======================================
        // PYSCRIPT LIBRARY
        // ======================================

        if (py.length > 0) {

            fileHoanChinh += `
<link rel="stylesheet"
href="https://pyscript.net/releases/${PYSCRIPT_VERSION}/core.css">

<script type="module"
src="https://pyscript.net/releases/${PYSCRIPT_VERSION}/core.js"><\/script>
`;

        }

        // ======================================
        // CSS
        // ======================================

        if (css.length > 0) {

            fileHoanChinh += `
<style>
${css}
</style>
`;

        }

        fileHoanChinh += `
</head>
<body>

${html}

`;

        // ======================================
        // PYTHON OUTPUT
        // ======================================

        if (py.length > 0) {

            if (consoleMode === "on") {

                // Native PyScript terminal.
                fileHoanChinh += `
<script type="py" terminal>
${sinhPythonRunner(py, "on")}
<\/script>
`;

            } else {

                // HTML output container.
                fileHoanChinh += `
<div id="pyscript-console"
style="
background:#111827;
color:#00ff88;
padding:15px;
margin:15px;
border-radius:8px;
font-family:monospace;
white-space:pre-wrap;
overflow-wrap:anywhere;
">
</div>


<script type="py">
${sinhPythonRunner(py, "off")}
<\/script>
`;

            }

        }

        // ======================================
        // JAVASCRIPT
        // ======================================

        if (js.length > 0) {

            fileHoanChinh += `
<script>
${js}
<\/script>
`;

        }

        fileHoanChinh += `
</body>
</html>
`;

        return fileHoanChinh;
    }

    // ==========================================
    // GET EDITOR VALUES
    // ==========================================

    function getEditorData() {

        return {

            tenWeb: webNameInput
                ? webNameInput.value.trim()
                : "",

            html: webHtmlTextarea
                ? webHtmlTextarea.value
                : "",

            css: webCssTextarea
                ? webCssTextarea.value
                : "",

            js: webJsTextarea
                ? webJsTextarea.value
                : "",

            py: webPyTextarea
                ? webPyTextarea.value
                : "",

            consoleMode: consoleToggleSelect
                ? consoleToggleSelect.value
                : "on"

        };

    }

    // ==========================================
    // EXPORT WEBSITE
    // ==========================================

    if (btnExport) {

        btnExport.addEventListener("click", () => {

            const data = getEditorData();

            if (
                !data.html.trim() &&
                !data.css.trim() &&
                !data.js.trim() &&
                !data.py.trim()
            ) {

                alert("Vui lòng nhập ít nhất một đoạn mã!");

                return;
            }

            const title = data.tenWeb || "Website Tự Tạo";

            const completeHTML = trộnCode(
                title,
                data.html,
                data.css,
                data.js,
                data.py,
                data.consoleMode
            );

            try {

                const encoded = encodeDataSafe(completeHTML);

                const finalURL = previewUrl + "?web=" + encoded;

                if (shortLinkInput) {
                    shortLinkInput.value = finalURL;
                }

                if (linkRun) {
                    linkRun.href = finalURL;
                }

                if (resultBox) {
                    resultBox.style.display = "block";
                }

                if (previewZone) {
                    previewZone.style.display = "none";
                }

            } catch (error) {

                alert(
                    "Lỗi đóng gói website: " + error.message
                );

            }

        });

    }

    // ==========================================
    // LOCAL PREVIEW
    // ==========================================

    if (btnPreviewLocal) {

        btnPreviewLocal.addEventListener("click", () => {

            const data = getEditorData();

            const title = data.tenWeb || "Xem thử";

            if (!previewZone || !previewIframe) {
                alert("Không tìm thấy vùng xem trước!");
                return;
            }

            try {

                const completeHTML = trộnCode(
                    title,
                    data.html,
                    data.css,
                    data.js,
                    data.py,
                    data.consoleMode
                );

                previewZone.style.display = "block";

                const doc = previewIframe.contentWindow.document;

                doc.open();
                doc.write(completeHTML);
                doc.close();

                previewZone.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            } catch (error) {

                alert(
                    "Lỗi xem trước: " + error.message
                );

            }

        });

    }

});
