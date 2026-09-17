import { buildLemonOverlayCheckoutUrl } from "../lib/lemon-public";
import { orderIdFromUnknown, sanitizeOrderId } from "../lib/pass-unlock";

function fail(message: string): never {
  throw new Error(message);
}

const slugUrl = buildLemonOverlayCheckoutUrl(
  "12345",
  "my-store",
  "https://bts-seoul-pilgrimage.vercel.app/pass/success",
);
if (!slugUrl.startsWith("https://my-store.lemonsqueezy.com/checkout/buy/12345?")) {
  fail(`bad slug url ${slugUrl}`);
}
if (!slugUrl.includes("embed=1") || !slugUrl.includes("dark=1")) {
  fail(`overlay flags missing ${slugUrl}`);
}

const numericUrl = buildLemonOverlayCheckoutUrl(
  "12345",
  "99",
  "https://example.com/pass/success",
);
if (!numericUrl.startsWith("https://lemonsqueezy.com/checkout/buy/12345?")) {
  fail(`bad numeric-store url ${numericUrl}`);
}

if (sanitizeOrderId("abc_12") !== "abc_12" || sanitizeOrderId("../x") !== null) {
  fail("order id sanitize");
}

const fromEvent = orderIdFromUnknown({
  type: "orders",
  id: "42",
  attributes: { status: "paid" },
});
if (fromEvent !== "42") {
  fail(`event order id ${fromEvent}`);
}

process.stdout.write("lemon-url-smoke ok\n");
