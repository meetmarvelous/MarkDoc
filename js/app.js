/**
 * MarkDocx AI - Client-side Markdown Editor with DOCX Export
 * All processing happens in the browser - no server required
 */

document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('markdown-editor');
  const preview = document.getElementById('markdown-preview');
  const editorPane = document.getElementById('editor-pane');
  const previewPane = document.getElementById('preview-pane');
  const titleInput = document.getElementById('doc-title');

  // Exit early if not on editor page
  if (!editor) return;

  const STORAGE_KEY = 'markdocx_document';

  // --- Load from localStorage ---
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const doc = JSON.parse(saved);
        if (doc.title) titleInput.value = doc.title;
        if (doc.content) editor.value = doc.content;
      }
    } catch (e) {
      console.warn('Could not load saved document:', e);
    }
  }

  // --- Save to localStorage ---
  function saveToStorage() {
    try {
      const doc = {
        title: titleInput.value,
        content: editor.value,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch (e) {
      console.warn('Could not save document:', e);
    }
  }

  // Debounced auto-save
  let saveTimeout;
  function debouncedSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveToStorage, 500);
  }

  // --- Markdown Rendering ---
  function render() {
    if (editor && preview) {
      preview.innerHTML = marked.parse(editor.value);
    }
  }

  editor.addEventListener('input', () => {
    render();
    debouncedSave();
  });
  titleInput.addEventListener('input', debouncedSave);

  // Load saved content and render
  loadFromStorage();
  render();

  // --- View Modes ---
  const btnSplit = document.getElementById('btn-view-split');
  const btnEdit = document.getElementById('btn-view-edit');
  const btnPreview = document.getElementById('btn-view-preview');
  const viewButtons = [btnSplit, btnEdit, btnPreview];

  function setView(mode) {
    if (!editorPane || !previewPane) return;

    // Update button states
    viewButtons.forEach(btn => btn?.classList.remove('active'));

    if (mode === 'split') {
      editorPane.style.display = 'flex';
      previewPane.style.display = 'flex';
      editorPane.style.flex = '1';
      previewPane.style.flex = '1';
      btnSplit?.classList.add('active');
    } else if (mode === 'edit') {
      editorPane.style.display = 'flex';
      previewPane.style.display = 'none';
      editorPane.style.flex = '1';
      btnEdit?.classList.add('active');
    } else if (mode === 'preview') {
      editorPane.style.display = 'none';
      previewPane.style.display = 'flex';
      previewPane.style.flex = '1';
      btnPreview?.classList.add('active');
    }

    // Save preference
    localStorage.setItem('markdocx_view', mode);
  }

  // Load saved view preference
  const savedView = localStorage.getItem('markdocx_view') || 'split';
  setView(savedView);

  btnSplit?.addEventListener('click', () => setView('split'));
  btnEdit?.addEventListener('click', () => setView('edit'));
  btnPreview?.addEventListener('click', () => setView('preview'));

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --- File Upload ---
  const btnUpload = document.getElementById('btn-upload');
  const fileInput = document.getElementById('file-input');

  if (btnUpload && fileInput) {
    btnUpload.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          editor.value = e.target.result;
          titleInput.value = file.name.replace(/\.(md|txt|markdown)$/i, '');
          render();
          saveToStorage();
          showToast('File uploaded successfully', 'success');
        };
        reader.onerror = () => showToast('Failed to read file', 'error');
        reader.readAsText(file);
      }
      fileInput.value = ''; // Reset for same file
    });
  }

  // --- Paste from Clipboard ---
  const btnPaste = document.getElementById('btn-paste');
  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + text + editor.value.substring(end);
        editor.setSelectionRange(start + text.length, start + text.length);
        editor.focus();
        render();
        saveToStorage();
        showToast('Pasted from clipboard', 'success');
      } catch (err) {
        showToast('Failed to read clipboard. Please use Ctrl+V.', 'error');
      }
    });
  }

  // --- Download Markdown ---
  const btnDownloadMd = document.getElementById('btn-download-md');
  if (btnDownloadMd) {
    btnDownloadMd.addEventListener('click', () => {
      const content = editor.value;
      const title = titleInput.value || 'document';
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, `${sanitizeFilename(title)}.md`);
      showToast('Markdown downloaded', 'success');
    });
  }

  // --- Export DOCX ---
  const btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.addEventListener('click', async () => {
      try {
        showToast('Generating DOCX...', 'info');
        const title = titleInput.value || 'document';
        const markdown = editor.value;

        await generateDocx(title, markdown);
        showToast('DOCX downloaded successfully!', 'success');
      } catch (err) {
        console.error('DOCX generation error:', err);
        showToast('Failed to generate DOCX', 'error');
      }
    });
  }

  // --- DOCX Generation using docx library ---
  async function generateDocx(title, markdown) {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

    // Parse markdown to simple structure
    const lines = markdown.split('\n');
    const children = [];

    // Add title
    children.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 }
      })
    );

    let inCodeBlock = false;
    let codeLines = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block handling
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          children.push(createCodeBlock(codeLines.join('\n')));
          codeLines = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Skip empty lines but add paragraph break
      if (line.trim() === '') {
        inList = false;
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        children.push(new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }));
      } else if (line.startsWith('## ')) {
        children.push(new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 }
        }));
      } else if (line.startsWith('### ')) {
        children.push(new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }));
      } else if (line.startsWith('#### ')) {
        children.push(new Paragraph({
          text: line.substring(5),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 200, after: 100 }
        }));
      }
      // Unordered list
      else if (line.match(/^[\-\*]\s/)) {
        children.push(new Paragraph({
          children: parseInlineFormatting(line.substring(2)),
          bullet: { level: 0 },
          spacing: { after: 80 }
        }));
        inList = true;
      }
      // Ordered list
      else if (line.match(/^\d+\.\s/)) {
        const text = line.replace(/^\d+\.\s/, '');
        children.push(new Paragraph({
          children: parseInlineFormatting(text),
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { after: 80 }
        }));
        inList = true;
      }
      // Blockquote
      else if (line.startsWith('> ')) {
        children.push(new Paragraph({
          children: parseInlineFormatting(line.substring(2)),
          indent: { left: 720 },
          border: {
            left: { style: 'single', size: 24, color: '2563eb' }
          },
          spacing: { after: 200 }
        }));
      }
      // Horizontal rule
      else if (line.match(/^[-*_]{3,}$/)) {
        children.push(new Paragraph({
          border: { bottom: { style: 'single', size: 6, color: 'e2e8f0' } },
          spacing: { before: 200, after: 200 }
        }));
      }
      // Regular paragraph
      else {
        children.push(new Paragraph({
          children: parseInlineFormatting(line),
          spacing: { after: 200 }
        }));
      }
    }

    const doc = new Document({
      numbering: {
        config: [{
          reference: 'default-numbering',
          levels: [{
            level: 0,
            format: 'decimal',
            text: '%1.',
            alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        }]
      },
      sections: [{
        properties: {},
        children: children
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${sanitizeFilename(title)}.docx`);
  }

  // Parse inline markdown formatting
  function parseInlineFormatting(text) {
    const { TextRun } = docx;
    const runs = [];

    // Simple regex-based parsing for bold, italic, code
    // This handles: **bold**, *italic*, `code`, ***bold italic***
    const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|([^*`]+))/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match[2]) {
        // Bold italic ***text***
        runs.push(new TextRun({ text: match[2], bold: true, italics: true }));
      } else if (match[3]) {
        // Bold **text**
        runs.push(new TextRun({ text: match[3], bold: true }));
      } else if (match[4]) {
        // Italic *text*
        runs.push(new TextRun({ text: match[4], italics: true }));
      } else if (match[5]) {
        // Code `text`
        runs.push(new TextRun({
          text: match[5],
          font: 'Courier New',
          shading: { fill: 'f1f5f9' }
        }));
      } else if (match[6]) {
        // Plain text
        runs.push(new TextRun({ text: match[6] }));
      }
    }

    return runs.length > 0 ? runs : [new TextRun({ text: text })];
  }

  // Create code block paragraph
  function createCodeBlock(code) {
    const { Paragraph, TextRun } = docx;
    return new Paragraph({
      children: [new TextRun({
        text: code,
        font: 'Courier New',
        size: 20
      })],
      shading: { fill: 'f1f5f9' },
      spacing: { before: 200, after: 200 },
      indent: { left: 360 }
    });
  }

  // Sanitize filename
  function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'document';
  }

  // --- Keyboard Shortcuts ---
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save as DOCX
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      btnExport?.click();
    }
  });
});
