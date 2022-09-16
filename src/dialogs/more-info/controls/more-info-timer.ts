import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-attributes";
import "../../../components/ha-button";
import { TimerEntity } from "../../../data/timer";
import { HomeAssistant } from "../../../types";

@customElement("more-info-timer")
class MoreInfoTimer extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public stateObj?: TimerEntity;

  protected render(): TemplateResult {
    if (!this.hass || !this.stateObj) {
      return html``;
    }

    return html`
      <div class="actions">
        ${this.stateObj.state === "idle" || this.stateObj.state === "paused"
          ? html`
              <ha-button .action=${"start"} @click=${this._handleActionClick}>
                ${this.hass!.localize("ui.card.timer.actions.start")}
              </ha-button>
            `
          : ""}
        ${this.stateObj.state === "active"
          ? html`
              <ha-button .action=${"pause"} @click=${this._handleActionClick}>
                ${this.hass!.localize("ui.card.timer.actions.pause")}
              </ha-button>
            `
          : ""}
        ${this.stateObj.state === "active" || this.stateObj.state === "paused"
          ? html`
              <ha-button .action=${"cancel"} @click=${this._handleActionClick}>
                ${this.hass!.localize("ui.card.timer.actions.cancel")}
              </ha-button>
              <ha-button .action=${"finish"} @click=${this._handleActionClick}>
                ${this.hass!.localize("ui.card.timer.actions.finish")}
              </ha-button>
            `
          : ""}
      </div>
      <ha-attributes
        .hass=${this.hass}
        .stateObj=${this.stateObj}
        extra-filters="remaining,restore"
      ></ha-attributes>
    `;
  }

  private _handleActionClick(e: MouseEvent): void {
    const action = (e.currentTarget as any).action;
    this.hass.callService("timer", action, {
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
    "more-info-timer": MoreInfoTimer;
  }
}
