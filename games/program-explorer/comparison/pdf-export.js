import { createQrSvg } from '../../../js/vendor/qr-code.js';

const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;
const MARGIN = 30;
const BOTTOM = 34;

export function downloadComparisonPdf(programs) {
  if (!programs?.length) return;
  const pages = [];
  let commands = [];
  let annotations = [];
  let y = PAGE_HEIGHT - MARGIN;
  const labelWidth = 112;
  const columnWidth = (PAGE_WIDTH - MARGIN * 2 - labelWidth) / programs.length;
  const widths = [labelWidth, ...programs.map(() => columnWidth)];

  const newPage = () => {
    if (commands.length) pages.push({ stream: commands.join('\n'), annotations });
    commands = [];
    annotations = [];
    y = PAGE_HEIGHT - MARGIN;
    addText('Program comparison', MARGIN, y, 18, true);
    y -= 27;
    drawRow(
      programs.map(program => program.name),
      widths,
      40,
      { label: 'Program', header: true }
    );
  };

  const addText = (text, x, baseline, size = 8, bold = false) => {
    const hex = pdfTextHex(text);
    commands.push('0 0 0 rg');
    commands.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${baseline.toFixed(2)} Tm <${hex}> Tj ET`);
  };

  const drawRow = (values, rowWidths, height, options = {}) => {
    if (y - height < BOTTOM) newPage();
    const top = y;
    let x = MARGIN;
    const rowValues = [options.label || '', ...values];
    rowValues.forEach((value, index) => {
      const width = rowWidths[index];
      if (options.header) commands.push(`0.91 0.96 0.99 rg ${x} ${top - height} ${width} ${height} re f`);
      commands.push(`0.72 0.82 0.89 RG 0.6 w ${x} ${top - height} ${width} ${height} re S`);
      if (options.qr) {
        if (index === 0) addText(value, x + 6, top - 12, 7.5, true);
        else {
          drawQr(value, x + 8, top - height + 42, 80);
          const addressLines = wrapText(value, Math.floor((width - 12) / 3.4));
          addressLines.forEach((line, lineIndex) => {
            addText(line, x + 6, top - height + 29 - lineIndex * 9, 6.5);
          });
          if (value.startsWith('http')) {
            const addressTop = top - height + 36;
            const addressBottom = top - height + 29 - (addressLines.length - 1) * 9 - 2;
            annotations.push({
              url: value,
              rect: [x + 5, addressBottom, x + width - 5, addressTop]
            });
          }
        }
      } else {
        const lines = wrapText(value, Math.max(10, Math.floor((width - 12) / (options.header ? 6.2 : 5.4))));
        const size = options.header ? 8 : 7.5;
        lines.slice(0, Math.floor((height - 10) / (size + 3))).forEach((line, lineIndex) => {
          addText(line, x + 6, top - 12 - lineIndex * (size + 3), size, options.header || index === 0);
        });
      }
      x += width;
    });
    y = top - height;
  };

  const drawQr = (url, x, yBottom, boxSize) => {
    const svg = createQrSvg(url);
    const viewSize = Number(svg.match(/viewBox="0 0 (\d+)/)?.[1] || 0);
    const path = svg.match(/<path d="([^"]+)"/)?.[1] || '';
    const moduleSize = boxSize / viewSize;
    commands.push(`1 1 1 rg ${x} ${yBottom} ${boxSize} ${boxSize} re f`);
    commands.push('0.03 0.22 0.40 rg');
    for (const match of path.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
      const col = Number(match[1]);
      const row = Number(match[2]);
      commands.push(`${(x + col * moduleSize).toFixed(3)} ${(yBottom + boxSize - (row + 1) * moduleSize).toFixed(3)} ${moduleSize.toFixed(3)} ${moduleSize.toFixed(3)} re f`);
    }
  };

  newPage();
  const rows = [
    ['Credential', program => program.credential],
    ['Duration', program => program.duration],
    ['Co-op', program => program.coop],
    ['Curriculum', program => program.curriculum],
    ['Key highlights', program => program.highlights],
    ['Career paths', program => program.careers]
  ];
  for (const [label, getValue] of rows) {
    const values = programs.map(program => getValue(program) || 'Not listed in the program guide.');
    const charWidth = Math.max(10, Math.floor((columnWidth - 12) / 5.4));
    const lineCount = Math.max(...values.map(value => wrapText(value, charWidth).length), 1);
    drawRow(values, widths, Math.max(32, lineCount * 10 + 12), { label });
  }

  const addresses = programs.map(program => program.homepage || 'Not listed in the program guide.');
  drawRow(addresses, widths, 142, { label: 'Program home page', qr: true });
  pages.push({ stream: commands.join('\n'), annotations });

  const pdf = buildPdf(pages);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'program-comparison.pdf';
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function wrapText(value, maxChars) {
  const words = String(value).replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let line = '';
  for (let word of words) {
    if (!word) continue;
    if (word.length > maxChars) {
      if (line) {
        lines.push(line);
        line = '';
      }
      while (word.length > maxChars) {
        lines.push(word.slice(0, maxChars));
        word = word.slice(maxChars);
      }
      line = word;
      continue;
    }
    if (line && line.length + word.length + 1 > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line += `${line ? ' ' : ''}${word}`;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function pdfTextHex(value) {
  const special = { '–': '-', '—': '-', '’': "'", '‘': "'", '“': '"', '”': '"', '·': '|', '…': '...' };
  const normalized = String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  let hex = '';
  for (const char of normalized) {
    const mapped = special[char] ?? char;
    for (const outputChar of mapped) {
      const code = outputChar.codePointAt(0);
      const byte = code >= 32 && code <= 126 ? code : 63;
      hex += byte.toString(16).padStart(2, '0');
    }
  }
  return hex.toUpperCase();
}

function buildPdf(pageStreams) {
  const objects = [];
  const addObject = value => { objects.push(value); return objects.length; };
  const catalogId = addObject('');
  const pagesId = addObject('');
  const regularFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const boldFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const pageIds = [];
  for (const pageData of pageStreams) {
    const stream = pageData.stream;
    const streamId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const annotationIds = pageData.annotations.map(annotation => addObject(
      `<< /Type /Annot /Subtype /Link /Rect [${annotation.rect.join(' ')}] /Border [0 0 0] /A << /S /URI /URI <${asciiHex(annotation.url)}> >> >>`
    ));
    const annots = annotationIds.length ? `/Annots [${annotationIds.map(id => `${id} 0 R`).join(' ')}]` : '';
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${streamId} 0 R ${annots} >>`);
    pageIds.push(`${pageId} 0 R`);
  }
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.join(' ')}] /Count ${pageIds.length} >>`;
  let output = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(output.length);
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = output.length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) output += `${String(offset).padStart(10, '0')} 00000 n \n`;
  output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return output;
}

function asciiHex(value) {
  return [...String(value)].map(char => char.codePointAt(0).toString(16).padStart(2, '0')).join('').toUpperCase();
}
