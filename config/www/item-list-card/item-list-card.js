import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

// Simple debounce utility function
const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

class ItemListCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
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
      padding: 6px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 4px;
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
    }

    .input-row .btn:hover {
      color: var(--accent-color, #03a9f4);
    }

    .item-row {
      display: flex;
      align-items: center;
      padding: 4px 0;
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
      -webkit-user-select: text; /* Safari */
      -moz-user-select: text; /* Firefox */
      -ms-user-select: text; /* IE10+ */
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
    }

    .btn:hover {
      color: var(--accent-color, #03a9f4);
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
  `;

  constructor() {
    super();
    this._debouncedUpdateFilterText = debounce(this._updateFilterTextActual.bind(this), 200);
  }

  setConfig(config) {
    if (!config?.filter_items_entity || !config?.shopping_list_entity || !config?.filter_entity) {
      throw new Error("You must define 'filter_items_entity', 'shopping_list_entity', AND 'filter_entity' in the card config");
    }
    this.config = {
      ...config,
      show_origin: config.show_origin ?? false,
    };
  }

  shouldUpdate(changedProps) {
    if (changedProps.has('hass')) {
      const oldHass = changedProps.get('hass');
      if (!oldHass) return true;

      const filterItemsEntity = this.hass.states[this.config.filter_items_entity];
      const filterEntity = this.hass.states[this.config.filter_entity];

      const oldFilterItemsEntity = oldHass.states?.[this.config.filter_items_entity];
      const oldFilterEntity = oldHass.states?.[this.config.filter_entity];

      const sensorChanged = JSON.stringify(filterItemsEntity?.attributes?.filtered_items) !== JSON.stringify(oldFilterItemsEntity?.attributes?.filtered_items);
      const mapChanged = JSON.stringify(filterItemsEntity?.attributes?.source_map) !== JSON.stringify(oldFilterItemsEntity?.attributes?.source_map);
      const filterChanged = filterEntity?.state !== oldFilterEntity?.state;

      return sensorChanged || mapChanged || filterChanged;
    }
    return false;
  }

  _isNumeric(str) {
    return /^\d+$/.test(str);
  }

  // This is the actual function that calls the Home Assistant service
  _updateFilterTextActual(value) {
    this.hass.callService('input_text', 'set_value', {
      entity_id: this.config.filter_entity,
      value,
    }).catch(err => console.error("Error updating filter text:", err));
  }

  // This method will be called on every input event, but it calls the debounced version
  _handleFilterInputChange(e) {
    this._debouncedUpdateFilterText(e.target.value);
  }

  _addFilterTextToShoppingList = () => {
    let raw = this.hass.states[this.config.filter_entity]?.state || '';
    if (!raw.trim()) return;

    let value = raw.trim();

    // Remove "todo:xyz" part if it's at the beginning
    if (value.startsWith('todo:')) {
      const parts = value.split(' ');
      if (parts.length > 1) {
        parts.shift(); // remove "todo:xyz"
        value = parts.join(' ');
      } else {
        // Just "todo:xyz" alone is not a valid item to add
        return;
      }
    }

    if (confirm(`Möchtest du "${value}" zur Einkaufsliste hinzufügen?`)) {
      this.hass.callService('todo', 'add_item', {
        entity_id: this.config.shopping_list_entity,
        item: value,
        description: '',
      }).catch(err => console.error("Error adding search term to shopping list:", err));
    }
  }

  _updateOrCompleteItem(uid, updates, source, sourceMap) {
    const entityId = sourceMap?.[source?.toString()];
    if (!entityId) {
      console.error('No valid todo entity id for source:', source);
      return;
    }

    const data = {
      entity_id: entityId,
      item: uid,
      ...updates,
    };

    if (updates.description !== undefined) {
      let desc = parseInt(updates.description, 10);
      if (isNaN(desc) || desc < 0) desc = 0;
      data.description = desc.toString();
    }

    this.hass.callService('todo', 'update_item', data)
      .catch(err => console.error("Error calling todo/update_item:", err));
  }

  _confirmAndComplete(item, sourceMap) {
    if (confirm(`Möchtest du "${item.s}" wirklich als erledigt markieren?`)) {
      this._updateOrCompleteItem(item.u, { status: 'completed' }, item.c, sourceMap);
    }
  }

  _addToShoppingList(item) {
    const entityId = this.config.shopping_list_entity;
    if (!entityId) {
      console.error('No valid shopping list entity id configured');
      return;
    }

    if (confirm(`Möchtest du "${item.s}" zur Einkaufsliste hinzufügen?`)) {
      this.hass.callService('todo', 'add_item', {
        entity_id: entityId,
        item: item.s,
        description: item.d?.toString() ?? '',
      }).catch(err => console.error('Fehler beim Hinzufügen zur Einkaufsliste:', err));
    }
  }

  _renderQuantityControls(item, sourceMap) {
    const quantity = parseInt(item.d, 10);
    if (!this._isNumeric(item.d)) {
      return html`<div class="quantity">${item.d}</div>`;
    }
    return html`
      ${quantity > 1
        ? html`<button class="btn" title="Decrease" @click=${() => this._updateOrCompleteItem(item.u, { description: quantity - 1 }, item.c, sourceMap)}><ha-icon icon="mdi:minus-circle-outline"></ha-icon></button>`
        : ''}
      <div class="quantity">${item.d}</div>
      <button class="btn" title="Increase" @click=${() => this._updateOrCompleteItem(item.u, { description: quantity + 1 }, item.c, sourceMap)}><ha-icon icon="mdi:plus-circle-outline"></ha-icon></button>
    `;
  }

  _renderItemRow(item, sourceMap) {
      const showOrigin = this.config?.show_origin;
      const sourceId = sourceMap?.[item.c?.toString()];
      const friendlyName = showOrigin && sourceId
        ? this.hass.states[sourceId]?.attributes?.friendly_name
        : null;
    
      return html`
        <div class="item-row">
          <div class="item-summary" title="${item.s}">
            ${item.s}
            ${friendlyName ? html`<div class="item-sublabel">${friendlyName}</div>` : ''}
          </div>
          <div class="item-controls">
            ${this._renderQuantityControls(item, sourceMap)}
            <button class="btn" title="Zur Einkaufsliste" @click=${() => this._addToShoppingList(item, sourceMap)}><ha-icon icon="mdi:cart-outline"></ha-icon></button>
            <button class="btn" title="Complete" @click=${() => this._confirmAndComplete(item, sourceMap)}><ha-icon icon="mdi:check"></ha-icon></button>
          </div>
        </div>
      `;
  }

  render() {
    if (!this.hass) {
      return html`<ha-card><div class="empty-state">Home Assistant context not available</div></ha-card>`;
    }

    if (!this.hass.states[this.config.filter_items_entity]) {
      return html`<ha-card><div class="empty-state">Entity '${this.config.filter_items_entity}' not found</div></ha-card>`;
    }

    const filterItemsEntity = this.hass.states[this.config.filter_items_entity];
    const filterValue = this.hass.states[this.config.filter_entity]?.state || '';
    const maxItemsWithoutFilter = this.config.max_items_without_filter ?? 20;
    const showAddButton = filterValue.length > 3;

    let items = [];
    try {
      const attr = filterItemsEntity.attributes.filtered_items;
      items = typeof attr === 'string' ? JSON.parse(attr) : Array.isArray(attr) ? attr : [];
    } catch {
      return html`<ha-card><div class="empty-state">Fehler beim Laden der Einträge</div></ha-card>`;
    }

    let sourceMap = {};
    try {
      const mapAttr = filterItemsEntity.attributes.source_map;
      sourceMap = typeof mapAttr === 'string' ? JSON.parse(mapAttr) : typeof mapAttr === 'object' ? mapAttr : {};
    } catch (e) {
      console.error('Error parsing source_map attribute:', e);
    }

    const totalItemsCount = parseInt(filterItemsEntity?.state, 10) || 0;
    const displayedItems = !filterValue.trim() ? items.slice(0, maxItemsWithoutFilter) : items;

    return html`
      <ha-card>
        <h3 class="card-title">${this.config.title || 'ToDo List'}</h3>
        <div class="input-row">
          <input
            type="text"
            .value=${filterValue}
            placeholder="Tippe einen Suchfilter ein"
            @input=${this._handleFilterInputChange}
          />
          <button
            class="btn ${!showAddButton ? 'hidden' : ''}"
            @click=${this._addFilterTextToShoppingList}
            title="Zur Einkaufsliste hinzufügen"
          >
            <ha-icon icon="mdi:cart-plus"></ha-icon>
          </button>
        </div>

        ${filterValue.trim()
          ? html`<div class="info">Filter: "${filterValue.trim()}" → ${displayedItems.length} Ergebnis${displayedItems.length !== 1 ? 'se' : ''}</div>`
          : totalItemsCount > maxItemsWithoutFilter
          ? html`<div class="info">${displayedItems.length} von ${totalItemsCount} Einträgen</div>`
          : ''}

        ${displayedItems.length === 0
          ? html`<div class="empty-state">Keine Ergebnisse gefunden</div>`
          : html`${displayedItems.map((item) => this._renderItemRow(item, sourceMap))}`}
      </ha-card>
    `;
  }
}

customElements.define('item-list-card', ItemListCard);