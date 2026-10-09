import { Injectable, effect, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { AuthService } from "./auth.service";
import { OrganizationsService } from "./organizations.service";

@Injectable({ providedIn: "root" })
export class DocumentTitleService {
  private title = inject(Title);
  private auth = inject(AuthService);
  private organizations = inject(OrganizationsService);

  constructor() {
    effect(() => {
      const icon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (this.auth.isPlatformAdmin()) {
        this.title.setTitle("Platform");
        if (icon) icon.href = "assets/mark.svg";
        return;
      }
      const org = this.organizations.current();
      this.title.setTitle(org?.name ? org.name : "Workplace");
      if (icon) icon.href = org?.iconUrl || "assets/mark.svg";
    });
  }
}
