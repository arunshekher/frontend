import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../../common/dom/fire_event";
import "../../components/ha-button";
import { DataEntryFlowStepAbort } from "../../data/data_entry_flow";
import { domainToName } from "../../data/integration";
import { showAddApplicationCredentialDialog } from "../../panels/config/application_credentials/show-dialog-add-application-credential";
import { HomeAssistant } from "../../types";
import { showConfirmationDialog } from "../generic/show-dialog-box";
import { showConfigFlowDialog } from "./show-dialog-config-flow";
import { DataEntryFlowDialogParams } from "./show-dialog-data-entry-flow";
import { configFlowContentStyles } from "./styles";

@customElement("step-flow-abort")
class StepFlowAbort extends LitElement {
  @property({ attribute: false }) public params!: DataEntryFlowDialogParams;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public step!: DataEntryFlowStepAbort;

  @property({ attribute: false }) public domain!: string;

  protected firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    if (this.step.reason === "missing_credentials") {
      this._handleMissingCreds();
    }
  }

  protected render(): TemplateResult {
    if (this.step.reason === "missing_credentials") {
      return html``;
    }
    return html`
      <h2>${this.hass.localize(`component.${this.domain}.title`)}</h2>
      <div class="content">
        ${this.params.flowConfig.renderAbortDescription(this.hass, this.step)}
      </div>
      <div class="buttons">
        <ha-button @click=${this._flowDone}
          >${this.hass.localize(
            "ui.panel.config.integrations.config_flow.close"
          )}</ha-button
        >
      </div>
    `;
  }

  private async _handleMissingCreds() {
    const confirm = await showConfirmationDialog(this, {
      title: this.hass.localize(
        "ui.panel.config.integrations.config_flow.missing_credentials",
        {
          integration: domainToName(this.hass.localize, this.domain),
        }
      ),
    });
    this._flowDone();
    if (!confirm) {
      return;
    }
    // Prompt to enter credentials and restart integration setup
    showAddApplicationCredentialDialog(this.params.dialogParentElement!, {
      selectedDomain: this.domain,
      applicationCredentialAddedCallback: () => {
        showConfigFlowDialog(this.params.dialogParentElement!, {
          dialogClosedCallback: this.params.dialogClosedCallback,
          startFlowHandler: this.domain,
          showAdvanced: this.hass.userData?.showAdvanced,
        });
      },
    });
  }

  private _flowDone(): void {
    fireEvent(this, "flow-update", { step: undefined });
  }

  static get styles(): CSSResultGroup {
    return configFlowContentStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "step-flow-abort": StepFlowAbort;
  }
}
