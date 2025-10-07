"use client";

import Swal from "sweetalert2";
import { Payment } from "@/types/admin/simpanan";

/**
 * Modal instruksi pembayaran bergaya kartu (balloons, checkmark, CTA besar).
 * - Menangani QRIS & VA.
 * - No. VA bisa di-copy.
 * - Tombol CTA menyesuaikan channel (QRIS / nama bank).
 */
export async function showPaymentInstruction(payment: Payment): Promise<void> {
  const isQris = payment.payment_type === "qris" || payment.channel === "qris";

  const amount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(payment.amount);

  const expiredLabel = new Date(payment.expired_at).toLocaleString("id-ID");

  // Illo confetti+balloons (SVG kecil biar portable)
  const balloonsSVG = encodeURIComponent(`
    <svg width="420" height="120" viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fill-rule="evenodd" opacity=".2">
        <circle cx="42" cy="34" r="26" fill="#F6C453"/>
        <circle cx="132" cy="20" r="10" fill="#60A5FA"/>
        <circle cx="212" cy="30" r="6" fill="#EF4444"/>
        <circle cx="340" cy="36" r="22" fill="#A78BFA"/>
        <circle cx="390" cy="18" r="8" fill="#10B981"/>
        <circle cx="270" cy="14" r="5" fill="#F59E0B"/>
        <circle cx="180" cy="12" r="7" fill="#34D399"/>
      </g>
    </svg>
  `);

  const styles = `
    .pay-card{border-radius:16px;background:#fff;overflow:hidden;border:1px solid #e5e7eb}
    .pay-hero{background-image:url("data:image/svg+xml;utf8,${balloonsSVG}");
      background-repeat:no-repeat;background-position:top center;background-size:cover;
      padding:28px 16px 10px; display:flex;flex-direction:column;align-items:center;gap:8px}
    .pay-check{width:46px;height:46px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900}
    .pay-title{font-size:16px;font-weight:700;color:#374151}
    .pay-sub{font-size:13px;color:#6B7280;text-align:center}
    .pay-body{padding:16px}
    .pay-price{display:flex;align-items:baseline;gap:6px;justify-content:center;margin:8px 0 2px}
    .pay-amount{font-size:28px;font-weight:800;color:#059669}
    .pay-meta{font-size:12px;color:#6B7280;text-align:center}
    .pay-grid{margin-top:12px;border-top:1px dashed #e5e7eb;padding-top:12px;display:grid;gap:8px}
    .row{display:flex;justify-content:space-between;gap:12px}
    .k{color:#6B7280;font-size:12px}
    .v{font-weight:600;font-size:14px;color:#111827;word-break:break-word}
    .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#F3F4F6;padding:6px 8px;border-radius:8px}
    .copy-wrap{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .copy-btn{border-radius:8px;border:1px solid #e5e7eb;background:#F9FAFB;padding:6px 10px;font-size:12px;font-weight:600;cursor:pointer}
    .copy-btn:hover{background:#F3F4F6}
    .cta{display:block;width:100%;margin-top:14px;background:#2563EB;color:#fff;border:none;border-radius:9999px;padding:12px 16px;font-weight:800;font-size:15px}
    .cta:hover{background:#1D4ED8}
    .cta .brand{font-weight:900}
    .qris-box{display:flex;justify-content:center;margin:12px 0}
    .qris-img{max-width:260px;width:100%;border:1px solid #e5e7eb;border-radius:12px}
  `;

  const qrisHtml = `
    <div class="pay-card">
      <div class="pay-hero">
        <div class="pay-check">✓</div>
        <div class="pay-title">Selamat!</div>
        <div class="pay-sub">Instruksi pembayaran siap</div>
      </div>
      <div class="pay-body">
        <div class="pay-price">
          <div class="pay-amount">${amount}</div>
        </div>
        <div class="pay-meta">Batas bayar: ${expiredLabel}</div>

        <div class="pay-grid">
          <div class="row"><div class="k">Order ID</div><div class="v">${payment.order_id}</div></div>
          <div class="qris-box"><img src="${payment.account_number}" alt="QRIS" class="qris-img" /></div>
          <div class="pay-meta">Scan QR dengan aplikasi pembayaran yang mendukung QRIS.</div>
        </div>

        <button type="button" class="cta" id="cta-btn">
          Bayar dengan <span class="brand">QRIS</span>
        </button>
      </div>
    </div>
  `;

  const vaHtml = `
    <div class="pay-card">
      <div class="pay-hero">
        <div class="pay-check">✓</div>
        <div class="pay-title">Instruksi Pembayaran</div>
        <div class="pay-sub">Transfer ke Virtual Account</div>
      </div>
      <div class="pay-body">
        <div class="pay-price">
          <div class="pay-amount">${amount}</div>
        </div>
        <div class="pay-meta">Batas bayar: ${expiredLabel}</div>

        <div class="pay-grid">
          <div class="row"><div class="k">Bank</div><div class="v">${payment.channel.toUpperCase()}</div></div>
          <div class="row">
            <div class="k">No. VA</div>
            <div class="v copy-wrap">
              <span id="va-number" class="code">${payment.account_number}</span>
              <button id="copy-va" class="copy-btn" type="button">Copy</button>
            </div>
          </div>
          <div class="row"><div class="k">Order ID</div><div class="v">${
            payment.order_id
          }</div></div>
        </div>

        <button type="button" class="cta" id="cta-btn">
          Bayar via <span class="brand">${payment.channel.toUpperCase()}</span>
        </button>
      </div>
    </div>
  `;

  await Swal.fire({
    title: "", // biar header swal kosong
    html: `<style>${styles}</style>${isQris ? qrisHtml : vaHtml}`,
    showConfirmButton: false,
    showCloseButton: true,
    width: 420,
    willOpen: () => {
      // Set tinggi close button sedikit turun
      const close = document.querySelector(
        ".swal2-close"
      ) as HTMLElement | null;
      if (close) close.style.top = "6px";
    },
    didOpen: () => {
      // Copy VA
      if (!isQris) {
        const btn = document.getElementById("copy-va");
        const va = document.getElementById("va-number")?.textContent ?? "";
        if (btn) {
          btn.addEventListener("click", async () => {
            try {
              await navigator.clipboard.writeText(va);
              const original = btn.textContent ?? "Copy";
              btn.textContent = "Disalin!";
              setTimeout(() => (btn.textContent = original), 1200);
            } catch {
              // fallback
              const area = document.createElement("textarea");
              area.value = va;
              document.body.appendChild(area);
              area.select();
              document.execCommand("copy");
              document.body.removeChild(area);
              const original = btn.textContent ?? "Copy";
              btn.textContent = "Disalin!";
              setTimeout(() => (btn.textContent = original), 1200);
            }
          });
        }
      }

      // CTA (kamu bisa ganti behavior ini sesuai kebutuhan)
      const cta = document.getElementById("cta-btn");
      if (cta) {
        cta.addEventListener("click", () => {
          // Untuk VA: otomatis copy lagi biar gampang
          if (!isQris) {
            const va = document.getElementById("va-number")?.textContent ?? "";
            navigator.clipboard?.writeText(va).catch(() => {});
          }
          Swal.close();
        });
      }
    },
  });
}