import {IClient} from "../models/Client";
import {IBusiness} from "../models/Business";

export interface FlowContext {
  business: IBusiness;
  client: IClient;
  message: string;
}