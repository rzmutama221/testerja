'use client';

import { useState } from 'react';

/**
 * FAQ Section — Landing Page
 *
 * Accordion Q&A dengan pertanyaan umum.
 */

const faqs = [
  {
    question: 'Apa itu rzdkstore?',
    answer:
      'rzdkstore adalah platform toko digital yang menjual akun premium berbagai layanan streaming, aplikasi kreatif, AI tools, dan utilitas dengan harga terjangkau dan bergaransi.',
  },
  {
    question: 'Bagaimana cara membeli produk?',
    answer:
      'Cukup daftar akun, pilih produk yang diinginkan, tunggu persetujuan admin, bayar via QRIS, dan produk akan langsung tersedia di dashboard Anda.',
  },
  {
    question: 'Apakah semua produk bergaransi?',
    answer:
      'Ya, semua produk kami bergaransi. Durasi garansi bervariasi per produk — ada yang full garansi sesuai durasi, ada juga yang 7 hari. Detail garansi tertera di masing-masing varian produk.',
  },
  {
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer:
      'Saat ini kami menerima pembayaran via QRIS statis (bisa scan dari semua e-wallet dan mobile banking). Payment gateway juga tersedia sebagai opsi tambahan.',
  },
  {
    question: 'Berapa lama proses setelah pembayaran?',
    answer:
      'Untuk produk tipe AUTO, produk langsung aktif setelah pembayaran terverifikasi. Untuk produk manual, proses biasanya kurang dari 30 menit di jam operasional.',
  },
  {
    question: 'Bagaimana jika ada masalah dengan produk?',
    answer:
      'Anda bisa langsung klaim garansi melalui dashboard. Tim kami akan review dan proses penggantian atau perpanjangan masa aktif sesuai kebijakan garansi.',
  },
  {
    question: 'Apakah aman berbelanja di sini?',
    answer:
      'Sangat aman. Data Anda terenkripsi, semua transaksi tercatat di sistem, dan kami sudah melayani ratusan customer dengan tingkat kepuasan tinggi.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-dark-card/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-heading-2 text-white mb-3">
            Pertanyaan Umum
          </h2>
          <p className="text-body-base text-muted-foreground">
            Jawaban untuk pertanyaan yang sering ditanyakan
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-dark-border rounded-xl overflow-hidden bg-dark"
            >
              {/* Question */}
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-dark-card/50 transition-colors"
              >
                <span className="font-heading text-body-sm font-medium text-white pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-body-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
