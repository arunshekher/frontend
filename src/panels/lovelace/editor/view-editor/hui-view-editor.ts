import "../../../../components/ha-form/ha-form";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { fireEvent } from "../../../../common/dom/fire_event";
import { slugify } from "../../../../common/string/slugify";
import type { LocalizeFunc } from "../../../../common/translations/localize";
import type { SchemaUnion } from "../../../../components/ha-form/types";
import type { LovelaceViewConfig } from "../../../../data/lovelace";
import type { HomeAssistant } from "../../../../types";
import {
  DEFAULT_VIEW_LAYOUT,
  PANEL_VIEW_LAYOUT,
  SIDEBAR_VIEW_LAYOUT,
} from "../../views/const";

declare global {
  interface HASSDomEvents {
    "view-config-changed": {
      config: LovelaceViewConfig;
    };
  }
}

@customElement("hui-view-editor")
export class HuiViewEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public isNew!: boolean;

  @state() private _config!: LovelaceViewConfig;

  private _suggestedPath = false;

  private _schema = memoizeOne(
    (localize: LocalizeFunc, childView: boolean) =>
      [
        { name: "title", selector: { text: {} } },
        {
          name: "icon",
          selector: {
            icon: {},
          },
        },
        { name: "path", selector: { text: {} } },
        { name: "theme", selector: { theme: {} } },
        {
          name: "type",
          selector: {
            select: {
              options: (
                [
                  DEFAULT_VIEW_LAYOUT,
                  SIDEBAR_VIEW_LAYOUT,
                  PANEL_VIEW_LAYOUT,
                ] as const
              ).map((type) => ({
                value: type,
                label: localize(
                  `ui.panel.lovelace.editor.edit_view.types.${type}`
                ),
              })),
            },
          },
        },
        {
          name: "child_view",
          selector: {
            boolean: {},
          },
        },
        ...(childView
          ? [
              {
                name: "back_path",
                selector: { text: {} },

                description: {
                  suggested_value:
                    "Back path only apply when the view is a child view",
                },
              },
            ]
          : []),
      ] as const
  );

  set config(config: LovelaceViewConfig) {
    this._config = config;
  }

  get _type(): string {
    if (!this._config) {
      return DEFAULT_VIEW_LAYOUT;
    }
    return this._config.panel
      ? PANEL_VIEW_LAYOUT
      : this._config.type || DEFAULT_VIEW_LAYOUT;
  }

  protected render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    const schema = this._schema(
      this.hass.localize,
      this._config.child_view ?? false
    );
    const data = {
      theme: "Backend-selected",
      ...this._config,
      type: this._type,
    };

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${schema}
        .computeLabel=${this._computeLabelCallback}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value as LovelaceViewConfig;

    if (config.type === "masonry") {
      delete config.type;
    }
    if (!config.child_view) {
      delete config.back_path;
    }

    if (
      this.isNew &&
      !this._suggestedPath &&
      config.title &&
      (!this._config.path ||
        config.path === slugify(this._config.title || "", "-"))
    ) {
      config.path = slugify(config.title, "-");
    }

    fireEvent(this, "view-config-changed", { config });
  }

  private _computeLabelCallback = (
    schema: SchemaUnion<ReturnType<typeof this._schema>>
  ) => {
    switch (schema.name) {
      case "path":
        return this.hass!.localize("ui.panel.lovelace.editor.card.generic.url");
      case "type":
        return this.hass.localize("ui.panel.lovelace.editor.edit_view.type");
      case "child_view":
        return this.hass.localize(
          "ui.panel.lovelace.editor.edit_view.child_view"
        );
      case "back_path":
        return this.hass.localize(
          "ui.panel.lovelace.editor.edit_view.back_path"
        );
      default:
        return this.hass!.localize(
          `ui.panel.lovelace.editor.card.generic.${schema.name}`
        );
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-view-editor": HuiViewEditor;
  }
}
