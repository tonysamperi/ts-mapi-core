import { SmpMarketingCloudValidators } from "./smp-marketing-cloud-validators.enum.js";

export interface KikMarketingCloudValidationResponseOk {
  email: string;
  valid: true;
}

export interface KikMarketingCloudValidationResponseKo {
  email: string;
  valid: boolean;
  failedValidation: SmpMarketingCloudValidators;
}

export type KikMarketingCloudValidationResponse = KikMarketingCloudValidationResponseOk | KikMarketingCloudValidationResponseKo;
