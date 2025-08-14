import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

// Debounce: leading-edge responsive feel, trailing commit
const debounce = (fn, delay = 200) => {
  let t, lastArgs, lastThis;
  const later = () => {
    t = undefined;
    fn.apply(lastThis, lastArgs);
  };
  const debounced = function (...args) {
    lastArgs = args;
    lastThis = this;
    if (t) clearTimeout(t);
    t = setTimeout(later, delay);
  };
  debounced.cancel = () => t && clearTimeout(t);
  return debounced;
};

// Try to show HA toast if possible
const showToast = (el, message) => {
  try {
    const event = new CustomEvent('hass-notification', {
      detail: { message },
      bubbles: true,
      composed: true,
    });
    el.dispatchEvent(event);
  } catch (_) {
    // no-op
  }
};

// Try to use HA confirmation dialog; fallback to window.confirm
const confirmDialog = async (el, title, text) => {
  try {
    const event = new CustomEvent("show-dialog", {
      detail: {
        dialogTag: "ha-dialog-confirm",
        dialogImport: () => import("https://unpkg.com/home-assistant-js-websocket"),
        dialogParams: {
          title,
          text,
          confirmText: "OK",
          dismissText: "Abbrechen",
          confirm: true,
        },
      },
      bubbles: true,
      composed: true,
    });
    el.dispatchEvent(event);
    // If your setup doesn't resolve the dialog promise, fallback to confirm:
    return typeof window.confirm === "function" ? window.confirm(text) : true;
  } catch {
    return window.confirm(text);
  }
};

class ItemListCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
    _cachedItems: { state: true },
    _cachedSourceMap: { state: true },
    _filterValue: { state: true },
    _lastItemsHash: { state: false },
    _lastSourceMapHash: { state: false },
  };

  static styles = css`
    :host {
      display: block;
      font-family: var(--primary-font-family, sans-serif);
    }
    ha-card {
      padding: 10px;
    }
    h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color, #333);
    }
    .card-title {
      text-align: center;
      font-size: 1.3em;
      font-weight: bold;
      color: var(--primary-text-color);
    }
    .input-row {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
      height: 36px;
    }
    .input-row input {
      flex: 1;
      padding: 6px 8px;
      font-size: 14px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      color: var(--primary-text-color);
      background: var(--card-background-color);
    }
    .input-row input:focus {
      outline: 2px solid var(--accent-color, #03a9f4);
      outline-offset: 1px;
    }
    .input-row .btn {
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: var(--primary-text-color, #555);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    .input-row .btn:hover,
    .btn:hover {
      background: rgba(0,0,0,0.04);
      color: var(--accent-color, #03a9f4);
    }
    .item-row {
      display: flex;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }
    .item-summary {
      flex: 1 1 70%;
      font-size: 14px;
      color: var(--primary-text-color, #555);
      white-space: normal;
      overflow: visible;
      text-overflow: unset;
      user-select: text;
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
    }
    .info {
      font-size: 13px;
      color: var(--secondary-text-color, #999);
      margin-bottom: 8px;
    }
    .item-controls {
      flex: 0 0 30%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }
    .btn {
      width: 28px;
      height: 28px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: var(--primary-text-color, #555);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    .hidden {
      display: none !important;
    }
    .quantity {
      min-width: 20px;
      text-align: center;
      font-weight: 500;
      font-size: 14px;
      color: var(--primary-text-color, #333);
    }
    .empty-state {
      padding: 8px 0;
      font-size: 14px;
      color: var(--secondary-text-color, #999);
    }
    .item-sublabel {
      font-size: 12px;
      color: var(--secondary-text-color, #aaa);
      margin-top: 2px;
    }
    .highlight {
      background-color: rgba(255, 235, 59, 0.4); /* soft yellow */
      padding: 0 2px;
      border-radius: 3px;
    }
  `;

  constructor() {
    super();
    this._cachedItems = [];
    this._cachedSourceMap = {};
    this._filterValue = '';
    this._lastItemsHash = '';
    this._lastSourceMapHash = '';
    this._debouncedUpdateFilterText = debounce(this._updateFilterTextActual.bind(this), 250);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._debouncedUpdateFilterText?.cancel) this._debouncedUpdateFilterText.cancel();
  }

  setConfig(config) {
    if (!config) throw new Error("Missing config");
    const required = ['filter_items_entity', 'shopping_list_entity', 'filter_entity'];
    const missing = required.filter(k => !config[k]);
    if (missing.length) {
      throw new Error(`Missing required config: ${missing.join(', ')}`);
    }
    this.config = {
      title: 'ToDo List',
      show_origin: false,
      hide_add_button: false,
      max_items_without_filter: 20,
      highlight_matches: false, 
      ...config,
    };
  }

  getCardSize() {
    const base = 4;
    return base + Math.min(this._cachedItems?.length || 0, 6);
  }

  // Compute cheap hashes to detect attribute changes without JSON.stringify of arrays
  _hash(val) {
    try {
      const s = typeof val === 'string' ? val : JSON.stringify(val);
      let h = 0, i = 0, len = s.length;
      while (i < len) h = (h << 5) - h + s.charCodeAt(i++) | 0;
      return h.toString();
    } catch {
      return Math.random().toString(36).slice(2);
    }
  }

  shouldUpdate(changedProps) {
    if (!changedProps.has('hass')) return changedProps.size > 0;

    const hass = this.hass;
    if (!hass || !this.config) return true;

    const filterEntity = hass.states?.[this.config.filter_entity];
    const filterItemsEntity = hass.states?.[this.config.filter_items_entity];

    // Update cached filter value
    const nextFilter = filterEntity?.state ?? '';
    if (nextFilter !== this._filterValue) {
      this._filterValue = nextFilter;
      return true;
    }

    // Check filtered_items change
    const itemsAttr = filterItemsEntity?.attributes?.filtered_items;
    const nextItems = typeof itemsAttr === 'string'
      ? this._safeParseJSON(itemsAttr, [])
      : Array.isArray(itemsAttr) ? itemsAttr : [];
    const itemsHash = this._hash(nextItems);

    // Check source_map change
    const mapAttr = filterItemsEntity?.attributes?.source_map;
    const nextMap = typeof mapAttr === 'string'
      ? this._safeParseJSON(mapAttr, {})
      : (mapAttr && typeof mapAttr === 'object') ? mapAttr : {};
    const mapHash = this._hash(nextMap);

    const changed = itemsHash !== this._lastItemsHash || mapHash !== this._lastSourceMapHash;

    if (changed) {
      this._cachedItems = nextFilter.trim()
        ? nextItems
        : nextItems.slice(0, this.config.max_items_without_filter);
      this._cachedSourceMap = nextMap;
      this._lastItemsHash = itemsHash;
      this._lastSourceMapHash = mapHash;
    }

    // Also update when total count (state) changes while no filter applied
    const oldHass = changedProps.get('hass');
    const oldCount = parseInt(oldHass?.states?.[this.config.filter_items_entity]?.state, 10) || 0;
    const newCount = parseInt(filterItemsEntity?.state, 10) || 0;
    const countChanged = oldCount !== newCount;

    return changed || countChanged;
  }

  _safeParseJSON(s, fallback) {
    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  }

  _isNumeric(str) {
    return typeof str === 'string' && /^\d+$/.test(str);
  }

  _updateFilterTextActual(value) {
    this.hass.callService('input_text', 'set_value', {
      entity_id: this.config.filter_entity,
      value,
    }).catch(err => console.error("Error updating filter text:", err));
  }

  _handleFilterInputChange(e) {
    this._debouncedUpdateFilterText(e.target.value);
  }

  _onInputKeydown = (e) => {
    if (e.key === 'Enter') {
      const val = (e.currentTarget?.value || '').trim();
      if (!val) return;
      if (this.config.hide_add_button) return;
      if (val.length > 3) this._addFilterTextToShoppingList();
    } else if (e.key === 'Escape') {
      this._updateFilterTextActual('');
    }
  }

  _normalizeTodoText(raw) {
    let value = (raw || '').trim();
    if (!value) return '';
    if (value.startsWith('todo:')) {
      const parts = value.split(' ');
      if (parts.length > 1) {
        parts.shift();
        value = parts.join(' ');
      } else {
        return '';
      }
    }
    return value;
  }

  _addFilterTextToShoppingList = async () => {
    const raw = this.hass.states[this.config.filter_entity]?.state || '';
    const value = this._normalizeTodoText(raw);
    if (!value) return;

    const ok = await confirmDialog(this, 'Zur Einkaufsliste hinzufügen', `Möchtest du "${value}" zur Einkaufsliste hinzufügen?`);
    if (!ok) return;

    this.hass.callService('todo', 'add_item', {
      entity_id: this.config.shopping_list_entity,
      item: value,
      description: '',
    }).then(() => {
      showToast(this, `Hinzugefügt: ${value}`);
      this._updateFilterTextActual('');
    }).catch(err => console.error("Error adding search term to shopping list:", err));
  }

  _updateOrCompleteItem(uid, updates, source, sourceMap) {
    const entityId = sourceMap?.[String(source)];
    if (!entityId) {
      console.error('No valid todo entity id for source:', source);
      return;
    }

    const data = {
      entity_id: entityId,
      item: uid,          // IMPORTANT: use item key, value is the UID
      ...updates,         // { description: n } or { status: 'completed' }
    };

    // Optional: coerce numeric description to string if your service requires it
    if (updates.description !== undefined) {
      let desc = parseInt(updates.description, 10);
      if (isNaN(desc) || desc < 0) desc = 0;
      data.description = String(desc);
    }

    this.hass.callService('todo', 'update_item', data)
      .catch(err => console.error('Error calling todo/update_item:', err));
  }

  _confirmAndComplete = async (item, sourceMap) => {
    const ok = await confirmDialog(
      this,
      'Erledigen',
      `Möchtest du "${item.s}" wirklich als erledigt markieren?`
    );
    if (!ok) return;

    // Uses UID placed in 'item' field as required by your service
    this._updateOrCompleteItem(item.u, { status: 'completed' }, item.c, sourceMap);
  };

  _addToShoppingList(item) {
    const entityId = this.config.shopping_list_entity;
    if (!entityId) {
      console.error('No valid shopping list entity id configured');
      return;
    }
    const text = `Möchtest du "${item.s}" zur Einkaufsliste hinzufügen?`;
    (async () => {
      const ok = await confirmDialog(this, 'Zur Einkaufsliste', text);
      if (!ok) return;
      this.hass.callService('todo', 'add_item', {
        entity_id: entityId,
        item: item.s,
        description: this._isNumeric(item.d) ? String(item.d) : (item.d?.toString() ?? ''),
      }).then(() => showToast(this, `Hinzugefügt: ${item.s}`))
        .catch(err => console.error('Fehler beim Hinzufügen zur Einkaufsliste:', err));
    })();
  }

  _renderQuantityControls(item, sourceMap) {
    let qStr = String(item.d ?? '');
    if (qStr === '') qStr = '1';
    
    if (!this._isNumeric(qStr)) {
      return html`<div class="quantity" title="Menge">${qStr}</div>`;
    }
    const quantity = parseInt(qStr, 10);
    const dec = () => this._updateOrCompleteItem(item.u, { description: Math.max(quantity - 1, 0) }, item.c, sourceMap);
    const inc = () => this._updateOrCompleteItem(item.u, { description: quantity + 1 }, item.c, sourceMap);
    return html`
      ${quantity > 1
        ? html`<button class="btn" type="button" title="Verringern" aria-label="Verringern" @click=${dec}><ha-icon icon="mdi:minus-circle-outline"></ha-icon></button>`
        : ''}
      <div class="quantity" title="Menge">${quantity}</div>
      <button class="btn" type="button" title="Erhöhen" aria-label="Erhöhen" @click=${inc}><ha-icon icon="mdi:plus-circle-outline"></ha-icon></button>
    `;
  }

