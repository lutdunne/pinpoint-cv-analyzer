export const DAILY_LIMIT = 3;
export const FREE_PREVIEW_LIMIT = 2;

export const ALLOWED_MODELS = ["gpt-4o-mini", "gpt-4o"];
export const DEFAULT_MODEL = "gpt-4o-mini";

export function resolveModel(requestedModel) {
    if (requestedModel && ALLOWED_MODELS.includes(requestedModel)) {
        return requestedModel;
    }
    return DEFAULT_MODEL;
}
