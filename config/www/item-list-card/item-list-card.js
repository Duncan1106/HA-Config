import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

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
  `;

  setConfig(config) {
    if (!config?.entity || !config?.shopping_list_entity || !config?.filter_entity) {
      throw new Error("You must define 'entity', 'shopping_list_entity', AND 'filter_entity' in the card config");
    }
    this.config = config;
  }

  shouldUpdate(changedProps) {
    if (changedProps.has('hass')) {
      const oldHass = changedProps.get('hass');
      if (!oldHass) return true;

      const sensorEntity = this.hass.states[this.config.entity];
      const filterEntity = this.hass.states[this.config.filter_entity];

      const oldSensor = oldHass.states?.[this.config.entity];
      const oldFilter = oldHass.states?.[this.config.filter_entity];

      const sensorChanged = JSON.stringify(sensorEntity?.attributes?.filtered_items) !== JSON.stringify(oldSensor?.attributes?.filtered_items);
      const mapChanged = JSON.stringify(sensorEntity?.attributes?.source_map) !== JSON.stringify(oldSensor?.attributes?.source_map);
      const filterChanged = filterEntity?.state !== oldFilter?.state;

      return sensorChanged || mapChanged || filterChanged;
    }
    return false;
  }

  render() {
    if (!this.hass || !this.hass.states[this.config.entity]) {
      return html`<ha-card><div class="empty-state">Entity not found</div></ha-card>`;
    }

    const entity = this.hass.states[this.config.entity];
    const filterValue = this.hass.states[this.config.filter_entity]?.state || '';

    // max items to show when no filter is applied, default 20
    const maxItemsWithoutFilter = this.config.max_items_without_filter ?? 20;
    
    const showAddButton = filterValue.length > 3;

    let items = [];
    try {
      const attr = entity.attributes.filtered_items;
      if (Array.isArray(attr)) {
        items = attr;
      } else if (typeof attr === 'string') {
        items = JSON.parse(attr);
      }
    } catch (e) {
      return html`<ha-card><div class="empty-state">Error parsing items</div></ha-card>`;
    }

    let sourceMap = {};
    try {
      const mapAttr = entity.attributes.source_map;
      if (typeof mapAttr === 'string') {
        sourceMap = JSON.parse(mapAttr);
      } else if (typeof mapAttr === 'object') {
        sourceMap = mapAttr;
      }
    } catch (e) {
      console.error('Error parsing source_map attribute:', e);
    }

    const totalItemsCount = this.hass.states[this.config.entity]?.state;
    let displayedItems = items;

    // If no filter text, limit items to maxItemsWithoutFilter
    if (!filterValue.trim()) {
      displayedItems = items.slice(0, maxItemsWithoutFilter);
    }

    return html`
      <ha-card>
        <h3 style="text-align: center; font-size: 1.5em;">${this.config.title || 'ToDo List'}</h3>
        <div class="input-row">
          <input
            type="text"
            .value=${filterValue}
            placeholder="Tippe einen Suchfilter ein"
            @input=${(e) => this._updateFilterText(e.target.value)}
          />
          <button
            class="btn ${filterValue.length <= 3 ? 'hidden' : ''}"
            @click=${this._addFilterTextToShoppingList}
            title="Zur Einkaufsliste hinzufügen"
          >
            <ha-icon icon="mdi:cart-plus"></ha-icon>
          </button>
        </div>

        ${!filterValue.trim() && totalItemsCount > maxItemsWithoutFilter
          ? html`<div class="info">Showing ${displayedItems.length} of ${totalItemsCount} items. Use filter to see more.</div>`
          : ''}

        ${displayedItems.length === 0
          ? html`<div class="empty-state">No items found</div>`
          : html`
              <div>
                ${displayedItems.map(
                  (item) => html`
                    <div class="item-row">
                      <div class="item-summary" title="${item.s}">
                        ${item.s}
                      </div>
                      <div class="item-controls">
                        ${this._isNumeric(item.d)
                          ? html`
                              ${parseInt(item.d, 10) > 1
                                ? html`
                                    <button
                                      class="btn"
                                      title="Decrease"
                                      aria-label="Decrease"
                                      @click=${() =>
                                        this._updateOrCompleteItem(item.u, {
                                          description:
                                            parseInt(item.d, 10) - 1,
                                        }, item.c, sourceMap)}
                                    >
                                      <ha-icon icon="mdi:minus-circle-outline"></ha-icon>
                                    </button>
                                  `
                                : ''}
                              <div class="quantity">${item.d}</div>
                              <button
                                class="btn"
                                title="Increase"
                                aria-label="Increase"
                                @click=${() =>
                                  this._updateOrCompleteItem(item.u, {
                                    description:
                                      parseInt(item.d, 10) + 1,
                                  }, item.c, sourceMap)}
                              >
                                <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
                              </button>
                            `
                          : html`
                              <div class="quantity">${item.d}</div>
                            `}
                        <button
                          class="btn"
                          title="Zur Einkaufsliste"
                          aria-label="Zur Einkaufsliste"
                          @click=${() => this._addToShoppingList(item, sourceMap)}
                        >
                          <ha-icon icon="mdi:cart-outline"></ha-icon>
                        </button>
                        <button
                          class="btn"
                          title="Complete"
                          aria-label="Complete"
                          @click=${() => this._confirmAndComplete(item, sourceMap)}
                        >
                          <ha-icon icon="mdi:check"></ha-icon>
                        </button>
                      </div>
                    </div>
                  `
                )}
              </div>
            `}
      </ha-card>
    `;
  }


  _isNumeric(str) {
    return /^\d+$/.test(str);
  }

  _updateFilterText(value) {
    this.hass.callService('input_text', 'set_value', {
      entity_id: this.config.filter_entity,
      value,
    }).catch(err => console.error("Error updating filter text:", err));
  }

  _addFilterTextToShoppingList = () => {
    const value = this.hass.states[this.config.filter_entity]?.state || '';
    if (!value.trim()) return;

    if (confirm(`Möchtest du "${value}" zur Einkaufsliste hinzufügen?`)) {
      this.hass.callService('todo', 'add_item', {
        entity_id: this.config.shopping_list_entity,
        item: value,
        description: '',
      }).catch(err => console.error("Error adding search term to shopping list:", err));
    }
  }

  _updateOrCompleteItem(uid, updates, source, sourceMap) {
    const entityId = sourceMap?.[source?.toString()] || this.config.shopping_list_entity;

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

    console.log("Calling todo/update_item with:", data);

    this.hass.callService('todo', 'update_item', data)
      .catch(err => console.error("Error calling todo/update_item:", err));
  }

  _confirmAndComplete(item, sourceMap) {
    if (confirm(`Möchtest du "${item.s}" wirklich als erledigt markieren?`)) {
      this._updateOrCompleteItem(item.u, { status: 'completed' }, item.source, sourceMap);

      const isZero = this._isNumeric(item.d) && parseInt(item.d, 10) === 0;
      if (isZero) this._addToShoppingList(item, sourceMap);
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
        })
        .then(() => console.log('Added to shopping list:', item.s, 'entity:', entityId))
        .catch(err => console.error('Fehler beim Hinzufügen zur Einkaufsliste:', err));
      }
    }
}

customElements.define('item-list-card', ItemListCard);
