import { FaBuilding, FaChartBar, FaEnvelope, FaExclamationTriangle, FaShieldAlt, FaCheckCircle, FaFileAlt } from "react-icons/fa";
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
            <span>Benchmark Period: <strong>Q3 2026 Active Index</strong></span>
            <span>Governance Contact: <strong>enterprise@consumertrust.in</strong></span>
          </div>
        </div>

        <div className="legal-disclaimer-banner">
          <FaExclamationTriangle />
          <div>
            <strong>Independent Community Benchmark Notice:</strong> Scores, turnaround times, and resolution rates displayed across the Brand Leaderboard are community benchmarks compiled from user-submitted dispute records, verified enterprise resolution responses, and public nodal disclosures under Consumer Protection (E-Commerce) Rules 2020. They do not constitute an official government audit, rating by statutory bodies, or judicial finding.
          </div>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Purpose of the Brand Trust Index</h2>
            <p>
              The Brand Trust Index is designed to foster transparency in consumer grievance handling, highlight enterprises with exemplary customer service, and encourage rapid, voluntary dispute resolution across key consumer sectors in India (E-Commerce, Banking & UPI, Food Delivery, Telecom, Travel, and Consumer Electronics).
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Primary Data Sources & Transparency</h2>
            <p>
              Every data point published in our quarterly scorecard is derived from four verified sources:
            </p>
            <ul>
              <li><strong>Verified Complainant Submissions:</strong> Citizen-filed disputes backed by valid order IDs, transaction references, or purchase invoices. Unsubstantiated claims are excluded from public index tallies.</li>
              <li><strong>Enterprise Resolution Responses:</strong> Direct resolution confirmations submitted by corporate nodal officers through our secure 1-click tokenized resolution desk.</li>
              <li><strong>Public Statutory Disclosures:</strong> Official corporate grievance officer contact emails and escalation timelines published pursuant to the Consumer Protection Act, 2019, RBI Ombudsman guidelines, and TRAI regulations.</li>
              <li><strong>Post-Resolution Citizen Surveys:</strong> Ratings (1–5 stars) provided directly by consumers once their case is marked resolved by the respective enterprise.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Scoring Algorithm & Metric Computation</h2>
            <p>
              Each enterprise score is computed using a weighted composite index based on four distinct operational metrics:
            </p>
            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Weight</th>
                    <th>Description & Computation Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Redressal Rate (%)</strong></td>
                    <td>40%</td>
                    <td>Percentage of registered complaints against the enterprise that reached verified voluntary settlement (refund, replacement, service rectification) within 30 days.</td>
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
                    <td>Verification status of corporate grievance desk (active email acknowledgment, automated webhooks, and 1-click token utilization).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. Confidence Limits & Statistical Disclaimers</h2>
            <p>
              Users and enterprises should interpret the Brand Trust Index subject to the following considerations:
            </p>
            <ul>
              <li><strong>Voluntary Nature:</strong> Metrics reflect cases handled voluntarily through our independent platform and do not encompass off-platform internal support tickets or statutory court proceedings.</li>
              <li><strong>Sample Size Minimums:</strong> Scores are only published for enterprises with a minimum of 20 verified dispute dockets within the current rolling quarter.</li>
              <li><strong>Non-Judicial Determination:</strong> A lower score does not signify a legal violation, nor does a high score guarantee an outcome in any specific individual consumer dispute.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Enterprise Rights & Data Correction Protocol</h2>
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
            <h2>6. Enterprise Takedown & Nodal Contact Update Protocol</h2>
            <p>
              Corporate representatives, compliance teams, or designated grievance officers may update contact details or request an audit of listed records through this formal workflow:
            </p>
            <ol>
              <li>Send an email from an official corporate domain (e.g., <code>compliance@yourcompany.com</code>) to <a href="mailto:enterprise@consumertrust.in">enterprise@consumertrust.in</a> with CC to <a href="mailto:legal@consumertrust.in">legal@consumertrust.in</a>.</li>
              <li>Specify your organization name, designated grievance officer details, and the specific data point, metric, or case ID in question.</li>
              <li>Attach official documentation verifying the updated nodal officer appointment or evidentiary rebuttal for dispute audit.</li>
              <li>Our enterprise verification desk will review and process valid corrections within <strong>2 business days</strong>.</li>
            </ol>
          </section>

          <section className="legal-section">
            <h2>7. Contact the Enterprise Governance Cell</h2>
            <div className="contact-info-cards">
              <div className="contact-info-card">
                <h4><FaEnvelope /> Enterprise Relations Desk</h4>
                <p>For nodal desk updates, partner integration, and data audits.</p>
                <a href="mailto:enterprise@consumertrust.in">enterprise@consumertrust.in</a>
              </div>
              <div className="contact-info-card">
                <h4><FaShieldAlt /> Legal & Compliance Cell</h4>
                <p>For formal compliance inquiries and statutory notices.</p>
                <a href="mailto:legal@consumertrust.in">legal@consumertrust.in</a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
