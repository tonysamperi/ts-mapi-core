import { SmpMarketingCloudValidators } from "./smp-marketing-cloud-validators.enum.js";

export interface SmpMarketingCloudValidationResponseOk {
  email: string;
  valid: true;
}

export interface SmpMarketingCloudValidationResponseKo {
  email: string;
  valid: boolean;
  failedValidation: SmpMarketingCloudValidators;
}

export type SmpMarketingCloudValidationResponse = SmpMarketingCloudValidationResponseOk | SmpMarketingCloudValidationResponseKo;
