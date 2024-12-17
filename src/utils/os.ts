// Fetch environment variable or fallback to default
export function getEnvVar(key: string, fallback: string = "", prefix='CRGPT_'): string {
    return process.env[`${prefix}${key}`] || process.env[key] || fallback;
  }
  