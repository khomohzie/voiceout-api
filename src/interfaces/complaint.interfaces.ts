import { ObjectId } from "mongoose";

export interface TComplaint {
  subject: string;
  details: string;
  images: string[];
  sender: ObjectId;
  category?: string;
  receiver?: string;
  reassigned_to?: string;
  priority: string;
  anonymity: boolean;
}