//   _renderItemRow(item, sourceMap) {
//     const showOrigin = !!this.config?.show_origin;
//     const sourceId = sourceMap?.[String(item.c)];
//     const friendlyName = showOrigin && sourceId
//       ? this.hass.states[sourceId]?.attributes?.friendly_name
//       : null;

//     return html`
//       <div class="item-row" role="listitem">
//         <div class="item-summary" title=${item.s}>
//           ${item.s}
//           ${friendlyName ? html`<div class="item-sublabel">${friendlyName}</div>` : ''}
//         </div>
//         <div class="item-controls">
//           ${this._renderQuantityControls(item, sourceMap)}
//           <button class="btn" type="button" title="Zur Einkaufsliste" aria-label="Zur Einkaufsliste"
//                   @click=${() => this._addToShoppingList(item)}>
//             <ha-icon icon="mdi:cart-outline"></ha-icon>
//           </button>
//           <button class="btn" type="button" title="Erledigt" aria-label="Erledigt"
//                   @click=${() => this._confirmAndComplete(item, sourceMap)}>
//             <ha-icon icon="mdi:delete-outline"></ha-icon>
//           </button>
//         </div>
//       </div>
//     `;
//   }
  
  _renderItemRow(item, sourceMap) {
    const showOrigin = !!this.config?.show_origin;
    const sourceId = sourceMap?.[String(item.c)];
    const friendlyName = showOrigin && sourceId
      ? this.hass.states[sourceId]?.attributes?.friendly_name
      : null;

    const filter = (this._filterValue || '').trim().toLowerCase();

    let parts = [item.s];
    if (filter) {
      const terms = filter.split(/\s+/).filter(t => t);
      parts = [];
      let remaining = item.s;
      while (remaining.length) {
        let found = false;
        for (const term of terms) {
          const idx = remaining.toLowerCase().indexOf(term);
          if (idx >= 0) {
            if (idx > 0) parts.push(remaining.slice(0, idx));
            parts.push(html`<span class="highlight">${remaining.slice(idx, idx + term.length)}</span>`);
            remaining = remaining.slice(idx + term.length);
            found = true;
            break;
          }
        }
        if (!found) {
          parts.push(remaining);
          break;
        }
      }
    }
    const shouldHighlight = filter && this.config.highlight_matches;
    
    return html`
      <div class="item-row" role="listitem">
        <div class="item-summary" title=${item.s}>
          ${shouldHighlight ? parts : item.s}
          ${friendlyName ? html`<div class="item-sublabel">${friendlyName}</div>` : ''}
        </div>
        <div class="item-controls">
          ${this._renderQuantityControls(item, sourceMap)}
          <button class="btn" type="button" title="Zur Einkaufsliste" aria-label="Zur Einkaufsliste" @click=${() => this._addToShoppingList(item)}>
            <ha-icon icon="mdi:cart-outline"></ha-icon>
          </button>
          <button class="btn" type="button" title="Erledigt" aria-label="Erledigt" @click=${() => this._confirmAndComplete(item, this._cachedSourceMap)}>
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }


  render() {
    if (!this.hass) {
      return html`<ha-card><div class="empty-state">Home Assistant context not available</div></ha-card>`;
    }

    const itemsEntity = this.hass.states[this.config.filter_items_entity];
    if (!itemsEntity) {
      return html`<ha-card><div class="empty-state">Entity '${this.config.filter_items_entity}' not found</div></ha-card>`;
    }

    const filterValue = this._filterValue ?? '';
    const showAddButton = filterValue.trim().length > 3 && !this.config.hide_add_button;

    // If cache not initialized yet, hydrate from entity
    if (!this._lastItemsHash) {
      const attr = itemsEntity.attributes.filtered_items;
      const items = typeof attr === 'string' ? this._safeParseJSON(attr, []) : Array.isArray(attr) ? attr : [];
      this._cachedItems = filterValue.trim()
        ? items
        : items.slice(0, this.config.max_items_without_filter);
      const mapAttr = itemsEntity.attributes.source_map;
      this._cachedSourceMap = typeof mapAttr === 'string'
        ? this._safeParseJSON(mapAttr, {})
        : (mapAttr && typeof mapAttr === 'object') ? mapAttr : {};
      this._lastItemsHash = this._hash(items);
      this._lastSourceMapHash = this._hash(this._cachedSourceMap);
    }

    const totalItemsCount = parseInt(itemsEntity?.state, 10) || 0;
    const displayedItems = this._cachedItems || [];

    return html`
      <ha-card>
        <h3 class="card-title">${this.config.title || 'ToDo List'}</h3>
        <div class="input-row">
          <input
            type="text"
            .value=${filterValue}
            placeholder="Tippe einen Suchfilter ein"
            @input=${this._handleFilterInputChange}
            @keydown=${this._onInputKeydown}
            aria-label="Filter"
          />
          <button
            class="btn ${!filterValue ? 'hidden' : ''}"
            type="button"
            @click=${() => this._updateFilterTextActual('')}
            title="Eingabe leeren"
            aria-label="Eingabe leeren"
          >
            <ha-icon icon="mdi:close-circle-outline"></ha-icon>
          </button>
          <button
            class="btn ${!showAddButton ? 'hidden' : ''}"
            type="button"
            @click=${this._addFilterTextToShoppingList}
            title="Zur Einkaufsliste hinzufügen"
            aria-label="Zur Einkaufsliste hinzufügen"
          >
            <ha-icon icon="mdi:cart-plus"></ha-icon>
          </button>
        </div>

        ${filterValue.trim()
          ? html`<div class="info">Filter: "${filterValue.trim()}" → ${displayedItems.length} Ergebnis${displayedItems.length !== 1 ? 'se' : ''}</div>`
          : totalItemsCount > (this.config.max_items_without_filter ?? 20)
          ? html`<div class="info">${displayedItems.length} von ${totalItemsCount} Einträgen</div>`
          : ''}

        ${displayedItems.length === 0
          ? html`<div class="empty-state">Keine Ergebnisse gefunden</div>`
          : html`<div role="list" aria-label="Trefferliste">${displayedItems.map((item) => this._renderItemRow(item, this._cachedSourceMap))}</div>`}
      </ha-card>
    `;
  }

  // Optional: Lovelace UI editor support
  static getConfigElement() {
    return null;
  }
  static getStubConfig() {
    return {
      title: 'ToDo List',
      filter_items_entity: 'sensor.todo_filtered_items',
      shopping_list_entity: 'todo.shopping_list',
      filter_entity: 'input_text.todo_filter',
    };
  }
}

if (!customElements.get('item-list-card')) {
  customElements.define('item-list-card', ItemListCard);
}