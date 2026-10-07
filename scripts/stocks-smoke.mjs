import assert from "node:assert/strict";

// Executado pela regressão existente, com o mesmo Chrome e API simulada.
export async function runStockSmoke({
  evaluate,
  waitFor,
  visit,
  fill,
  click,
  select,
  number,
  authenticate,
  screenshot,
  cdp,
  token,
  adminToken,
  latest,
  requests,
  stock,
  origin,
  setFailPath,
}) {
  const textarea = async (selector, value) =>
    evaluate(
      `(() => { const input = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); })()`,
    );
  const saved = async (path) =>
    waitFor(
      `location.pathname.split('/').filter(Boolean).join('/') === ${JSON.stringify(path.slice(1))}`,
    );
  const query = (path) => new URLSearchParams(latest(path, "GET").search);
  const exportExcel = async () => {
    const before = requests.filter(
      (request) => request.path === "/listing-exports/excel",
    ).length;
    await click(".table-toolbar .pi-file-excel");
    await click(".p-confirm-dialog-accept");
    await waitFor("!document.querySelector('.p-confirm-dialog')");
    for (
      let attempt = 0;
      attempt < 100 &&
      requests.filter((request) => request.path === "/listing-exports/excel")
        .length === before;
      attempt++
    )
      await new Promise((done) => setTimeout(done, 100));
    assert.ok(
      requests.filter((request) => request.path === "/listing-exports/excel")
        .length > before,
    );
  };

  await authenticate(token([]));
  const routes = [
    "/categories",
    "/categories/create",
    "/categories/1/edit",
    "/items",
    "/items/create",
    "/items/1/edit",
    "/item-units",
    "/item-units/create",
    "/item-units/1/edit",
    "/stock-balances",
    "/stock-balances/1/units",
    "/stock-balances/1/units/create",
    "/stock-balances/1/units/1/edit",
    "/stock-movements",
    "/stock-movements/create",
    "/reports/stock-reports",
  ];
  for (const path of routes) {
    await cdp("Page.navigate", { url: origin + path });
    await waitFor("location.pathname === '/not-authorized'");
  }
  for (const permissions of [["STOCK_BALANCES_READ"], ["ITEM_UNIT_READ"]]) {
    await authenticate(token(permissions));
    await cdp("Page.navigate", { url: origin + "/stock-balances/1/units" });
    await waitFor("location.pathname === '/not-authorized'");
  }
  await authenticate(token(["STOCK_REPORTS_READ"]));
  await visit("/reports/stock-reports", "#stock-report-type");
  await waitFor(
    "document.querySelector('#stock-report-item').options.length > 1",
  );
  assert.equal(
    await evaluate(
      "!!document.querySelector('.sidebar a[href=\"/reports/stock-reports\"]') && !document.querySelector('.sidebar a[href=\"/reports/financial-reports\"]')",
    ),
    true,
  );
  for (const [path, authority] of [
    ["categories", "CATEGORY"],
    ["items", "ITEM"],
    ["item-units", "ITEM_UNIT"],
  ]) {
    await authenticate(token([`${authority}_READ`]));
    await visit(`/${path}`, ".p-datatable-tbody .pi-eye");
    assert.equal(
      await evaluate(
        "!!document.querySelector('.pi-trash, .pi-pencil, .pi-sync, .pi-minus-circle, .pi-ban')",
      ),
      false,
    );
    assert.equal(
      await evaluate(
        "!!document.querySelector('.p-datatable .selection-column')",
      ),
      false,
    );
  }
  await authenticate(token(["STOCK_BALANCES_READ"]));
  await visit("/stock-balances", ".minimum-quantity-input");
  assert.equal(
    await evaluate(
      "document.querySelector('.minimum-quantity-input').disabled",
    ),
    true,
  );
  await authenticate(token(["STOCK_MOVEMENTS_WRITE"]));
  await visit("/stock-movements/create", "#type");
  await waitFor("document.querySelector('#itemId').options.length > 1");
  assert.equal(
    await evaluate(
      "document.querySelector('#type option[value=STATUS_CHANGE]').disabled",
    ),
    true,
  );
  await select("#type", "EXIT");
  await select("#itemId", "1");
  await fill("#quantity", "2");
  assert.equal(
    await evaluate("!!document.querySelector('#movementUnit')"),
    false,
  );
  await click("button[type=submit]");
  await waitFor("location.pathname === '/not-authorized'");
  assert.equal(
    JSON.parse(latest("/inventory/stock-movements", "POST").body).itemUnitId,
    null,
  );
  console.log(
    "OK estoque: guards, permissões combinadas, menus, ações READ e saída automática sem leitura de unidades",
  );

  await authenticate(adminToken);
  await visit("/contact", ".contact-page");
  assert.equal(
    await evaluate(
      "document.querySelector('.primary-contact').getAttribute('href')",
    ),
    "tel:+553134532000",
  );
  for (const [resource, single, noun] of [
    ["categories", "category", "Categoria"],
    ["items", "item", "Item"],
  ]) {
    await visit(`/${resource}/create`, "#name");
    assert.equal(
      await evaluate("document.querySelector('button[type=submit]').disabled"),
      true,
    );
    await fill("#name", `${noun} Criado`);
    if (resource === "items") {
      await waitFor("document.querySelector('#category').options.length > 1");
      await select("#category", "1");
      await textarea("#description", "Descrição criada");
    }
    await evaluate(
      "(() => { const transfer = new DataTransfer(); transfer.items.add(new File(['png'], 'imagem.png', { type: 'image/png' })); const input = document.querySelector('#image'); input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()",
    );
    await click("button[type=submit]");
    await saved(`/${resource}`);
    const body = JSON.parse(latest(`/inventory/${resource}`, "POST").body);
    assert.deepEqual(
      Object.keys(body).sort(),
      resource === "items"
        ? ["categoryId", "description", "name", "price"]
        : ["name"],
    );
    if (resource === "items") assert.equal(body.price, null);
    assert.match(
      latest(`/inventory/${resource}/20/image`, "PUT").body,
      /name="file"; filename="imagem.png"/,
    );
    await visit(`/${resource}/20/edit`, "#name");
    await waitFor(
      `document.querySelector('#name').value === '${noun} Criado' && !document.querySelector('button[type=submit]').disabled`,
    );
    await fill("#name", `${noun} Atualizado`);
    if (resource === "items") await number("#price", "0,00");
    await click("button[type=submit]");
    await saved(`/${resource}`);
    const update = JSON.parse(latest(`/inventory/${resource}/20`, "PUT").body);
    assert.equal(update.id, 20);
    if (resource === "items") assert.equal(update.price, 0);
    await visit(`/${resource}`, ".p-datatable-tbody .pi-eye");
    await fill(
      `input[placeholder="Digite o nome ${resource === "categories" ? "da categoria" : "do item"}"]`,
      "Atualizado",
    );
    await click(".filter-search-icon");
    await waitFor(
      `document.querySelector('.p-datatable-tbody').textContent.includes('${noun} Atualizado')`,
    );
    await click(".p-datatable-tbody .pi-eye");
    await waitFor(
      `document.querySelector('.${single}-details-dialog')?.textContent.includes('${noun} Atualizado')`,
    );
    await click(`.${single}-details-dialog .p-dialog-header-close`);
    await click(".p-datatable-tbody .pi-ban");
    await waitFor("!!document.querySelector('.row-inactive')");
    assert.equal(
      latest(`/inventory/${resource}/20/active`, "PATCH").body,
      "false",
    );
    assert.match(
      latest(`/inventory/${resource}/20/active`, "PATCH").headers[
        "content-type"
      ],
      /application\/json/,
    );
    await exportExcel();
  }
  console.log(
    "OK categorias e itens: validações, CRUD, imagem multipart, detalhes, filtro, status, Excel e preço ausente/zero",
  );

  await visit("/item-units/create?itemId=1", "#item");
  await waitFor(
    "document.querySelector('#item').value === '1' && !document.querySelector('button[type=submit]').disabled",
  );
  assert.equal(
    await evaluate(
      "!!document.querySelector('[name=assetCode], [name=serialNumber], [name=status]')",
    ),
    false,
  );
  assert.equal(
    await evaluate("!!document.querySelector('#item option[value=\"2\"]')"),
    false,
  );
  await select("#conditionStatus", "NEW");
  await fill("#purchaseDate", "2026-02-03");
  await click("button[type=submit]");
  await saved("/item-units");
  assert.deepEqual(
    Object.keys(
      JSON.parse(latest("/inventory/item-units", "POST").body),
    ).sort(),
    ["conditionStatus", "itemId", "notes", "purchaseDate"],
  );
  await visit("/item-units/20/edit?itemId=1", "#item");
  await waitFor("document.querySelector('#conditionStatus').value === 'NEW'");
  assert.equal(
    await evaluate("document.querySelector('#item').disabled"),
    true,
  );
  await select("#conditionStatus", "FAIR");
  await click("button[type=submit]");
  await saved("/item-units");
  assert.deepEqual(
    Object.keys(
      JSON.parse(latest("/inventory/item-units/20", "PUT").body),
    ).sort(),
    ["conditionStatus", "id", "itemId", "notes", "purchaseDate"],
  );
  await visit("/item-units?itemId=1", ".p-datatable-tbody .pi-sync");
  assert.equal(query("/inventory/item-units").get("active"), "true");
  await click(".p-datatable-tbody .pi-sync");
  await waitFor("!!document.querySelector('#unitStatus')");
  assert.equal(
    await evaluate(
      "document.querySelector('.p-dialog button[type=submit]').disabled",
    ),
    true,
  );
  await select("#unitStatus", "UNAVAILABLE");
  await textarea("#statusReason", "Uso temporário");
  await click(".p-dialog button[type=submit]");
  await waitFor("!document.querySelector('#unitStatus')");
  assert.deepEqual(
    JSON.parse(latest("/inventory/item-units/1/status", "PATCH").body),
    { status: "UNAVAILABLE", reason: "Uso temporário" },
  );
  await click(".p-datatable-tbody .pi-minus-circle");
  await click(".p-confirm-dialog-accept");
  await waitFor(
    "!document.querySelector('.p-confirm-dialog') && !document.querySelector('.p-datatable-tbody').textContent.includes('CODE0001')",
  );
  await select("#unitActiveFilter", "false");
  await waitFor("!!document.querySelector('.p-datatable-tbody .pi-check')");
  assert.equal(query("/inventory/item-units").get("active"), "false");
  await click(".p-datatable-tbody .pi-check");
  await waitFor(
    "!document.querySelector('.p-datatable-tbody').textContent.includes('CODE0001')",
  );
  assert.equal(latest("/inventory/item-units/1/active", "PATCH").body, "true");
  await select("#unitActiveFilter", "all");
  await waitFor(
    "document.querySelector('.p-datatable-tbody').textContent.includes('CODE0001')",
  );
  assert.equal(query("/inventory/item-units").has("active"), false);
  await exportExcel();
  assert.equal(query("/inventory/item-units").has("active"), false);
  await visit("/stock-balances/1/units", "#unitActiveFilter");
  await waitFor("!!document.querySelector('.p-datatable-tbody .pi-eye')");
  assert.equal(query("/inventory/item-units").get("itemId"), "1");
  await visit("/stock-balances", ".minimum-quantity-input");
  await number(".minimum-quantity-input", "0");
  await waitFor(
    "document.body.textContent.includes('Estoque mínimo atualizado!')",
  );
  assert.deepEqual(
    JSON.parse(latest("/inventory/stock-balances/1/minimum", "PATCH").body),
    { minimumQuantity: 0 },
  );
  await number(".minimum-quantity-input", "1.5");
  await waitFor(
    "document.body.textContent.includes('O estoque mínimo deve ser um número inteiro')",
  );
  assert.equal(
    JSON.parse(latest("/inventory/stock-balances/1/minimum", "PATCH").body)
      .minimumQuantity,
    0,
  );
  console.log(
    "OK unidades: DTOs mínimos, filtros active, baixa, reentrada, status com motivo e mínimo inteiro/zero",
  );

  await visit("/stock-movements/create", "#type");
  await waitFor("document.querySelector('#itemId').options.length > 1");
  await select("#itemId", "1");
  await select("#type", "ADJUSTMENT");
  await fill("#quantity", "0");
  await click("button[type=submit]");
  await saved("/stock-movements");
  assert.equal(
    JSON.parse(latest("/inventory/stock-movements", "POST").body).quantity,
    0,
  );
  await visit("/stock-movements/create", "#type");
  await waitFor("document.querySelector('#itemId').options.length > 1");
  await select("#itemId", "1");
  await select("#type", "STATUS_CHANGE");
  await waitFor(
    "document.querySelector('#movementUnit').options.length > 1 && !document.querySelector('#movementUnit').disabled",
  );
  await select("#movementUnit", "2");
  assert.equal(
    await evaluate(
      "document.querySelector('#quantity').value === '1' && document.querySelector('#quantity').readOnly",
    ),
    true,
  );
  assert.equal(
    await evaluate(
      "document.querySelector('#movementStatus option[value=MAINTENANCE]').disabled",
    ),
    true,
  );
  await select("#movementStatus", "DAMAGED");
  await click("button[type=submit]");
  await saved("/stock-movements");
  const movement = JSON.parse(
    latest("/inventory/stock-movements", "POST").body,
  );
  assert.equal(movement.itemUnitId, 2);
  assert.equal(movement.status, "DAMAGED");
  assert.equal(movement.quantity, 1);
  await visit("/stock-movements/create", "#type");
  await waitFor("document.querySelector('#itemId').options.length > 1");
  await select("#itemId", "1");
  await select("#type", "EXIT");
  await waitFor(
    "document.querySelector('#movementUnit').options.length > 1 && !document.querySelector('#movementUnit').disabled",
  );
  assert.equal(
    await evaluate(
      '!!document.querySelector(\'#movementUnit option[value="2"], #movementUnit option[value="3"], #movementUnit option[value="4"]\')',
    ),
    false,
  );
  await select("#movementUnit", "6");
  await select("#type", "ADJUSTMENT");
  await select("#type", "EXIT");
  assert.equal(
    await evaluate("document.querySelector('#movementUnit').value"),
    "",
  );
  console.log(
    "OK movimentações: ajuste zero, situação diferente, unidade ativa, quantidade fixa e saída somente de disponíveis",
  );

  await visit("/reports/stock-reports", "#stock-report-type");
  await waitFor(
    "document.querySelector('#stock-report-item').options.length > 1 && !document.querySelector('[aria-busy=true]')",
  );
  assert.ok(
    Math.abs(
      (await evaluate(
        "parseFloat(document.querySelector('.availability-bar').style.width)",
      )) -
        (2 / 6) * 100,
    ) < 0.001,
  );
  await select("#stock-report-item", "2");
  await select("#stock-report-category", "1");
  assert.equal(
    await evaluate("document.querySelector('#stock-report-item').value"),
    "",
  );
  assert.equal(
    await evaluate(
      "!!document.querySelector('#stock-report-item option[value=\"2\"]')",
    ),
    false,
  );
  await select("#stock-report-type", "item-units");
  await select("#stock-report-status", "LOST");
  await select("#stock-report-active", "false");
  assert.equal(
    await evaluate(
      "document.querySelector('#stock-report-status').value === 'ALL' && document.querySelector('#stock-report-status').disabled",
    ),
    true,
  );
  await click(".stock-report-form-buttons .btn-success");
  await waitFor(
    "!document.querySelector('.stock-report-list-screen .loading-label')",
  );
  assert.equal(
    query("/reports/stock-reports/item-units/xlsx").get("active"),
    "false",
  );
  assert.equal(
    query("/reports/stock-reports/item-units/xlsx").get("status"),
    "ALL",
  );
  await select("#stock-report-type", "movements");
  assert.equal(
    await evaluate(
      "!!document.querySelector('#stock-report-active, #stock-report-status')",
    ),
    false,
  );
  await fill("#stock-report-start-date", "2026-10-10");
  await fill("#stock-report-end-date", "2026-10-01");
  await click(".stock-report-form-buttons .btn-primary");
  await waitFor(
    "document.body.textContent.includes('Data inicial não pode ser maior')",
  );
  assert.equal(
    latest("/reports/stock-reports/movements/pdf", "GET"),
    undefined,
  );
  await fill("#stock-report-end-date", "2026-10-20");
  await click(".stock-report-form-buttons .btn-success");
  await waitFor(
    "!document.querySelector('.stock-report-list-screen .loading-label')",
  );
  assert.equal(
    query("/reports/stock-reports/movements/xlsx").has("active"),
    false,
  );
  assert.equal(
    query("/reports/stock-reports/movements/xlsx").has("status"),
    false,
  );
  assert.equal(
    query("/reports/stock-reports/movements/xlsx").get("startDate"),
    "2026-10-10",
  );
  await click(".stock-report-form-buttons .btn-outline-primary");
  await waitFor("!document.querySelector('[aria-busy=true]')");
  assert.deepEqual(
    [...query("/reports/stock-reports/summary").keys()],
    ["categoryId"],
  );
  setFailPath("/reports/stock-reports/movements/xlsx");
  await click(".stock-report-form-buttons .btn-success");
  await waitFor(
    "document.body.textContent.includes('Ocorreu um erro ao processar a sua solicitação') && !document.querySelector('.stock-report-list-screen .loading-label')",
  );
  setFailPath("");
  await click(".stock-report-form-buttons .btn-outline-danger");
  await waitFor(
    "document.querySelector('#stock-report-type').value === 'balances' && !document.querySelector('[aria-busy=true]')",
  );
  assert.equal([...query("/reports/stock-reports/summary")].length, 0);
  console.log(
    "OK relatórios de estoque: opções próprias, filtros condicionais, resumo, validação de período, Excel e erro HTTP",
  );

  // Testa o download de PDF com bloqueio de popup, incluindo o nome do arquivo.
  await evaluate(
    "window.__stockDownloads = []; window.open = () => null; HTMLAnchorElement.prototype.click = function() { window.__stockDownloads.push(this.download); };",
  );
  await click(".stock-report-form-buttons .btn-primary");
  await waitFor("window.__stockDownloads.includes('balances.pdf')");
  assert.ok(latest("/reports/stock-reports/balances/pdf", "GET"));

  // Uma imagem ausente não deve impedir a edição nem os selects do item.
  stock.items[0].imageContentType = "image/png";
  setFailPath("/inventory/items/1/image");
  await visit("/items/1/edit", "#name");
  await waitFor(
    "document.querySelector('#name').value === 'Item 1' && document.querySelector('#category').options.length > 1 && !document.querySelector('button[type=submit]').disabled",
  );
  setFailPath("");
  delete stock.items[0].imageContentType;

  // A consulta de unidades deve alcançar a segunda página e descartar a seleção anterior.
  const originalUnits = stock["item-units"];
  stock["item-units"] = [
    ...originalUnits,
    ...Array.from({ length: 1001 }, (_, index) => ({
      id: 2000 + index,
      item: stock.items[2],
      assetCode: `MANY-${index}`,
      status: "AVAILABLE",
      conditionStatus: "GOOD",
      active: true,
    })),
  ];
  await visit("/stock-movements/create", "#type");
  await waitFor("document.querySelector('#itemId').options.length > 1");
  await select("#type", "EXIT");
  await select("#itemId", "3");
  await waitFor(
    "document.querySelector('#movementUnit').options.length === 1002 && !document.querySelector('#movementUnit').disabled",
  );
  assert.ok(
    requests.some(
      (request) =>
        request.path === "/inventory/item-units" &&
        new URLSearchParams(request.search).get("itemId") === "3" &&
        new URLSearchParams(request.search).get("page") === "1",
    ),
  );
  await select("#movementUnit", "3000");
  await select("#itemId", "1");
  await waitFor(
    "document.querySelector('#movementUnit').options.length < 10 && !document.querySelector('#movementUnit').disabled",
  );
  assert.equal(
    await evaluate("document.querySelector('#movementUnit').value"),
    "",
  );
  assert.equal(
    await evaluate(
      "!!document.querySelector('#movementUnit option[value=\"3000\"]')",
    ),
    false,
  );
  stock["item-units"] = originalUnits;

  // A seleção para exclusão/baixa precisa permanecer entre páginas.
  for (const [resource, slug] of [
    ["categories", "category"],
    ["items", "item"],
    ["item-units", "item-unit"],
  ]) {
    await visit(`/${resource}`, ".p-datatable-tbody .p-checkbox-box");
    await click(".p-datatable-tbody .p-checkbox-box");
    await click(".p-paginator-next");
    await waitFor(
      `document.querySelector('.p-datatable-tbody').textContent.includes('${resource === "categories" ? "Categoria 6" : resource === "items" ? "Item 6" : "CODE0006"}')`,
    );
    await click(".p-datatable-tbody .p-checkbox-box");
    await click(`.${slug}-actions-group .btn-danger`);
    await click(".p-confirm-dialog-accept");
    await waitFor("!document.querySelector('.p-confirm-dialog')");
    assert.deepEqual(
      JSON.parse(latest(`/inventory/${resource}/all`, "DELETE").body),
      [1, 6],
    );
    if (resource === "item-units") {
      await waitFor(
        "!document.querySelector('.item-unit-actions-group .btn-danger')",
      );
      assert.equal(
        stock["item-units"].find((unit) => unit.id === 1).active,
        false,
      );
      assert.equal(
        stock["item-units"].find((unit) => unit.id === 6).active,
        false,
      );
    }
  }
  console.log(
    "OK PDF, edição sem imagem, consulta de 1001 unidades, troca de item e exclusão/baixa entre páginas",
  );

  for (const width of [390, 576, 767, 768, 1024]) {
    await cdp("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const [path, selector] of [
      ["/contact", ".contact-page"],
      ["/categories", ".category-list-screen"],
      ["/categories/create", ".category-form-screen"],
      ["/items", ".item-list-screen"],
      ["/items/create", ".item-form-screen"],
      ["/item-units", ".item-unit-list-screen"],
      ["/item-units/create", ".item-unit-form-screen"],
      ["/stock-balances", ".minimum-quantity-input"],
      ["/stock-movements", ".stock-movement-list-screen"],
      ["/stock-movements/create", ".stock-movement-form-screen"],
      ["/reports/stock-reports", ".availability-chart"],
    ]) {
      await visit(path, selector);
      assert.equal(
        await evaluate("document.documentElement.scrollWidth <= innerWidth"),
        true,
        `${path} ${width}`,
      );
      if (width === 390 || width === 1024)
        await screenshot(`stocks-${path.replaceAll("/", "-")}-${width}`);
    }
  }
  await cdp("Emulation.clearDeviceMetricsOverride");
  console.log(
    "OK contato e estoque nos breakpoints 390/576/767/768/1024 sem transbordamento",
  );
}
