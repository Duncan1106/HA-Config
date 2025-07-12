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
    if (!config?.entity || !config?.target_entity) {
      throw new Error("You must define both 'entity' and 'target_entity' in the card config");
    }
    this.config = config;
  }

  shouldUpdate(changedProps) {
    if (changedProps.has('hass')) {
      const oldHass = changedProps.get('hass');
      if (!oldHass) return true;

      const sensorEntity = this.hass.states[this.config.entity];
      const todoEntity = this.hass.states[this.config.target_entity];

      const oldSensor = oldHass.states?.[this.config.entity];
      const oldTodo = oldHass.states?.[this.config.target_entity];

      const sensorChanged = JSON.stringify(sensorEntity?.attributes?.filtered_items) !== JSON.stringify(oldSensor?.attributes?.filtered_items);
      const todoChanged = JSON.stringify(todoEntity) !== JSON.stringify(oldTodo);

      return sensorChanged || todoChanged;
    }
    return false;
  }

  render() {
    if (!this.hass || !this.hass.states[this.config.entity]) {
      return html`<ha-card><div class="empty-state">Entity not found</div></ha-card>`;
    }

    const entity = this.hass.states[this.config.entity];

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

    if (!items.length) {
      return html`<ha-card><div class="empty-state">No items found</div></ha-card>`;
    }

    return html`
      <ha-card>
        <h3>${this.config.title || 'Todo List'}</h3>
        <div>
          ${items.map(item => html`
            <div class="item-row">
              <div class="item-summary" title="${item.summary}">${item.summary}</div>
              <div class="item-controls">
                ${this._isNumeric(item.description) ? html`
                  <button class="btn" title="Decrease" aria-label="Decrease" @click=${() => this._updateOrCompleteItem(item.uid, { description: parseInt(item.description, 10) - 1 })}>
                    <ha-icon icon="mdi:minus-circle-outline"></ha-icon>
                  </button>
                  <div class="quantity">${item.description}</div>
                  <button class="btn" title="Increase" aria-label="Increase" @click=${() => this._updateOrCompleteItem(item.uid, { description: parseInt(item.description, 10) + 1 })}>
                    <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
                  </button>
                ` : html`
                  <div class="quantity">${item.description}</div>
                `}
                <button class="btn" title="Complete" aria-label="Complete" @click=${() => this._updateOrCompleteItem(item.uid, { status: 'completed' })}>
                  <ha-icon icon="mdi:check"></ha-icon>
                </button>
              </div>
            </div>
          `)}
        </div>
      </ha-card>
    `;
  }

  _isNumeric(str) {
    return /^\d+$/.test(str);
  }

  _updateOrCompleteItem(uid, updates) {
    const data = {
      entity_id: this.config.target_entity,
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
}

customElements.define('item-list-card', ItemListCard);
