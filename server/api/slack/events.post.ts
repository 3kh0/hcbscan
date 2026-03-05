import {
  verifySlackSignature,
  resolveUnfurl,
  postUnfurl,
} from "../../utils/slack-unfurl";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const token = config.slackBotToken as string;
  const secret = config.slackSigningSecret as string;

  if (!token || !secret) {
    throw createError({
      statusCode: 500,
      statusMessage: "slack not setup",
    });
  }

  const rawBody = await readRawBody(event);
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: "Empty body" });
  }

  const ts = getHeader(event, "x-slack-request-timestamp") || "";
  const sig = getHeader(event, "x-slack-signature") || "";
  if (!verifySlackSignature(secret, ts, rawBody, sig)) {
    throw createError({ statusCode: 401, statusMessage: "Invalid signature" });
  }

  const body = JSON.parse(rawBody);

  if (body.type === "url_verification") {
    return { challenge: body.challenge };
  }

  if (body.event?.type === "link_shared") {
    const { channel, message_ts, links } = body.event;

    event.waitUntil(
      (async () => {
        const unfurls: Record<string, { blocks: unknown[] }> = {};
        await Promise.all(
          (links as Array<{ url: string }>).map(async ({ url }) => {
            const b = await resolveUnfurl(url);
            if (b) unfurls[url] = { blocks: b };
          })
        );
        if (Object.keys(unfurls).length) {
          await postUnfurl(token, channel, message_ts, unfurls);
        }
      })()
    );
  }

  return { ok: true };
});
