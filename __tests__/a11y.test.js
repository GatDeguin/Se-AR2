const fs = require('fs');
const path = require('path');
const { getByRole, getByLabelText } = require('@testing-library/dom');
const { configureAxe, toHaveNoViolations } = require('jest-axe');
require('@testing-library/jest-dom');
expect.extend(toHaveNoViolations);

const axe = configureAxe({ rules: { region: { enabled: false } } });

beforeAll(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  document.documentElement.innerHTML = html.toString();
});

describe('accessibility checks', () => {
  test('help panel has dialog role and is hidden initially', () => {
    const helpPanel = getByRole(document.body, 'dialog', { hidden: true });
    expect(helpPanel).toBeInTheDocument();
    expect(helpPanel).toHaveAttribute('aria-hidden', 'true');
  });

  test('help button has aria attributes', () => {
    const helpBtn = getByLabelText(document.body, 'FAQ y tips');
    expect(helpBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('page has no basic accessibility violations', async () => {
    const results = await axe(document.getElementById('helpPanel'));
    expect(results).toHaveNoViolations();
  }, 20000);
});
