import { getOffer, updateOffer } from '@/lib/db'

interface PitchPageProps {
  params: {
    token: string
  }
}

export default async function PitchPage({ params }: PitchPageProps) {
  const offer = getOffer(params.token)

  if (!offer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600">Diese Offerte existiert nicht oder wurde gelöscht.</p>
        </div>
      </div>
    )
  }

  if (!offer.viewed_at) {
    updateOffer(offer.id, { viewed_at: new Date().toISOString() })
  }

  const totalPrice = offer.services.reduce((sum, s) => sum + s.price, 0)

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return (
    <html lang="de">
      <head>
        <title>{offer.title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html { scroll-behavior: smooth; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111827; line-height: 1.6; }
          .hero {
            background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
            padding: 120px 20px;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
            position: relative;
            overflow: hidden;
          }
          .hero::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%);
            border-radius: 50%;
          }
          .hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
          .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: #2563EB;
            color: white;
            border-radius: 12px;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 24px;
          }
          h1 { font-size: 48px; font-weight: 900; color: #111827; margin-bottom: 16px; line-height: 1.1; }
          .subtitle { font-size: 24px; color: #6b7280; margin-bottom: 24px; }
          .date { font-size: 14px; color: #9ca3af; }

          .section { padding: 80px 20px; max-width: 900px; margin: 0 auto; }
          .section h2 { font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 32px; }
          .description { font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 32px; }

          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          .services-table th {
            background: #f3f4f6;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
            color: #374151;
          }
          .services-table td {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            color: #111827;
          }
          .services-table .price { text-align: right; font-weight: 600; }
          .services-table tr:last-child td { border-bottom: none; }
          .total-row { background: #f3f4f6; font-weight: 700; font-size: 18px; }

          .timeline {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            gap: 24px;
            margin: 32px 0;
            padding: 32px;
            background: #f9fafb;
            border-radius: 12px;
          }
          .timeline-date { text-align: center; }
          .timeline-date-label { font-size: 12px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
          .timeline-date-value { font-size: 20px; font-weight: 700; color: #111827; }
          .timeline-arrow { text-align: center; color: #d1d5db; font-size: 24px; }

          .cta-section {
            padding: 60px 20px;
            background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%);
            color: white;
            text-align: center;
          }
          .cta-section h2 { color: white; margin-bottom: 32px; }
          .cta-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn {
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-block;
            border: none;
            cursor: pointer;
          }
          .btn-primary {
            background: white;
            color: #2563EB;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          }
          .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          footer {
            padding: 32px 20px;
            text-align: center;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
          }

          .valid-until {
            padding: 20px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
            margin: 32px 0;
            color: #92400e;
          }
          .valid-until strong { font-weight: 700; }

          @media (max-width: 768px) {
            h1 { font-size: 32px; }
            .subtitle { font-size: 18px; }
            .section { padding: 40px 20px; }
            .section h2 { font-size: 24px; }
            .timeline { grid-template-columns: 1fr; }
            .timeline-arrow { display: none; }
            .cta-buttons { flex-direction: column; }
            .btn { width: 100%; }
          }

          @media print {
            .cta-section { page-break-before: always; }
            body { color: #000; }
            a { color: #000; text-decoration: underline; }
          }
        `}</style>
      </head>
      <body>
        <div className="hero">
          <div className="hero-content">
            <div className="logo">VP</div>
            <h1>{offer.title}</h1>
            {offer.subtitle && <p className="subtitle">{offer.subtitle}</p>}
            <p className="date">
              Erstellt am {formatDate(offer.created_at)}
            </p>
          </div>
        </div>

        {offer.description && (
          <section className="section">
            <h2>Das Projekt</h2>
            <div className="description">{offer.description}</div>
          </section>
        )}

        {offer.services.length > 0 && (
          <section className="section">
            <h2>Leistungen & Investition</h2>
            <table className="services-table">
              <thead>
                <tr>
                  <th>Leistung</th>
                  <th className="price">Investition</th>
                </tr>
              </thead>
              <tbody>
                {offer.services.map((service, idx) => (
                  <tr key={idx}>
                    <td>{service.name}</td>
                    <td className="price">CHF {service.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total</td>
                  <td className="price">CHF {totalPrice.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {(offer.timeline_start || offer.timeline_end) && (
          <section className="section">
            <h2>Timeline</h2>
            <div className="timeline">
              <div className="timeline-date">
                <div className="timeline-date-label">Start</div>
                <div className="timeline-date-value">
                  {offer.timeline_start
                    ? new Intl.DateTimeFormat('de-CH', {
                        day: 'numeric',
                        month: 'short',
                      }).format(new Date(offer.timeline_start))
                    : 'TBD'}
                </div>
              </div>
              <div className="timeline-arrow">→</div>
              <div className="timeline-date">
                <div className="timeline-date-label">Abschluss</div>
                <div className="timeline-date-value">
                  {offer.timeline_end
                    ? new Intl.DateTimeFormat('de-CH', {
                        day: 'numeric',
                        month: 'short',
                      }).format(new Date(offer.timeline_end))
                    : 'TBD'}
                </div>
              </div>
            </div>
          </section>
        )}

        {offer.valid_until && (
          <section className="section">
            <div className="valid-until">
              <strong>Gültig bis:</strong> {formatDate(offer.valid_until)}
            </div>
          </section>
        )}

        <section className="cta-section">
          <h2>Nächste Schritte</h2>
          <div className="cta-buttons">
            <a href={`mailto:?subject=Offerte: ${offer.title}&body=Ich interessiere mich für die Offerte: ${offer.title}`} className="btn btn-primary">
              Jetzt annehmen
            </a>
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Termin vereinbaren
            </a>
          </div>
        </section>

        <footer>
          <p>Erstellt mit Video CRM</p>
        </footer>
      </body>
    </html>
  )
}
