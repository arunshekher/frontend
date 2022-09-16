import { ButtonBase } from "@material/mwc-button/mwc-button-base";
import { styles } from "@material/mwc-button/styles.css";
import { css } from "lit";
import { customElement } from "lit/decorators";

@customElement("ha-button")
export class HaButton extends ButtonBase {
  static override styles = [
    styles,
    css`
      // TODO : add custom style
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-button": HaButton;
  }
}
