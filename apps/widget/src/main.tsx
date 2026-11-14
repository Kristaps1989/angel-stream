import { render } from "preact";
import { normaliseApiBase } from "./config";
import "./styles.css";

interface BlockProps {
  apiBase: string;
}

// M0 shell only. The two cards and the order flow are ported from
// design/prototype.html in M2.
function Block(_props: BlockProps) {
  return (
    <section class="angel-stream" aria-labelledby="angel-stream-title">
      <h2 id="angel-stream-title" class="angel-stream__title">
        Pasūti dziesmu ar sveicienu Eņģeļu straumē
      </h2>
    </section>
  );
}

export function mount(host: HTMLElement): void {
  render(<Block apiBase={normaliseApiBase(host.dataset.api)} />, host);
}

const host = document.getElementById("angel-stream");
if (host) mount(host);
