export const userPayloadSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "username"],
  properties: {
    id: { type: "integer" },
    username: { type: "string" },
  },
} as const;

export const feedbackRecordSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "title", "body", "author", "receiver"],
  properties: {
    id: { type: "integer" },
    title: { type: "string" },
    body: { type: "string" },
    author: userPayloadSchema,
    receiver: userPayloadSchema,
  },
} as const;

export const feedbackListSchema = {
  type: "array",
  items: feedbackRecordSchema,
} as const;
