import { createQrSvg } from '../../../js/vendor/qr-code.js';
import { downloadComparisonPdf } from './pdf-export.js';

export function initProgramComparison(programList, switchMode) {
  const programs = programList;
  const programChecklist = document.querySelector('#programChecklist');
  const comparisonResults = document.querySelector('#comparisonResults');
  const compareSelectedButton = document.querySelector('#compareSelectedButton');
  const exportComparisonButton = document.querySelector('#exportComparisonButton');
  const compareSelectionCount = document.querySelector('#compareSelectionCount');
  const programPicker = document.querySelector('#programPicker');
  const programPickerToggle = document.querySelector('#programPickerToggle');
  const programPickerStatus = document.querySelector('#programPickerStatus');
  const comparePanel = document.querySelector('#comparePanel');
  const MAX_COMPARE_PROGRAMS = 3;
  let selectedProgramNames = new Set();

  function renderProgramChecklist() {
    programChecklist.replaceChildren();
    for (const program of programs) {
      const label = document.createElement('label');
      label.className = 'program-check-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = program.name;
      checkbox.checked = selectedProgramNames.has(program.name);
      checkbox.disabled = selectedProgramNames.size >= MAX_COMPARE_PROGRAMS && !checkbox.checked;
      checkbox.addEventListener('change', () => {
        if (checkbox.checked && selectedProgramNames.size >= MAX_COMPARE_PROGRAMS) {
          checkbox.checked = false;
          compareSelectionCount.textContent = `You can compare up to ${MAX_COMPARE_PROGRAMS} programs.`;
          return;
        }
        if (checkbox.checked) selectedProgramNames.add(program.name);
        else selectedProgramNames.delete(program.name);
        comparisonResults.replaceChildren();
        updateCompareSelection();
      });
      const name = document.createElement('span');
      name.textContent = program.name;
      label.append(checkbox, name);
      programChecklist.append(label);
    }
    updateCompareSelection();
  }

  function updateCompareSelection() {
    const count = selectedProgramNames.size;
    programChecklist.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.disabled = count >= MAX_COMPARE_PROGRAMS && !checkbox.checked;
    });
    compareSelectionCount.textContent = count < 2
      ? `${count} selected · Select at least two programs.`
      : count === MAX_COMPARE_PROGRAMS
        ? `${count} programs selected · Maximum reached.`
        : `${count} programs selected.`;
    compareSelectedButton.disabled = count < 2;
    exportComparisonButton.disabled = count < 2;
    programPickerStatus.textContent = `${count} ${count === 1 ? 'program is' : 'programs are'} selected`;
    if (count === 0) setProgramPickerExpanded(true);
  }

  function setProgramPickerExpanded(expanded) {
    programPicker.hidden = !expanded;
    programPickerToggle.setAttribute('aria-expanded', String(expanded));
    programPickerToggle.textContent = expanded ? 'Hide program choices ↑' : 'Choose programs ↓';
    comparePanel.classList.toggle('program-picker-collapsed', !expanded);
  }

  function selectProgramsForComparison(names) {
    selectedProgramNames = new Set(names.filter(name => programs.some(program => program.name === name)));
    renderProgramChecklist();
    renderComparisonTable();
    switchMode('compare');
  }

  function renderComparisonTable() {
    const selected = programs.filter(program => selectedProgramNames.has(program.name));
    if (selected.length < 2) {
      comparisonResults.replaceChildren();
      if (selectedProgramNames.size === 0) setProgramPickerExpanded(true);
      return;
    }

    const fields = [
      ['Credential', 'credential'],
      ['Duration', 'duration'],
      ['Co-op', 'coop'],
      ['Curriculum', 'curriculum'],
      ['Key highlights', 'highlights'],
      ['Career paths', 'careers'],
      ['Program home page', 'homepage']
    ];
    const wrapper = document.createElement('div');
    wrapper.className = 'comparison-table-wrap';
    const table = document.createElement('table');
    table.className = 'comparison-table';
    table.style.tableLayout = 'fixed';
    const head = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const detailHeader = document.createElement('th');
    detailHeader.scope = 'col';
    detailHeader.textContent = 'Program details';
    headerRow.append(detailHeader);
    for (const program of selected) {
      const header = document.createElement('th');
      header.scope = 'col';
      header.textContent = program.name;
      headerRow.append(header);
    }
    head.append(headerRow);
    const body = document.createElement('tbody');
    for (const [label, field] of fields) {
      const row = document.createElement('tr');
      const rowHeader = document.createElement('th');
      rowHeader.scope = 'row';
      rowHeader.textContent = label;
      row.append(rowHeader);
      for (const program of selected) {
        const cell = document.createElement('td');
        cell.append(createComparisonList(program, field));
        row.append(cell);
      }
      body.append(row);
    }
    table.append(head, body);
    wrapper.append(table);
    comparisonResults.replaceChildren(wrapper, createMobileComparison(selected, fields));
    setProgramPickerExpanded(false);
  }

  function createMobileComparison(selected, fields) {
    const cards = document.createElement('div');
    cards.className = 'comparison-mobile-cards';
    for (const [label, field] of fields) {
      const card = document.createElement('article');
      card.className = 'comparison-mobile-card';
      const heading = document.createElement('h3');
      heading.textContent = label;
      card.append(heading);
      const comparisons = document.createElement('div');
      comparisons.className = 'comparison-mobile-values';
      for (const program of selected) {
        const comparison = document.createElement('div');
        comparison.className = 'comparison-mobile-value';
        const programName = document.createElement('h4');
        programName.textContent = program.name;
        const description = document.createElement('div');
        description.append(createComparisonList(program, field));
        comparison.append(programName, description);
        comparisons.append(comparison);
      }
      card.append(comparisons);
      cards.append(card);
    }
    return cards;
  }

  function createComparisonList(program, field) {
    if (field === 'homepage') {
      const homepage = document.createElement('div');
      homepage.className = 'comparison-homepage-value';
      if (!program.homepage) {
        homepage.textContent = 'Not listed in the program guide.';
        return homepage;
      }
      const qr = document.createElement('div');
      qr.className = 'comparison-homepage-qr';
      qr.innerHTML = createQrSvg(program.homepage);
      const address = document.createElement('a');
      address.href = program.homepage;
      address.target = '_blank';
      address.rel = 'noopener noreferrer';
      address.textContent = program.homepage;
      homepage.append(qr, address);
      return homepage;
    }
    const items = formatComparisonItems(program[field]);
    if (!items.length) items.push('Not listed in the program guide.');
    const list = document.createElement('ul');
    list.className = 'comparison-bullets';
    for (const item of items) {
      const bullet = document.createElement('li');
      bullet.textContent = item;
      list.append(bullet);
    }
    return list;
  }

  function formatComparisonItems(value) {
    if (!value) return [];
    const maxLength = 145;
    return value.split(/;\s*/).map(item => item.trim()).filter(Boolean).map(item => {
      if (item.length <= maxLength) return item;
      const shortened = item.slice(0, maxLength).replace(/\s+\S*$/, '').trimEnd();
      return `${shortened}…`;
    });
  }

  compareSelectedButton.addEventListener('click', renderComparisonTable);
  programPickerToggle.addEventListener('click', () => {
    const isExpanded = programPickerToggle.getAttribute('aria-expanded') === 'true';
    setProgramPickerExpanded(!isExpanded);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 700 && programPicker.hidden) setProgramPickerExpanded(true);
  });
  exportComparisonButton.addEventListener('click', () => {
    const selected = programs.filter(program => selectedProgramNames.has(program.name));
    downloadComparisonPdf(selected);
  });
  document.querySelector('#clearCompareButton').addEventListener('click', () => {
    selectedProgramNames.clear();
    comparisonResults.replaceChildren();
    renderProgramChecklist();
  });

  renderProgramChecklist();
  return { selectProgramsForComparison };
}
