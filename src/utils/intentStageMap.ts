import { ClientStage } from "../models/Client";

export const intentToStageMap: Record<string, ClientStage> = {
  booking: "booking",
  updating: "updating",
  canceling: "canceling",
};
