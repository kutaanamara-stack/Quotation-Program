import { useState } from "react";

const MOBILE_ENTRY_URL =
  "https://kutaanamara-stack.github.io/Quotation-Program/mobile.html";

const SHARE_TITLE = "\u9910\u5177\u4fee\u590d\u62a5\u4ef7\u5de5\u5177";
const SHARE_TEXT =
  "\u8bf7\u6253\u5f00\u8fd9\u4e2a\u76f4\u8fbe\u94fe\u63a5\u4f7f\u7528\u62a5\u4ef7\u5de5\u5177\u3002";

export function ShareLinkPanel() {
  const [message, setMessage] = useState("");

  async function shareMobileLink() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: SHARE_TITLE,
          text: SHARE_TEXT,
          url: MOBILE_ENTRY_URL
        });
        setMessage("\u5df2\u6253\u5f00\u7cfb\u7edf\u5206\u4eab\u9762\u677f\u3002");
        return;
      }

      await navigator.clipboard.writeText(MOBILE_ENTRY_URL);
      setMessage("\u5df2\u590d\u5236\u76f4\u8fbe\u94fe\u63a5\uff0c\u53ef\u4ee5\u7c98\u8d34\u53d1\u7ed9\u540c\u4e8b\u3002");
    } catch {
      setMessage("\u8bf7\u624b\u52a8\u590d\u5236\u4e0b\u65b9\u76f4\u8fbe\u94fe\u63a5\u53d1\u7ed9\u540c\u4e8b\u3002");
    }
  }

  return (
    <section className="panel share-panel">
      <h2>{"\u5458\u5de5\u624b\u673a\u76f4\u8fbe\u94fe\u63a5"}</h2>
      <p>
        {
          "\u5982\u679c\u628a\u5f53\u524d\u9875\u9762\u76f4\u63a5\u8f6c\u53d1\u540e\u522b\u4eba\u6253\u4e0d\u5f00\uff0c\u8bf7\u7528\u4e0b\u9762\u8fd9\u4e2a\u6309\u94ae\u5206\u4eab\u6216\u590d\u5236\u56fa\u5b9a\u76f4\u8fbe\u94fe\u63a5\u3002"
        }
      </p>
      <a href={MOBILE_ENTRY_URL} target="_blank" rel="noreferrer">
        {MOBILE_ENTRY_URL}
      </a>
      <button type="button" onClick={() => void shareMobileLink()}>
        {"\u4e00\u952e\u590d\u5236/\u5206\u4eab\u5458\u5de5\u94fe\u63a5"}
      </button>
      {message ? <p className="share-message">{message}</p> : null}
      <p className="share-note">
        {
          "\u5fae\u4fe1\u91cc\u6253\u4e0d\u5f00\u65f6\uff0c\u8bf7\u70b9\u53f3\u4e0a\u89d2\u9009\u62e9\u201c\u5728\u6d4f\u89c8\u5668\u6253\u5f00\u201d\u3002"
        }
      </p>
    </section>
  );
}
