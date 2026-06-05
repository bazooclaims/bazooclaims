import type { CompanyProfile } from "@/types/admin";

export function defaultCompanyProfile(): CompanyProfile {
  return {
    legalName: "Bazoo Accident Management",
    tradingName: "Bazoo Claims",
    addressLines: ["Enter your registered office address in Admin → Settings"],
    city: "",
    postcode: "",
    country: "United Kingdom",
    phone: "",
    email: "",
    website: "",
    vatNumber: "",
    companyNumber: "",
    logoPath: "/logo-bazoo.png",
  };
}
