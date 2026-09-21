import { FaBuilding, FaChartBar, FaEnvelope, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import "./LegalPages.css";

export default function BrandMethodology() {
  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <div className="legal-header-badge">
            <FaChartBar /> Scoring Methodology & Enterprise Governance
          </div>
          <h1 className="legal-title">Brand Trust Index Methodology & Enterprise Policy</h1>
          <div className="legal-meta">
            <span>Scope: <strong>Enterprise Redressal Metrics & Public Scorecard</strong></span>
            <span>Policy Version: <strong>2026.2</strong></span>
            <span>Desk Contact: <strong>enterprise@consumertrust.org</strong></span>
          </div>
        </div>

        <div className="legal-disclaimer-banner">
          <FaExclamationTriangle />
          <div>
            <strong>Community Benchmark Notice:</strong> Scores and resolution metrics displayed on the Brand Leaderboard are community benchmarks compiled from user-submitted dispute records, verified enterprise resolution responses, and public nodal disclosures. They do not constitute an official government audit or statutory judicial finding.
          </div>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Purpose of the Brand Trust Index</h2>
            <p>
              The Brand Trust Index is designed to foster transparency in consumer grievance handling, highlight enterprises with exemplary customer service, and encourage rapid, voluntary dispute resolution across key consumer sectors in India (E-Commerce, Banking/Fintech, Food Delivery, Telecom, Travel, and Consumer Electronics).
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Scoring Algorithm & Metric Computation</h2>
            <p>
              Each enterprise score is computed using a weighted composite index based on four distinct operational metrics:
            </p>
            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Weight</th>
                    <th>Description & Data Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Redressal Rate (%)</strong></td>
                    <td>40%</td>
                    <td>Percentage of registered complaints against the enterprise that reached verified settlement (refund, replacement, service rectification) within 30 days.</td>
                  </tr>
                  <tr>
                    <td><strong>Resolution Turnaround (Speed)</strong></td>
                    <td>25%</td>
                    <td>Median business days elapsed between grievance docket generation and corporate resolution submission.</td>
                  </tr>
                  <tr>
                    <td><strong>Citizen Satisfaction Score (★ 1-5)</strong></td>
                    <td>25%</td>
                    <td>Average rating submitted by verified complainants post-resolution through our closing satisfaction survey.</td>
                  </tr>
                  <tr>
                    <td><strong>Nodal Responsiveness</strong></td>
                    <td>10%</td>
                    <td>Verification status of corporate grievance desk (active email acknowledgment and 1-click token utilization).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="legal-section">
            <h2>3. Enterprise Rights & Correction Protocol</h2>
            <p>
              We are committed to absolute fairness, accuracy, and constructive collaboration with all enterprises listed on our platform:
            </p>
            <ul>
              <li><strong>Right of Reply:</strong> Enterprise grievance officers can respond to any case docket directly via our tokenized 1-click resolution desk (<a href="/partner/resolve">Enterprise Resolution Desk</a>) without requiring account creation.</li>
              <li><strong>Data Correction Requests:</strong> If your organization believes any metric, case count, or nodal contact email is inaccurate or outdated, you may submit a verified correction request.</li>
              <li><strong>Spam & Defamation Defense:</strong> Disputes flagged as abusive, fraudulent, or unrelated to legitimate consumer transactions are reviewed by our moderation desk and excluded from index calculations.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Enterprise Takedown & Nodal Contact Update Protocol</h2>
            <p>
              Corporate representatives, compliance teams, or grievance officers may update contact details or request an audit of listed records:
            </p>
            <ol>
              <li>Send an email from an official corporate domain (e.g., <code>compliance@yourcompany.com</code>) to <a href="mailto:enterprise@consumertrust.org">enterprise@consumertrust.org</a>.</li>
              <li>Specify your organization name, designated grievance officer details, and the specific data point or case ID in question.</li>
              <li>Our enterprise verification desk will review and process valid updates within <strong>2 business days</strong>.</li>
            </ol>
          </section>

          <section className="legal-section">
            <h2>5. Contact the Enterprise Governance Cell</h2>
            <div className="contact-info-cards">
              <div className="contact-info-card">
                <h4><FaEnvelope /> Enterprise Relations</h4>
                <p>For nodal desk updates, partner integration, and data audits.</p>
                <a href="mailto:enterprise@consumertrust.org">enterprise@consumertrust.org</a>
              </div>
              <div className="contact-info-card">
                <h4><FaShieldAlt /> Legal & Compliance</h4>
                <p>For formal compliance inquiries and statutory notices.</p>
                <a href="mailto:legal@consumertrust.org">legal@consumertrust.org</a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
