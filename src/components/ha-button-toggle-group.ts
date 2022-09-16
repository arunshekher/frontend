import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, queryAll } from "lit/decorators";
import { styleMap } from "lit/directives/style-map";
import { fireEvent } from "../common/dom/fire_event";
import type { ToggleButton } from "../types";
import { HaButton } from "./ha-button";
import "./ha-icon-button";

@customElement("ha-button-toggle-group")
export class HaButtonToggleGroup extends LitElement {
  @property({ attribute: false }) public buttons!: ToggleButton[];

  @property() public active?: string;

  @property({ type: Boolean }) public fullWidth = false;

  @property({ type: Boolean }) public dense = false;

  @queryAll("ha-button") private _buttons?: HaButton[];

  protected render(): TemplateResult {
    return html`
      <div>
        ${this.buttons.map((button) =>
          button.iconPath
            ? html`<ha-icon-button
                .label=${button.label}
                .path=${button.iconPath}
                .value=${button.value}
                ?active=${this.active === button.value}
                @click=${this._handleClick}
              ></ha-icon-button>`
            : html`<ha-button
                style=${styleMap({
                  width: this.fullWidth
                    ? `${100 / this.buttons.length}%`
                    : "initial",
                })}
                outlined
                .dense=${this.dense}
                .value=${button.value}
                ?active=${this.active === button.value}
                @click=${this._handleClick}
                >${button.label}</ha-button
              >`
        )}
      </div>
    `;
  }

  protected updated() {
    // Work around Safari default margin that is not reset in ha-button as of aug 2021
    this._buttons?.forEach(async (button) => {
      await button.updateComplete;
      (
        button.shadowRoot!.querySelector("button") as HTMLButtonElement
      ).style.margin = "0";
    });
  }

  private _handleClick(ev): void {
    this.active = ev.currentTarget.value;
    fireEvent(this, "value-changed", { value: this.active });
  }

  static get styles(): CSSResultGroup {
    return css`
      div {
        display: flex;
        --mdc-icon-button-size: var(--button-toggle-size, 36px);
        --mdc-icon-size: var(--button-toggle-icon-size, 20px);
      }
      ha-button {
        --mdc-shape-small: 0;
        --mdc-button-outline-width: 1px 0 1px 1px;
      }
      ha-icon-button {
        border: 1px solid var(--primary-color);
        border-right-width: 0px;
      }
      ha-icon-button,
      ha-button {
        position: relative;
        cursor: pointer;
      }
      ha-icon-button::before,
      ha-button::before {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        position: absolute;
        background-color: currentColor;
        opacity: 0;
        pointer-events: none;
        content: "";
        transition: opacity 15ms linear, background-color 15ms linear;
      }
      ha-icon-button[active]::before,
      ha-button[active]::before {
        opacity: var(--mdc-icon-button-ripple-opacity, 0.12);
      }
      ha-icon-button:first-child,
      ha-button:first-child {
        --mdc-shape-small: 4px 0 0 4px;
        border-radius: 4px 0 0 4px;
      }
      ha-icon-button:last-child,
      ha-button:last-child {
        border-radius: 0 4px 4px 0;
        border-right-width: 1px;
        --mdc-shape-small: 0 4px 4px 0;
        --mdc-button-outline-width: 1px;
      }
      ha-icon-button:only-child,
      ha-button:only-child {
        --mdc-shape-small: 4px;
        border-right-width: 1px;
      }

      :host([dir="rtl"]) ha-icon-button:first-child,
      :host([dir="rtl"]) ha-button:first-child {
        border-radius: 0 4px 4px 0;
        border-right-width: 1px;
        --mdc-shape-small: 0 4px 4px 0;
        --mdc-button-outline-width: 1px;
      }
      :host([dir="rtl"]) ha-icon-button:last-child,
      :host([dir="rtl"]) ha-button:last-child {
        --mdc-shape-small: 4px 0 0 4px;
        border-radius: 4px 0 0 4px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-button-toggle-group": HaButtonToggleGroup;
  }
}
