import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
} from "@angular/core";
import { AuthService } from "../services/auth.service";

@Directive({
  selector: "[appHasPermission]",
  standalone: true,
})
export class HasPermissionDirective {
  private auth = inject(AuthService);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private rendered = false;
  private required: string | string[] = [];

  @Input() set appHasPermission(value: string | string[]) {
    this.required = value;
    this.render();
  }

  constructor() {
    effect(() => {
      this.auth.permissions();
      this.render();
    });
  }

  private render(): void {
    const allowed = Array.isArray(this.required)
      ? this.auth.hasAnyPermission(this.required)
      : this.auth.hasPermission(this.required);

    if (allowed && !this.rendered) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.rendered = true;
    } else if (!allowed && this.rendered) {
      this.viewContainer.clear();
      this.rendered = false;
    }
  }
}
