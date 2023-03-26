import { Schema, model, InferSchemaType } from "mongoose";
import { TComplaint } from "@interfaces/complaint.interfaces";

const { ObjectId } = Schema.Types;

const complaintModel = new Schema(
  {
    subject: {
      type: String,
      required: [true, "What is the subject of this complaint"],
      maxlength: 20,
    },
    details: {
      type: String,
      required: [true, "What is the details of this complaint"],
      maxlength: 280,
    },
    images: {
      type: [String],
    },
    sender: {
      type: ObjectId,
      ref: "User",
      required: [true, "Who is the sender of this complaint"],
    },
    category: {
      type: String,
    },
    receiver: {
      type: String,
    },
    reassigned_to: {
      type: String,
    },
    priority: {
      type: String,
      default: "medium",
      enum: ["low", "medium", "high"],
    },
    anonymity: {
      type: Boolean,
      default: false,
    },
    university: {
      type: String,
      required: [
        true,
        "You must add the university this complaint is coming from.",
      ],
    },
  },
  { timestamps: true }
);

export type TComplaintModel = InferSchemaType<typeof complaintModel>;

export default model<InferSchemaType<typeof complaintModel> & TComplaint>(
  "Complaint",
  complaintModel
);
