export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const visibleItems = this.filterItemsByUser(user, items);
    const rows = this.generateRows(reportType, user, visibleItems);
    const total = this.calculateTotal(visibleItems);
    return this.buildReport(reportType, user, rows, total);
  }

  filterItemsByUser(user, items) {
    switch (user.role) {
      case 'ADMIN':
        return this.markHighValueItems(items);
      case 'USER':
        return this.filterUserItems(items);
      default:
        return [];
    }
  }

  markHighValueItems(items) {
    return items.map(item => ({
      ...item,
      priority: item.value > 1000
    }));
  }

  filterUserItems(items) {
    return items.filter(item => item.value <= 500);
  }

  generateRows(reportType, user, items) {
    return items.map(item =>
      reportType === 'CSV'
        ? this.formatCsvRow(item, user)
        : this.formatHtmlRow(item)
    );
  }

  formatCsvRow(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}`;
  }

  formatHtmlRow(item) {
    const style = item.priority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>`;
  }

  calculateTotal(items) {
    return items.reduce((acc, item) => acc + item.value, 0);
  }

  buildReport(reportType, user, rows, total) {
    if (reportType === 'CSV') return this.buildCsvReport(rows, total);
    if (reportType === 'HTML') return this.buildHtmlReport(user, rows, total);
    return '';
  }

  buildCsvReport(rows, total) {
    return [
      'ID,NOME,VALOR,USUARIO',
      ...rows,
      '',
      `Total,,`,
      `${total},,`
    ].join('\n').trim();
  }

  buildHtmlReport(user, rows, total) {
    return [
      '<html><body>',
      '<h1>Relatório</h1>',
      `<h2>Usuário: ${user.name}</h2>`,
      '<table>',
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>',
      ...rows,
      '</table>',
      `<h3>Total: ${total}</h3>`,
      '</body></html>'
    ].join('\n').trim();
  }
}
