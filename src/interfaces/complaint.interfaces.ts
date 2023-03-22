import { ObjectId } from "mongoose";

export interface TComplaint {
  subject: string;
  details: string;
  images: string[];
  sender: ObjectId;
  category?: string;
  receiver?: string;
  priority: string;
  anonymity: boolean;
}
