'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EarningsCalculator() {
  const [likes, setLikes] = useState(100);
  const [comments, setComments] = useState(25);
  const [shares, setShares] = useState(10);
  const [hasNFT, setHasNFT] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(0.75);
  const [postsPerMonth, setPostsPerMonth] = useState(20);

  // Calculate earnings
  const calculate = () => {
    const likePts = likes * 1;
    const commentPts = comments * 5;
    const sharePts = shares * 20;
    const baseQuality = likePts + commentPts + sharePts;

    let finalQuality = baseQuality;
    const bonus = hasNFT ? baseQuality * 0.5 : 0;
    if (hasNFT) {
      finalQuality = baseQuality * 1.5;
    }

    const usdCents = finalQuality * 10; // $0.10 per point
    const tokenPriceCents = tokenPrice * 100;
    const tokens = usdCents / tokenPriceCents;
    const usdValue = tokens * tokenPrice;

    const monthlyTokenTotal = tokens * postsPerMonth;
    const monthlyUsdTotal = usdValue * postsPerMonth;

    return {
      likePts,
      commentPts,
      sharePts,
      baseQuality,
      bonus,
      tokens: Math.round(tokens),
      usdValue,
      monthlyTokenTotal: Math.round(monthlyTokenTotal),
      monthlyUsdTotal,
    };
  };

  const results = calculate();

  return (
    <div className="earnings-calculator-page">
      <style jsx>{`
        .earnings-calculator-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FBB03B 100%);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calculator-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 800px;
          width: 100%;
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }

        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .header .subtitle {
          font-size: 1.2em;
          opacity: 0.95;
        }

        .calculator-body {
          padding: 40px 30px;
        }

        .section {
          margin-bottom: 35px;
        }

        .section-title {
          font-size: 1.3em;
          color: #FF6B35;
          margin-bottom: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .formula-explanation {
          background: #fff5e6;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
          border-left: 4px solid #FF6B35;
        }

        .formula-explanation h3 {
          color: #FF6B35;
          margin-bottom: 10px;
        }

        .formula {
          font-family: 'Courier New', monospace;
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
          font-weight: bold;
        }

        .slider-group {
          margin-bottom: 25px;
        }

        .slider-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 1.1em;
        }

        .slider-label .icon {
          font-size: 1.5em;
        }

        .slider-label .value {
          font-weight: bold;
          color: #FF6B35;
          font-size: 1.3em;
          min-width: 80px;
          text-align: right;
        }

        input[type="range"] {
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: #e0e0e0;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255,107,53,0.4);
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(255,107,53,0.4);
        }

        .toggle-group {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .toggle-switch {
          position: relative;
          width: 60px;
          height: 30px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 30px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(30px);
        }

        .toggle-label {
          font-size: 1.1em;
          font-weight: 600;
        }

        .price-input {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 10px;
        }

        .price-input input {
          flex: 1;
          padding: 10px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1.1em;
          font-weight: 600;
        }

        .price-input input:focus {
          outline: none;
          border-color: #FF6B35;
        }

        .results {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin-top: 30px;
        }

        .results-title {
          font-size: 1.5em;
          margin-bottom: 20px;
          text-align: center;
        }

        .calculation-breakdown {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .calc-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .calc-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 1.2em;
          padding-top: 15px;
        }

        .earnings-display {
          text-align: center;
          padding: 30px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }

        .earnings-display .label {
          font-size: 1.2em;
          opacity: 0.9;
          margin-bottom: 10px;
        }

        .earnings-display .amount {
          font-size: 3.5em;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .earnings-display .usd-equivalent {
          font-size: 1.5em;
          opacity: 0.9;
        }

        .monthly-projection {
          margin-top: 20px;
          padding: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          text-align: center;
        }

        .monthly-projection .title {
          font-size: 1.1em;
          margin-bottom: 10px;
          opacity: 0.9;
        }

        .monthly-posts {
          display: flex;
          gap: 10px;
          margin: 15px 0;
          justify-content: center;
          flex-wrap: wrap;
        }

        .post-option {
          padding: 10px 20px;
          background: rgba(255,255,255,0.2);
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .post-option:hover {
          background: rgba(255,255,255,0.3);
        }

        .post-option.active {
          background: rgba(255,255,255,0.3);
          border-color: white;
        }

        .monthly-earnings {
          font-size: 2em;
          font-weight: bold;
          margin-top: 15px;
        }

        .cta-section {
          padding: 30px;
          text-align: center;
          background: #f9f9f9;
        }

        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          padding: 18px 40px;
          font-size: 1.3em;
          font-weight: bold;
          text-decoration: none;
          border-radius: 50px;
          box-shadow: 0 8px 20px rgba(255,107,53,0.3);
          transition: all 0.3s;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(255,107,53,0.4);
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 2em;
          }

          .earnings-display .amount {
            font-size: 2.5em;
          }

          .calculator-body {
            padding: 30px 20px;
          }
        }
      `}</style>

      <div className="calculator-container">
        <div className="header">
          <h1>🐘 Contentlynk Earnings Calculator</h1>
          <p className="subtitle">See what you could earn for your content</p>
        </div>

        <div className="calculator-body">
          {/* Formula Explanation */}
          <div className="formula-explanation">
            <h3>How Earnings Work:</h3>
            <div className="formula">
              Quality Score = Likes + (Comments × 5) + (Shares × 20)
            </div>
            <div className="formula">
              Your Earnings = Quality Score × $0.10 (paid in $HVNA tokens)
            </div>
            <p style={{ marginTop: '10px', color: '#666' }}>
              💡 Move the sliders below to estimate your earnings based on typical engagement
            </p>
          </div>

          {/* Engagement Inputs */}
          <div className="section">
            <h2 className="section-title">📊 Your Post Engagement</h2>

            <div className="slider-group">
              <div className="slider-label">
                <span><span className="icon">👍</span> Likes</span>
                <span className="value">{likes}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={likes}
                step="10"
                onChange={(e) => setLikes(parseInt(e.target.value))}
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span><span className="icon">💬</span> Comments</span>
                <span className="value">{comments}</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={comments}
                step="5"
                onChange={(e) => setComments(parseInt(e.target.value))}
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span><span className="icon">🔄</span> Shares</span>
                <span className="value">{shares}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={shares}
                step="1"
                onChange={(e) => setShares(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* NFT Bonus Toggle */}
          <div className="section">
            <h2 className="section-title">🎯 Creator Pass NFT Bonus</h2>
            <div className="toggle-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={hasNFT}
                  onChange={(e) => setHasNFT(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">I have Creator Pass NFT (+50% bonus)</span>
            </div>
          </div>

          {/* Token Price */}
          <div className="section">
            <h2 className="section-title">💎 $HVNA Token Price</h2>
            <div className="price-input">
              <span style={{ fontSize: '1.2em' }}>$</span>
              <input
                type="number"
                value={tokenPrice}
                step="0.01"
                min="0.01"
                max="10"
                onChange={(e) => setTokenPrice(parseFloat(e.target.value) || 0.75)}
              />
              <span style={{ color: '#999' }}>per token</span>
            </div>
          </div>

          {/* Results */}
          <div className="results">
            <h2 className="results-title">💰 Your Earnings Per Post</h2>

            <div className="calculation-breakdown">
              <div className="calc-row">
                <span>Likes (×1)</span>
                <span>{results.likePts} points</span>
              </div>
              <div className="calc-row">
                <span>Comments (×5)</span>
                <span>{results.commentPts} points</span>
              </div>
              <div className="calc-row">
                <span>Shares (×20)</span>
                <span>{results.sharePts} points</span>
              </div>
              <div className="calc-row">
                <span>Quality Score</span>
                <span>{results.baseQuality} points</span>
              </div>
              {hasNFT && (
                <div className="calc-row">
                  <span>NFT Bonus (+50%)</span>
                  <span>+{results.bonus.toFixed(1)} points</span>
                </div>
              )}
            </div>

            <div className="earnings-display">
              <div className="label">You Earn:</div>
              <div className="amount">{results.tokens} $HVNA</div>
              <div className="usd-equivalent">(~${results.usdValue.toFixed(2)})</div>
            </div>

            {/* Monthly Projection */}
            <div className="monthly-projection">
              <div className="title">📅 Monthly Earnings Projection</div>
              <p style={{ marginBottom: '10px', opacity: 0.9 }}>
                If you post consistently with similar engagement:
              </p>
              <div className="monthly-posts">
                {[10, 20, 30, 50].map((posts) => (
                  <div
                    key={posts}
                    className={`post-option ${postsPerMonth === posts ? 'active' : ''}`}
                    onClick={() => setPostsPerMonth(posts)}
                  >
                    {posts} posts/mo
                  </div>
                ))}
              </div>
              <div className="monthly-earnings">
                <span>{results.monthlyTokenTotal.toLocaleString()} $HVNA</span>
                <div style={{ fontSize: '0.6em', opacity: 0.9 }}>
                  <span>(~${results.monthlyUsdTotal.toFixed(2)}/month)</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="cta-section">
            <p style={{ fontSize: '1.2em', marginBottom: '20px', color: '#666' }}>
              Ready to start earning from your content?
            </p>
            <Link href="/" className="cta-button">
              Join Contentlynk Now →
            </Link>
            <p style={{ marginTop: '15px', color: '#999' }}>
              ✓ Zero follower requirements &nbsp; ✓ Instant payments &nbsp; ✓ 100% transparent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
