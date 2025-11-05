// Types for Gemini API module
type GenAIModule = {
  Type: {
    OBJECT: unknown;
    STRING: unknown;
    ARRAY: unknown;
  };
};

/**
 * Build JSON schema for structured output (compatible with both APIs)
 */
export const buildResponseSchema = (Type?: GenAIModule['Type']) => {
  const isObject = (val: unknown): boolean =>
    val === 'object' || val === Type?.OBJECT;
  const isString = (val: unknown): boolean =>
    val === 'string' || val === Type?.STRING;
  const isArray = (val: unknown): boolean =>
    val === 'array' || val === Type?.ARRAY;

  return {
    type: isObject(Type?.OBJECT) ? Type?.OBJECT : 'object',
    properties: {
      title: {
        type: isString(Type?.STRING) ? Type?.STRING : 'string',
        description:
          'A concise, descriptive title for the note, 50-100 characters. Must be informative and not generic like "Untitled" or "Note".',
        minLength: 10,
        maxLength: 100,
      },
      summary: {
        type: isString(Type?.STRING) ? Type?.STRING : 'string',
        description:
          "A detailed summary of the note's content, 2-4 sentences, 100-300 characters. CRITICAL: Must be exactly 100-300 characters. Should capture key points and be informative, not just a restatement. Always provide meaningful context and essential information.",
        minLength: 100,
        maxLength: 300,
      },
      categories: {
        type: isArray(Type?.ARRAY) ? Type?.ARRAY : 'array',
        items: {
          type: isString(Type?.STRING) ? Type?.STRING : 'string',
        },
        description:
          'An array of 2-3 strings representing a hierarchical category path in PascalCase. Example: ["Programming", "Web Development", "React"]. Keep it concise and consistent.',
        minItems: 1,
        maxItems: 3,
      },
      tags: {
        type: isArray(Type?.ARRAY) ? Type?.ARRAY : 'array',
        items: {
          type: isString(Type?.STRING) ? Type?.STRING : 'string',
        },
        description:
          'An array of up to 5 concise, 1-2 word, context-aware, non-redundant, lowercase organizational tags. Must be distinct from category names. Examples: ["react", "tutorial", "javascript"].',
        minItems: 0,
        maxItems: 5,
      },
      icon: {
        type: isString(Type?.STRING) ? Type?.STRING : 'string',
        description:
          'An icon name suggestion that matches the content type and primary category. Must be one of: "lightbulb" (ideas/notes/thoughts), "link" (links/URLs/bookmarks), "code" (programming/development/technical), "shopping-cart" (shopping/personal/purchases), or "default" (all other content types). The icon must match the primary category path element.',
      },
      rationale: {
        type: isString(Type?.STRING) ? Type?.STRING : 'string',
        description:
          'A brief, one-sentence explanation for the chosen category and categorization approach.',
        minLength: 10,
        maxLength: 200,
      },
    },
    required: ['title', 'summary', 'categories', 'tags', 'icon', 'rationale'],
  };
};
