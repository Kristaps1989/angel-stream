/**
 * Hard rule 3: personal fields are never logged. These paths are redacted by
 * the Fastify (pino) logger wherever they appear in a logged object, and
 * request bodies are not logged at all.
 */
export const PERSONAL_FIELDS = [
  "donor_name",
  "donorName",
  "donor_city",
  "donorCity",
  "recipient",
  "wish",
  "greeting_text",
  "greetingText",
  "email",
] as const;

export const redactPaths: string[] = [
  ...PERSONAL_FIELDS.flatMap((field) => [field, `*.${field}`, `*.*.${field}`]),
  "req.headers.authorization",
  "req.headers.cookie",
  'req.headers["x-internal-secret"]',
];
