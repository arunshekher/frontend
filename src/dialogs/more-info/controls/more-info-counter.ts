import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-button";
import { UNAVAILABLE_STATES } from "../../../data/entity";
import { HomeAssistant } from "../../../types";

@customElement("more-info-counter")
class MoreInfoCounter extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public stateObj?: HassEntity;

  protected render(): TemplateResult {
    if (!this.hass || !this.stateObj) {
      return html``;
    }

    const disabled = UNAVAILABLE_STATES.includes(this.stateObj!.state);

    return html`
      <div class="actions">
        <ha-button
          .action=${"increment"}
          @click=${this._handleActionClick}
          .disabled=${disabled}
        >
          ${this.hass!.localize("ui.card.counter.actions.increment")}
        </ha-button>
        <ha-button
          .action=${"decrement"}
          @click=${this._handleActionClick}
          .disabled=${disabled}
        >
          ${this.hass!.localize("ui.card.counter.actions.decrement")}
        </ha-button>
        <ha-button
          .action=${"reset"}
          @click=${this._handleActionClick}
          .disabled=${disabled}
        >
          ${this.hass!.localize("ui.card.counter.actions.reset")}
        </ha-button>
      </div>
    `;
  }

  private _handleActionClick(e: MouseEvent): void {
    const action = (e.currentTarget as any).action;
    this.hass.callService("counter", action, {
      entity_id: this.stateObj!.entity_id,
    });
  }

  static get styles(): CSSResultGroup {
    return css`
      .actions {
        margin: 8px 0;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-counter": MoreInfoCounter;
  }
}
