declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    COMMENT_RATE_SALT?: string;
  }
}
